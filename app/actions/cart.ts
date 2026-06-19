"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createPayment } from "@/lib/payment";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { shippingForDivisionDistrict } from "@/lib/shipping";
import { isValidDivisionDistrict } from "@/lib/bd-locations";

const GUEST_CART_COOKIE = "guest_cart_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function getOrCreateGuestToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!token) {
    token = crypto.randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }
  return token;
}

export type CartItemWithProduct = {
  id: string;
  qty: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    slug: string;
    images: { url: string }[];
  };
};

export async function getCart(): Promise<{ items: CartItemWithProduct[]; totalCents: number; cartId: string | null }> {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  const cookieStore = await cookies();
  const sessionToken = userId ? undefined : cookieStore.get(GUEST_CART_COOKIE)?.value;

  const cart = await db.cart.findFirst({
    where: userId ? { userId } : { sessionToken },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              slug: true,
              images: { select: { url: true }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!cart) return { items: [], totalCents: 0, cartId: null };

  const items: CartItemWithProduct[] = cart.items.map((it) => ({
    id: it.id,
    qty: it.qty,
    product: it.product as any,
  }));

  const totalCents = items.reduce((sum, it) => sum + it.product.priceCents * it.qty, 0);

  return { items, totalCents, cartId: cart.id };
}

export async function addToCartAction(formData: FormData) {
  const productId = formData.get("productId") as string;
  if (!productId) return;

  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  let sessionToken: string | undefined = undefined;
  if (!userId) {
    sessionToken = await getOrCreateGuestToken();
  }

  let cart = await db.cart.findFirst({
    where: userId ? { userId } : { sessionToken },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: userId ? { userId } : { sessionToken },
    });
  }

  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + 1 } });
  } else {
    await db.cartItem.create({ data: { cartId: cart.id, productId, qty: 1 } });
  }

  revalidatePath("/cart");
  revalidatePath("/");
}

export async function updateCartItemAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const qtyStr = formData.get("qty") as string;
  const qty = Math.max(1, parseInt(qtyStr, 10) || 1);

  await db.cartItem.update({ where: { id: itemId }, data: { qty } });

  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  await db.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/cart");
}

export async function clearCartAction() {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

  const cart = await db.cart.findFirst({
    where: userId ? { userId } : { sessionToken },
  });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  revalidatePath("/cart");
}

// Called after successful placeholder payment
export async function checkoutAction(formData: FormData) {
  "use server";

  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;
  if (!userId) {
    // For now require login for checkout (can relax later)
    return { error: "Please sign in to complete checkout" };
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

  // Merge guest cart into user cart if exists (best effort)
  if (guestToken) {
    const guestCart = await db.cart.findUnique({ where: { sessionToken: guestToken }, include: { items: true } });
    if (guestCart) {
      let userCart = await db.cart.findFirst({ where: { userId } });
      if (!userCart) {
        userCart = await db.cart.create({ data: { userId } });
      }
      for (const item of guestCart.items) {
        const existing = await db.cartItem.findUnique({ where: { cartId_productId: { cartId: userCart.id, productId: item.productId } } });
        if (existing) {
          await db.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + item.qty } });
        } else {
          await db.cartItem.create({ data: { cartId: userCart.id, productId: item.productId, qty: item.qty } });
        }
      }
      await db.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      // clear guest cookie
      cookieStore.delete(GUEST_CART_COOKIE);
    }
  }

  const { items, totalCents: subtotalCents, cartId } = await getCart();
  if (!cartId || items.length === 0) {
    return { error: "Cart is empty" };
  }

  // Read BD shipping fields
  const shipName = ((formData.get("name") as string) || "Customer").trim();
  const shipPhone = ((formData.get("phone") as string) || "").trim();
  const shipDivision = ((formData.get("division") as string) || "").trim();
  const shipDistrict = ((formData.get("district") as string) || "").trim();
  const shipArea = ((formData.get("area") as string) || "").trim() || null;
  const shipAddress = ((formData.get("address") as string) || "").trim();

  // Validate (never trust the client)
  if (!/^01[3-9]\d{8}$/.test(shipPhone)) {
    return { error: "Please provide a valid Bangladeshi mobile number" };
  }
  if (!isValidDivisionDistrict(shipDivision, shipDistrict)) {
    return { error: "Please select a valid division and district" };
  }
  if (!shipAddress) {
    return { error: "Please provide a delivery address" };
  }

  const paymentMethodRaw = (formData.get("paymentMethod") as string) || "COD";
  const paymentMethod: PaymentMethod =
    paymentMethodRaw === "BKASH"
      ? PaymentMethod.BKASH
      : paymentMethodRaw === "NAGAD"
      ? PaymentMethod.NAGAD
      : PaymentMethod.COD;

  // Shipping computed server-side from the destination district
  const shippingCents = shippingForDivisionDistrict(shipDivision, shipDistrict);
  const totalCents = subtotalCents + shippingCents;

  const order = await db.order.create({
    data: {
      userId,
      status: OrderStatus.PENDING,
      paymentMethod,
      subtotalCents,
      shippingCents,
      totalCents,
      shipName,
      shipPhone,
      shipDivision,
      shipDistrict,
      shipArea,
      shipAddress,
    },
  });

  for (const item of items) {
    await db.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.product.id,
        nameSnapshot: item.product.name,
        priceSnapshotCents: item.product.priceCents,
        qty: item.qty,
      },
    });
  }

  // Placeholder payment (COD also confirmed as PAID for this demo)
  const payment = await createPayment(totalCents, order.id);

  if (payment.success) {
    await db.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID },
    });

    // Clear the cart
    await db.cartItem.deleteMany({ where: { cartId } });

    revalidatePath("/cart");
    revalidatePath("/account/orders");

    return { success: true, orderId: order.id };
  }

  return { error: "Payment failed (placeholder)" };
}
