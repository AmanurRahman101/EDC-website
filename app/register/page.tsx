import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Please provide a valid email and a password with at least 6 characters.",
  exists: "An account with this email already exists.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  async function registerAction(formData: FormData) {
    "use server";

    const name = ((formData.get("name") as string) || "").trim() || null;
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password || password.length < 6) {
      redirect("/register?error=invalid");
    }

    try {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        redirect("/register?error=exists");
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await db.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: Role.CUSTOMER,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      console.error("Registration failed:", err);
      redirect("/register?error=invalid");
    }

    redirect("/login?registered=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="font-display-lg text-display-lg tracking-tighter text-on-surface">MACHINED_EDC</div>
          <p className="font-label-caps text-label-caps text-secondary mt-1">CREATE AN ACCOUNT</p>
        </div>

        <form action={registerAction} className="space-y-4 bg-surface border border-secondary p-8">
          {sp.error && ERROR_MESSAGES[sp.error] && (
            <div className="text-error text-sm border border-error/30 bg-error-container/10 p-3">
              {ERROR_MESSAGES[sp.error]}
            </div>
          )}

          <div>
            <label className="font-label-caps text-label-caps text-secondary block mb-1">NAME</label>
            <input name="name" type="text" className="w-full bg-surface-container-low border border-secondary px-3 py-2 text-on-surface focus:border-primary outline-none" placeholder="Alex Rivera" />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-secondary block mb-1">EMAIL</label>
            <input name="email" type="email" required className="w-full bg-surface-container-low border border-secondary px-3 py-2 text-on-surface focus:border-primary outline-none" placeholder="you@example.com" />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-secondary block mb-1">PASSWORD</label>
            <input name="password" type="password" required minLength={6} className="w-full bg-surface-container-low border border-secondary px-3 py-2 text-on-surface focus:border-primary outline-none" />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-on-background text-on-primary font-label-caps text-label-caps hover:bg-primary transition-colors"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center mt-6 font-spec-data text-spec-data text-secondary">
          Already have an account? <a href="/login" className="text-on-surface hover:text-primary underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
