import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export default async function AdminCategories() {
  const cats = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  async function createCategory(formData: FormData) {
    "use server";
    await requireAdmin();
    const name = formData.get("name") as string;
    const slug = slugify((formData.get("slug") as string) || name);
    await db.category.create({ data: { name, slug } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }

  async function updateCategory(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = slugify((formData.get("slug") as string) || name);
    await db.category.update({ where: { id }, data: { name, slug } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    const count = await db.product.count({ where: { categoryId: id } });
    if (count > 0) {
      // Don't delete a category that still has products (would cascade-delete them).
      return;
    }
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }

  return (
    <div>
      <h1 className="font-headline-sm mb-4">Categories</h1>

      <form action={createCategory} className="flex gap-2 mb-6">
        <input name="name" placeholder="Name" className="border p-2 bg-surface" required />
        <input name="slug" placeholder="slug (optional)" className="border p-2 bg-surface" />
        <button className="px-4 border">ADD</button>
      </form>

      <ul className="space-y-2">
        {cats.map(c => (
          <li key={c.id} className="bg-surface border border-secondary p-3">
            <form action={updateCategory} className="flex flex-wrap gap-2 items-center">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} className="border p-1 bg-surface-container-low text-sm" />
              <input name="slug" defaultValue={c.slug} className="border p-1 bg-surface-container-low text-sm font-spec-data" />
              <span className="text-xs text-secondary">{c._count.products} product(s)</span>
              <button className="text-xs border px-2 py-1 ml-auto">SAVE</button>
            </form>
            <form action={deleteCategory} className="mt-2">
              <input type="hidden" name="id" value={c.id} />
              <button
                disabled={c._count.products > 0}
                className="text-xs text-error underline disabled:text-secondary disabled:no-underline disabled:cursor-not-allowed"
              >
                {c._count.products > 0 ? "Delete (move products first)" : "Delete"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
