"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  
  // For now, we use a placeholder image or a URL provided by the user.
  // In a full implementation, we would upload the file to Firebase Storage here.
  const image = formData.get("image") as string || "https://via.placeholder.com/400x400.png?text=New+Product";

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      category,
      status,
      image,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function getProducts(category?: string, sort?: string) {
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'PRICE_DESCENDING') orderBy = { price: 'desc' };
  if (sort === 'PRICE_ASCENDING') orderBy = { price: 'asc' };

  let where: any = category ? { category } : {};
  if (sort === 'IN_STOCK_ONLY') where.stock = { gt: 0 };

  return await prisma.product.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy
  });
}
