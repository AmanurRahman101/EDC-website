import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config. NO Node-only deps here (bcrypt, Prisma, etc.) so it can
// run in the middleware/Edge runtime. The Credentials provider with bcrypt + DB
// lookups lives in lib/auth.ts which extends this base.
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role as "CUSTOMER" | "ADMIN" | undefined;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }
      if (pathname.startsWith("/account")) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
