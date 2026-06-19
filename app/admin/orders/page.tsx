import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { formatTk } from "@/lib/money";

const PAYMENT_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  BKASH: "bKash",
  NAGAD: "Nagad",
};

export default async function AdminOrders() {
  const orders = await db.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as OrderStatus;
    await db.order.update({ where: { id }, data: { status } });
    revalidatePath("/admin/orders");
  }

  return (
    <div>
      <h1 className="font-headline-sm mb-4">All Orders</h1>

      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="border border-secondary bg-surface p-4 text-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-spec-data">#{o.id.slice(0,8).toUpperCase()} • {o.user?.email}</div>
                <div className="text-secondary mt-1">
                  {o.items.length} item(s) • {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
                </div>
              </div>
              <form action={updateStatus} className="flex gap-2 flex-shrink-0">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="border bg-surface-container-low text-xs">
                  {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="text-xs border px-2">UPDATE</button>
              </form>
            </div>

            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
              <div className="text-secondary">
                <div className="font-label-caps text-label-caps mb-1">DELIVER TO</div>
                {o.shipName} • {o.shipPhone}<br />
                {o.shipAddress}<br />
                {[o.shipArea, o.shipDistrict, o.shipDivision].filter(Boolean).join(", ")}
              </div>
              <div className="sm:text-right">
                <div>Subtotal: <span className="font-spec-data">{formatTk(o.subtotalCents)}</span></div>
                <div>Shipping: <span className="font-spec-data">{formatTk(o.shippingCents)}</span></div>
                <div className="font-spec-data">Total: {formatTk(o.totalCents)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
