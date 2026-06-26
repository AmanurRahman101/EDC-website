import Link from "next/link";
import { formatTk } from "@/lib/money";
import { SHIPPING_INSIDE_DHAKA, SHIPPING_OUTSIDE_DHAKA } from "@/lib/shipping";

export default function ShippingPage() {
  return (
    <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
      <Link href="/" className="font-label-caps text-label-caps text-secondary hover:text-primary">
        ← BACK TO INVENTORY
      </Link>
      <section className="mt-8 bg-surface border border-secondary p-6 space-y-4">
        <h1 className="font-headline-md text-headline-md">SHIPPING_LOGISTICS</h1>
        <p className="text-secondary">
          Checkout calculates delivery cost from the selected Bangladesh district.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border border-secondary p-4">
            <div className="font-label-caps text-label-caps text-secondary">DHAKA DISTRICT</div>
            <div className="mt-2 font-headline-sm">{formatTk(SHIPPING_INSIDE_DHAKA)}</div>
          </div>
          <div className="border border-secondary p-4">
            <div className="font-label-caps text-label-caps text-secondary">OUTSIDE DHAKA</div>
            <div className="mt-2 font-headline-sm">{formatTk(SHIPPING_OUTSIDE_DHAKA)}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
