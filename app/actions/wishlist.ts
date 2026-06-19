"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Must be logged in");

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await db.wishlistItem.create({ data: { userId, productId } });
  }

  revalidatePath("/account/wishlist");
  revalidatePath(`/products/${productId}`);
}
