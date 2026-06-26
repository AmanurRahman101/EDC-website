import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function AdminCategories() {
  const cats = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  async function createCategory(formData: FormData): Promise<{ error?: string } | void> {
    "use server";
    await requireAdmin();
    const name = formData.get("name") as string;
    if (!name || !name.trim()) return { error: "Category name is required" };
    const slug = slugify((formData.get("slug") as string) || name);
    try {
      await db.category.create({ data: { name, slug } });
    } catch (err) {
      console.error("createCategory failed:", err);
      return { error: "Failed to create category. The slug may already exist." };
    }
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }

  async function updateCategory(formData: FormData): Promise<{ error?: string } | void> {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    if (!name || !name.trim()) return { error: "Category name is required" };
    const slug = slugify((formData.get("slug") as string) || name);
    try {
      await db.category.update({ where: { id }, data: { name, slug } });
    } catch (err) {
      console.error("updateCategory failed:", err);
      return { error: "Failed to update category" };
    }
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }

  async function deleteCategory(formData: FormData): Promise<{ error?: string } | void> {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    try {
      const count = await db.product.count({ where: { categoryId: id } });
      if (count > 0) {
        return { error: `Cannot delete: ${count} product(s) still belong to this category. Move them first.` };
      }
      await db.category.delete({ where: { id } });
    } catch (err) {
      console.error("deleteCategory failed:", err);
      return { error: "Failed to delete category" };
    }
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
