"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Please sign in to manage your wishlist" };

  try {
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
    return {};
  } catch (err) {
    console.error("toggleWishlist failed:", err);
    return { error: "Failed to update wishlist" };
  }
}
