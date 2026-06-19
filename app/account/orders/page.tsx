import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatTk } from "@/lib/money";

export default async function OrdersList() {
  const user = await getCurrentUser();
  const userId = (user as any)?.id;

  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h2 className="font-headline-sm mb-4">Your Orders</h2>

      {orders.length === 0 && (
        <div className="text-secondary">No orders yet. <Link href="/" className="underline">Start shopping</Link></div>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/account/orders/${o.id}`} className="block border border-secondary bg-surface p-4 hover:border-primary">
            <div className="flex justify-between font-spec-data text-spec-data">
              <div>
                <div>ORDER #{o.id.slice(0, 8).toUpperCase()}</div>
                <div className="text-secondary">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div>{formatTk(o.totalCents)}</div>
                <div className="text-xs uppercase tracking-widest text-secondary">{o.status}</div>
              </div>
            </div>
            <div className="text-xs mt-1 text-secondary">{o.items.length} item(s)</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
