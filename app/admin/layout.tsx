import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-secondary bg-surface-container-low p-6 flex flex-col">
        <div className="font-display-lg tracking-tighter mb-8">ADMIN</div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="px-3 py-2 hover:bg-surface-container-high rounded">Dashboard</Link>
          <Link href="/admin/products" className="px-3 py-2 hover:bg-surface-container-high rounded">Products</Link>
          <Link href="/admin/categories" className="px-3 py-2 hover:bg-surface-container-high rounded">Categories</Link>
          <Link href="/admin/orders" className="px-3 py-2 hover:bg-surface-container-high rounded">Orders</Link>
        </nav>
        <div className="mt-auto text-xs text-secondary pt-8 border-t">MACHINED_EDC • Admin</div>
      </aside>

      <div className="flex-1 p-8 max-w-[1100px]">
        {children}
      </div>
    </div>
  );
}
