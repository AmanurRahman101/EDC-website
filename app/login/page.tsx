import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { mergeGuestCartIntoUserCart } from "../actions/cart";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = sp.redirect && sp.redirect.startsWith("/") ? sp.redirect : "/";

  async function loginAction(formData: FormData) {
    "use server";
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    const password = formData.get("password") as string;
    const dest = (formData.get("redirectTo") as string) || "/";

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      redirect(`/login?error=${encodeURIComponent("Invalid credentials")}${dest !== "/" ? `&redirect=${encodeURIComponent(dest)}` : ""}`);
    }

    await mergeGuestCartIntoUserCart();
    redirect(dest.startsWith("/") ? dest : "/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="font-display-lg text-display-lg tracking-tighter text-on-surface">MACHINED_EDC</div>
          <p className="font-label-caps text-label-caps text-secondary mt-1">SIGN IN TO YOUR ACCOUNT</p>
        </div>

        <form action={loginAction} className="space-y-4 bg-surface border border-secondary p-8">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          {sp.error && (
            <div className="text-error text-sm border border-error/30 bg-error-container/10 p-3">{sp.error}</div>
          )}
          {sp.registered && (
            <div className="text-on-surface text-sm border border-primary/30 bg-primary/5 p-3">Account created. Please sign in.</div>
          )}

          <div>
            <label className="font-label-caps text-label-caps text-secondary block mb-1">EMAIL</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-surface-container-low border border-secondary px-3 py-2 text-on-surface focus:border-primary outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-secondary block mb-1">PASSWORD</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-surface-container-low border border-secondary px-3 py-2 text-on-surface focus:border-primary outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-on-background text-on-primary font-label-caps text-label-caps hover:bg-primary transition-colors"
          >
            SIGN IN
          </button>
        </form>

        <p className="text-center mt-6 font-spec-data text-spec-data text-secondary">
          No account? <a href="/register" className="text-on-surface hover:text-primary underline">Create one</a>
        </p>

        <p className="text-center mt-2 font-spec-data text-spec-data text-secondary">
          Admin: admin@machinededc.com / admin123
        </p>
      </div>
    </div>
  );
}
