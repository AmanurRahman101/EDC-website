import Link from "next/link";

export default function RepairPage() {
  return (
    <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
      <Link href="/" className="font-label-caps text-label-caps text-secondary hover:text-primary">
        ← BACK TO INVENTORY
      </Link>
      <section className="mt-8 bg-surface border border-secondary p-6 space-y-4">
        <h1 className="font-headline-md text-headline-md">REPAIR_PROGRAM</h1>
        <p className="text-secondary">
          Repair intake is currently handled manually through the store team.
        </p>
        <p>
          Keep your order number and product serial details ready. A future version can add repair request forms, admin assignment, and status tracking.
        </p>
      </section>
    </main>
  );
}
