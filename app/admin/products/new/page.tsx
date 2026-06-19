import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { takaToMinor, TAKA } from "@/lib/money";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function NewProduct() {
  const categories = await db.category.findMany();

  async function createProduct(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const slug = ((formData.get("slug") as string) || slugify(name)).trim();
    const priceCents = takaToMinor(parseFloat(formData.get("price") as string));
    const categoryId = formData.get("categoryId") as string;
    const status = formData.get("status") as any;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const subtitle = formData.get("subtitle") as string || null;
    const description = formData.get("description") as string || null;

    const product = await db.product.create({
      data: { name, slug, priceCents, categoryId, status, stock, subtitle, description },
    });

    // optional primary image url
    const imageUrl = formData.get("imageUrl") as string;
    if (imageUrl) {
      await db.productImage.create({
        data: { productId: product.id, url: imageUrl, position: 0 },
      });
    }

    revalidatePath("/");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    redirect(`/admin/products/${product.id}`);
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

      <input name="imageUrl" placeholder="/products/xxx.png (optional)" className="w-full border p-2 bg-surface" />

      <button type="submit" className="px-6 py-2 bg-on-background text-on-primary">CREATE</button>
    </form>
  );
}
