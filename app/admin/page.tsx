import { db } from "@/lib/db";
import { formatTk } from "@/lib/money";

export default async function AdminOverview() {
  const [productCount, orderCount, userCount, lowStock] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
    db.product.findMany({ where: { stock: { lt: 5 } }, take: 5, select: { name: true, stock: true } }),
  ]);

  const revenueAgg = await db.order.aggregate({
    where: { status: "PAID" },
    _sum: { totalCents: true },
  });
  const revenueMinor = revenueAgg._sum.totalCents || 0;

  return (
    <div>
      <h1 className="font-headline-md mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-secondary p-4">
          <div className="text-secondary text-xs">PRODUCTS</div>
          <div className="text-3xl mt-1">{productCount}</div>
        </div>
        <div className="bg-surface border border-secondary p-4">
          <div className="text-secondary text-xs">ORDERS</div>
          <div className="text-3xl mt-1">{orderCount}</div>
        </div>
        <div className="bg-surface border border-secondary p-4">
          <div className="text-secondary text-xs">USERS</div>
          <div className="text-3xl mt-1">{userCount}</div>
        </div>
        <div className="bg-surface border border-secondary p-4">
          <div className="text-secondary text-xs">REVENUE (PAID)</div>
          <div className="text-3xl mt-1">{formatTk(revenueMinor)}</div>
        </div>
      </div>

      <div>
        <div className="font-label-caps mb-2">LOW STOCK</div>
        <div className="bg-surface border border-secondary divide-y text-sm">
          {lowStock.length === 0 && <div className="p-4 text-secondary">All good.</div>}
          {lowStock.map((p, i) => (
            <div key={i} className="p-3 flex justify-between"><span>{p.name}</span><span className="text-error">{p.stock} left</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
