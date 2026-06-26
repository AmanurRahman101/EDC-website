"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createPayment } from "@/lib/payment";
import { OrderStatus, PaymentMethod, ProductStatus } from "@prisma/client";
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
    status: ProductStatus;
    stock: number;
    images: { url: string }[];
  };
};

function isPurchasable(product: { status: ProductStatus; stock: number }) {
  return (
    product.stock > 0 &&
    product.status !== ProductStatus.OUT_OF_STOCK &&
    product.status !== ProductStatus.BACKORDERED
  );
}

export async function getCart(): Promise<{ items: CartItemWithProduct[]; totalCents: number; cartId: string | null }> {
  const session = await auth();
  const userId = session?.user?.id ?? null;

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
              status: true,
              stock: true,
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
    product: it.product,
  }));

  const totalCents = items.reduce((sum, it) => sum + it.product.priceCents * it.qty, 0);

  return { items, totalCents, cartId: cart.id };
}

export async function mergeGuestCartIntoUserCart() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId) return;

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!guestToken) return;

  const guestCart = await db.cart.findUnique({
    where: { sessionToken: guestToken },
    include: { items: { include: { product: true } } },
  });

  if (!guestCart) {
    cookieStore.delete(GUEST_CART_COOKIE);
    return;
  }

  let userCart = await db.cart.findFirst({ where: { userId } });
  if (!userCart) {
    userCart = await db.cart.create({ data: { userId } });
  }

  for (const item of guestCart.items) {
    if (!isPurchasable(item.product)) continue;

    const existing = await db.cartItem.findUnique({
      where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
    });
    const nextQty = Math.min(item.product.stock, (existing?.qty || 0) + item.qty);

    if (existing) {
      await db.cartItem.update({ where: { id: existing.id }, data: { qty: nextQty } });
    } else {
      await db.cartItem.create({
        data: { cartId: userCart.id, productId: item.productId, qty: Math.min(item.product.stock, item.qty) },
      });
    }
  }

  await db.cartItem.deleteMany({ where: { cartId: guestCart.id } });
  await db.cart.delete({ where: { id: guestCart.id } });
  cookieStore.delete(GUEST_CART_COOKIE);
  revalidatePath("/cart");
}

export async function addToCartAction(formData: FormData): Promise<{ error?: string }> {
  const productId = formData.get("productId") as string;
  if (!productId) return { error: "Missing product ID" };

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { status: true, stock: true },
    });
    if (!product) return { error: "Product not found" };
    if (!isPurchasable(product)) return { error: "Product is currently unavailable" };

    const session = await auth();
    const userId = session?.user?.id ?? null;

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
      await db.cartItem.update({
        where: { id: existing.id },
        data: { qty: Math.min(product.stock, existing.qty + 1) },
      });
    } else {
      await db.cartItem.create({ data: { cartId: cart.id, productId, qty: 1 } });
    }

    revalidatePath("/cart");
    revalidatePath("/");
    return {};
  } catch (err) {
    console.error("addToCartAction failed:", err);
    return { error: "Failed to add item to cart" };
  }
}

export async function updateCartItemAction(formData: FormData): Promise<{ error?: string }> {
  const itemId = formData.get("itemId") as string;
  const qtyStr = formData.get("qty") as string;
  const qty = Math.max(1, parseInt(qtyStr, 10) || 1);

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

    const item = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: { select: { stock: true } } },
    });
    if (!item) return { error: "Cart item not found" };
    if (userId ? item.cart.userId !== userId : item.cart.sessionToken !== sessionToken) {
      return { error: "Not authorized to modify this cart item" };
    }

    await db.cartItem.update({
      where: { id: itemId },
      data: { qty: Math.min(qty, Math.max(1, item.product.stock)) },
    });

    revalidatePath("/cart");
    return {};
  } catch (err) {
    console.error("updateCartItemAction failed:", err);
    return { error: "Failed to update cart item" };
  }
}

export async function removeCartItemAction(formData: FormData): Promise<{ error?: string }> {
  const itemId = formData.get("itemId") as string;

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

    const item = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) return { error: "Cart item not found" };
    if (userId ? item.cart.userId !== userId : item.cart.sessionToken !== sessionToken) {
      return { error: "Not authorized to remove this cart item" };
    }

    await db.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/cart");
    return {};
  } catch (err) {
    console.error("removeCartItemAction failed:", err);
    return { error: "Failed to remove cart item" };
  }
}

export async function clearCartAction(): Promise<{ error?: string }> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

    const cart = await db.cart.findFirst({
      where: userId ? { userId } : { sessionToken },
    });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    revalidatePath("/cart");
    return {};
  } catch (err) {
    console.error("clearCartAction failed:", err);
    return { error: "Failed to clear cart" };
  }
}

// Called after successful placeholder payment
export async function checkoutAction(formData: FormData) {
  "use server";

  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId) {
    return { error: "Please sign in to complete checkout" };
  }

  try {
    await mergeGuestCartIntoUserCart();
  } catch (err) {
    console.error("Failed to merge guest cart:", err);
    // Continue with checkout even if merge fails
  }

  const { items, totalCents: subtotalCents, cartId } = await getCart();
  if (!cartId || items.length === 0) {
    return { error: "Cart is empty" };
  }
  const unavailable = items.find((item) => !isPurchasable(item.product));
  if (unavailable) {
    return { error: `${unavailable.product.name} is no longer available` };
  }
  const overStock = items.find((item) => item.qty > item.product.stock);
  if (overStock) {
    return { error: `${overStock.product.name} only has ${overStock.product.stock} left in stock` };
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

  try {
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
      await db.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.qty } },
      });
    }

    // Placeholder payment (COD also confirmed as PAID for this demo)
    let payment;
    try {
      payment = await createPayment(totalCents, order.id);
    } catch (paymentErr) {
      console.error("Payment processing failed:", paymentErr);
      return { error: "Payment processing failed. Your order has been saved and can be retried." };
    }

    if (payment.success) {
      await db.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });

      // Clear the cart
      await db.cartItem.deleteMany({ where: { cartId } });

      revalidatePath("/cart");
      revalidatePath("/");
      revalidatePath("/account/orders");

      return { success: true, orderId: order.id };
    }

    return { error: "Payment was not approved. Please try again or choose a different payment method." };
  } catch (err) {
    console.error("checkoutAction failed:", err);
    return { error: "An unexpected error occurred during checkout. Please try again." };
  }
}
