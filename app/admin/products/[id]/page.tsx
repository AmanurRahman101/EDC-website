import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { takaToMinor, minorToTaka, formatTk, TAKA } from "@/lib/money";
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

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      specs: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
      category: true,
    },
  });
  if (!product) notFound();

  const categories = await db.category.findMany();

  async function revalidateStorefront(slug: string) {
    "use server";
    revalidatePath("/");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
  }

  async function updateProduct(formData: FormData) {
    "use server";
    await requireAdmin();
    const name = formData.get("name") as string;
    const rawSlug = (formData.get("slug") as string) || "";
    const slug = slugify(rawSlug || name);
    const priceCents = takaToMinor(parseFloat(formData.get("price") as string));
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const status = formData.get("status") as ProductStatus;
    const subtitle = (formData.get("subtitle") as string) || null;
    const description = (formData.get("description") as string) || null;
    const categoryId = formData.get("categoryId") as string;
    const featured = formData.get("featured") === "on";

    const prev = await db.product.findUnique({ where: { id }, select: { slug: true } });

    await db.product.update({
      where: { id },
      data: { name, slug, priceCents, stock, status, subtitle, description, categoryId, featured },
    });

    revalidatePath("/");
    if (prev?.slug && prev.slug !== slug) revalidatePath(`/products/${prev.slug}`);
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    redirect("/admin/products");
  }

  async function uploadImage(formData: FormData) {
    "use server";
    await requireAdmin();
    const file = formData.get("file") as File;
    if (!file || file.size === 0) return;

    const imageUrl = await saveProductImage(file);

    const count = await db.productImage.count({ where: { productId: id } });
    await db.productImage.create({
      data: { productId: id, url: imageUrl, position: count },
    });

    await revalidateStorefront(product!.slug);
  }

  async function deleteImage(formData: FormData) {
    "use server";
    await requireAdmin();
    const imageId = formData.get("imageId") as string;
    await db.productImage.delete({ where: { id: imageId } });
    // Re-pack positions
    const remaining = await db.productImage.findMany({ where: { productId: id }, orderBy: { position: "asc" } });
    await Promise.all(
      remaining.map((img, i) => db.productImage.update({ where: { id: img.id }, data: { position: i } }))
    );
    await revalidateStorefront(product!.slug);
  }

  async function setPrimaryImage(formData: FormData) {
    "use server";
    await requireAdmin();
    const imageId = formData.get("imageId") as string;
    const others = await db.productImage.findMany({
      where: { productId: id, NOT: { id: imageId } },
      orderBy: { position: "asc" },
    });
    await db.productImage.update({ where: { id: imageId }, data: { position: 0 } });
    await Promise.all(
      others.map((img, i) => db.productImage.update({ where: { id: img.id }, data: { position: i + 1 } }))
    );
    await revalidateStorefront(product!.slug);
  }

  async function addSpec(formData: FormData) {
    "use server";
    await requireAdmin();
    const label = formData.get("label") as string;
    const value = formData.get("value") as string;
    if (label && value) {
      const count = await db.productSpec.count({ where: { productId: id } });
      await db.productSpec.create({ data: { productId: id, label, value, position: count } });
    }
    await revalidateStorefront(product!.slug);
  }

  async function deleteSpec(formData: FormData) {
    "use server";
    await requireAdmin();
    const specId = formData.get("specId") as string;
    await db.productSpec.delete({ where: { id: specId } });
    await revalidateStorefront(product!.slug);
  }

  async function deleteProduct() {
    "use server";
    await requireAdmin();
    const slug = product!.slug;
    await db.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    redirect("/admin/products");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline-sm mb-4">Edit: {product.name}</h1>

      <form action={updateProduct} className="space-y-3 mb-10">
        <label className="block text-xs text-secondary">Name</label>
        <input name="name" defaultValue={product.name} className="w-full border p-2 bg-surface" />

        <label className="block text-xs text-secondary">Slug (URL)</label>
        <input name="slug" defaultValue={product.slug} className="w-full border p-2 bg-surface font-spec-data" />

        <input name="subtitle" placeholder="Subtitle" defaultValue={product.subtitle || ""} className="w-full border p-2 bg-surface" />
        <textarea name="description" placeholder="Description" defaultValue={product.description || ""} className="w-full border p-2 bg-surface h-20" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-secondary mb-1">Price ({TAKA})</label>
            <input name="price" type="number" step="1" min="0" defaultValue={minorToTaka(product.priceCents)} className="w-full border p-2 bg-surface" />
          </div>
          <div>
            <label className="block text-xs text-secondary mb-1">Stock</label>
            <input name="stock" type="number" defaultValue={product.stock} className="w-full border p-2 bg-surface" />
          </div>
        </div>

        <select name="categoryId" defaultValue={product.categoryId} className="w-full border p-2 bg-surface">
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select name="status" defaultValue={product.status} className="w-full border p-2 bg-surface">
          <option>IN_STOCK</option><option>LIMITED_RUN</option><option>BACKORDERED</option><option>OUT_OF_STOCK</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-secondary">
          <input type="checkbox" name="featured" defaultChecked={product.featured} className="accent-primary" />
          FEATURED PRODUCT
        </label>

        <div className="text-xs text-secondary">Current price: {formatTk(product.priceCents)}</div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-on-background text-on-primary">SAVE</button>
        </div>
      </form>

      <form action={deleteProduct} className="mb-10">
        <button type="submit" className="px-4 py-2 border text-error border-error/40">DELETE PRODUCT</button>
      </form>

      {/* Images */}
      <div className="mb-8">
        <div className="font-label-caps mb-2">IMAGES</div>
        <div className="flex gap-3 flex-wrap mb-3">
          {product.images.length === 0 && <div className="text-secondary text-sm">No images yet.</div>}
          {product.images.map((img, i) => (
            <div key={img.id} className="border border-secondary p-2 bg-surface-container w-32 flex flex-col gap-2">
              <div className="h-20 flex items-center justify-center bg-surface">
                <img src={img.url} alt="" className="max-h-20 object-contain mix-blend-multiply" />
              </div>
              <div className="text-[9px] break-all text-secondary">{img.url}</div>
              {i === 0 ? (
                <span className="text-[10px] text-primary font-label-caps">PRIMARY</span>
              ) : (
                <form action={setPrimaryImage}>
                  <input type="hidden" name="imageId" value={img.id} />
                  <button className="text-[10px] underline">Set primary</button>
                </form>
              )}
              <form action={deleteImage}>
                <input type="hidden" name="imageId" value={img.id} />
                <button className="text-[10px] text-error underline">Delete</button>
              </form>
            </div>
          ))}
        </div>

        <form action={uploadImage} className="flex gap-2">
          <input type="file" name="file" accept="image/*" required className="text-sm" />
          <button className="px-3 py-1 border">UPLOAD</button>
        </form>
      </div>

      {/* Specs */}
      <div>
        <div className="font-label-caps mb-2">SPECS</div>
        <form action={addSpec} className="flex gap-2 mb-3">
          <input name="label" placeholder="LABEL" className="border p-1 flex-1 bg-surface" />
          <input name="value" placeholder="VALUE" className="border p-1 flex-1 bg-surface" />
          <button className="px-3 border">ADD</button>
        </form>

        <ul className="text-sm space-y-1">
          {product.specs.map(s => (
            <li key={s.id} className="flex justify-between items-center bg-surface border px-3 py-1">
              <span>{s.label}: {s.value}</span>
              <form action={deleteSpec}>
                <input type="hidden" name="specId" value={s.id} />
                <button className="text-xs text-error underline">remove</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
