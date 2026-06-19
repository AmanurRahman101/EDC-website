import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = (user as any).role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-headline-sm text-headline-sm">ACCOUNT</div>
          <div className="text-secondary font-spec-data">{user.email}</div>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/account" className="hover:text-primary">PROFILE</Link>
          <Link href="/account/orders" className="hover:text-primary">ORDERS</Link>
          <Link href="/account/wishlist" className="hover:text-primary">WISHLIST</Link>
          {isAdmin && <Link href="/admin" className="text-primary hover:underline">ADMIN DASHBOARD →</Link>}
          <form action={async () => { "use server"; const { signOut } = await import("@/lib/auth"); await signOut({ redirectTo: "/" }); }}>
            <button className="text-secondary hover:text-error">SIGN OUT</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
