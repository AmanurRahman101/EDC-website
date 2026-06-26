import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatTk } from "@/lib/money";
import { PAYMENT_LABELS } from "@/lib/constants";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const userId = user?.id;

  const order = await db.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/account/orders" className="text-secondary text-sm">← All orders</Link>

      <div className="mt-4 border border-secondary bg-surface p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-headline-sm">ORDER #{order.id.slice(0, 8).toUpperCase()}</div>
            <div className="text-secondary text-sm">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="font-spec-data text-spec-data uppercase">{order.status}</div>
            <div className="text-xl mt-1">{formatTk(order.totalCents)}</div>
          </div>
        </div>

        <div className="mt-6 divide-y divide-secondary/30 text-sm">
          {order.items.map((it, idx) => (
            <div key={idx} className="py-2 flex justify-between">
              <div>{it.nameSnapshot} × {it.qty}</div>
              <div>{formatTk(it.priceSnapshotCents * it.qty)}</div>
            </div>
          ))}
        </div>

        {/* Money breakdown */}
        <div className="mt-4 border-t border-secondary/30 pt-4 text-sm space-y-1">
          <div className="flex justify-between text-secondary">
            <span>Subtotal</span>
            <span className="font-spec-data">{formatTk(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-secondary">
            <span>Shipping</span>
            <span className="font-spec-data">{formatTk(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between text-base pt-1">
            <span>Total</span>
            <span className="font-spec-data">{formatTk(order.totalCents)}</span>
          </div>
          <div className="flex justify-between text-secondary pt-1">
            <span>Payment</span>
            <span>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
          </div>
        </div>

        {order.shipName && (
          <div className="mt-6 text-xs text-secondary border-t pt-4 leading-relaxed">
            <div className="font-label-caps text-label-caps mb-1">DELIVER TO</div>
            {order.shipName} • {order.shipPhone}<br />
            {order.shipAddress}<br />
            {[order.shipArea, order.shipDistrict, order.shipDivision].filter(Boolean).join(", ")}
          </div>
        )}
      </div>

      {order.status === "PAID" && <div className="mt-3 text-xs text-secondary">Thank you. Your order has been confirmed (placeholder payment).</div>}
    </div>
  );
}
