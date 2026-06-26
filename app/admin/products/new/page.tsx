import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { takaToMinor, TAKA } from "@/lib/money";
import fs from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { ProductStatus } from "@prisma/client";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function saveProductImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
  const uploadDir = path.join(process.cwd(), "public/products");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/products/${filename}`;
}

export default async function NewProduct() {
  const categories = await db.category.findMany();

  async function createProduct(formData: FormData) {
    "use server";
    await requireAdmin();

    const name = formData.get("name") as string;
    if (!name || !name.trim()) return { error: "Product name is required" };
    const slug = ((formData.get("slug") as string) || slugify(name)).trim();
    const priceCents = takaToMinor(parseFloat(formData.get("price") as string));
    if (isNaN(priceCents) || priceCents < 0) return { error: "Invalid price" };
    const categoryId = formData.get("categoryId") as string;
    const status = formData.get("status") as ProductStatus;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const subtitle = formData.get("subtitle") as string || null;
    const description = formData.get("description") as string || null;
    const featured = formData.get("featured") === "on";

    let productId: string;
    try {
      const product = await db.product.create({
        data: { name, slug, priceCents, categoryId, status, stock, subtitle, description, featured },
      });
      productId = product.id;

      // optional primary image url
      const imageUrl = formData.get("imageUrl") as string;
      const imageFile = formData.get("imageFile") as File;
      let uploadedUrl: string | null = null;
      try {
        uploadedUrl = imageFile && imageFile.size > 0 ? await saveProductImage(imageFile) : null;
      } catch (imgErr) {
        console.error("Image upload failed during product creation:", imgErr);
      }
      const primaryImageUrl = uploadedUrl || imageUrl;
      if (primaryImageUrl) {
        await db.productImage.create({
          data: { productId: product.id, url: primaryImageUrl, position: 0 },
        });
      }
    } catch (err) {
      console.error("createProduct failed:", err);
      return { error: "Failed to create product. The slug may already exist." };
    }

    revalidatePath("/");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    redirect(`/admin/products/${productId}`);
  }

  return (
    <form action={createProduct} className="max-w-lg space-y-4">
      <h1 className="font-headline-sm mb-2">New Product</h1>

      <input name="name" placeholder="Name" required className="w-full border p-2 bg-surface" />
      <input name="slug" placeholder="slug-kebab (optional, auto from name)" className="w-full border p-2 bg-surface" />
      <input name="subtitle" placeholder="Subtitle" className="w-full border p-2 bg-surface" />
      <textarea name="description" placeholder="Description" className="w-full border p-2 bg-surface h-24" />

      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" step="1" min="0" placeholder={`Price (${TAKA})`} required className="border p-2 bg-surface" />
        <input name="stock" type="number" placeholder="Stock" defaultValue={10} className="border p-2 bg-surface" />
      </div>

      <select name="categoryId" required className="w-full border p-2 bg-surface">
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select name="status" className="w-full border p-2 bg-surface">
        <option value="IN_STOCK">IN_STOCK</option>
        <option value="LIMITED_RUN">LIMITED_RUN</option>
        <option value="BACKORDERED">BACKORDERED</option>
        <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-secondary">
        <input type="checkbox" name="featured" className="accent-primary" />
        FEATURED PRODUCT
      </label>

      <div className="space-y-2 border border-secondary/40 p-3">
        <label className="block text-xs text-secondary">Primary image upload</label>
        <input type="file" name="imageFile" accept="image/*" className="text-sm" />
      </div>
      <input name="imageUrl" placeholder="/products/xxx.png (optional)" className="w-full border p-2 bg-surface" />

      <button type="submit" className="px-6 py-2 bg-on-background text-on-primary">CREATE</button>
    </form>
  );
}
