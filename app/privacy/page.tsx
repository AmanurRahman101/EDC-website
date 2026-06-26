import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
      <Link href="/" className="font-label-caps text-label-caps text-secondary hover:text-primary">
        ← BACK TO INVENTORY
      </Link>
      <section className="mt-8 bg-surface border border-secondary p-6 space-y-4">
        <h1 className="font-headline-md text-headline-md">PRIVACY_POLICY</h1>
        <p className="text-secondary">
          Customer account, cart, wishlist, and order details are used to process orders and improve the shopping experience.
        </p>
        <p>
          Delivery information is stored with each order so customers and admins can review fulfillment details. Payment integrations are currently placeholders and do not collect real payment credentials.
        </p>
      </section>
    </main>
  );
}
