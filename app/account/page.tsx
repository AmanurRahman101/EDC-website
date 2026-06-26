import { getCurrentUser } from "@/lib/auth";

export default async function AccountProfile() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-lg">
      <h2 className="font-headline-sm mb-4">Profile</h2>
      <div className="bg-surface border border-secondary p-6 space-y-2 font-spec-data text-spec-data">
        <div><span className="text-secondary">NAME:</span> {user?.name || "—"}</div>
        <div><span className="text-secondary">EMAIL:</span> {user?.email}</div>
        <div><span className="text-secondary">ROLE:</span> {user?.role}</div>
      </div>

      <p className="mt-6 text-secondary text-sm">More profile settings coming soon.</p>
    </div>
  );
}
