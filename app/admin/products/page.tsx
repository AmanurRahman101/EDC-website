import Link from "next/link";
import { db } from "@/lib/db";
import { formatTk } from "@/lib/money";

export default async function AdminProducts() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between mb-6 items-center">
        <h1 className="font-headline-sm">Products</h1>
        <Link href="/admin/products/new" className="px-4 py-2 border border-secondary hover:bg-surface-container-high font-label-caps text-sm">+ NEW PRODUCT</Link>
      </div>

      <table className="w-full text-sm border border-secondary">
        <thead>
          <tr className="bg-surface-container-low text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Status</th>
            <th className="p-3">Featured</th>
            <th className="p-3">Stock</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary/30">
          {products.map(p => (
            <tr key={p.id} className="bg-surface">
              <td className="p-3">{p.name}</td>
              <td className="p-3 text-secondary">{p.category.name}</td>
              <td className="p-3 font-spec-data">{formatTk(p.priceCents)}</td>
              <td className="p-3">{p.status}</td>
              <td className="p-3">{p.featured ? "YES" : "NO"}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/products/${p.id}`} className="underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
