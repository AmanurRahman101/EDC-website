import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
      <Link href="/" className="font-label-caps text-label-caps text-secondary hover:text-primary">
        ← BACK TO INVENTORY
      </Link>
      <section className="mt-8 bg-surface border border-secondary p-6 space-y-4">
        <h1 className="font-headline-md text-headline-md">TERMS_OF_SERVICE</h1>
        <p className="text-secondary">
          Orders placed through MACHINED_EDC are reviewed for stock, delivery coverage, and payment confirmation before fulfillment.
        </p>
        <p>
          Product availability, pricing, and specifications can change as catalog data is updated. If an item becomes unavailable after checkout, the order team will contact the customer before dispatch.
        </p>
      </section>
    </main>
  );
}
