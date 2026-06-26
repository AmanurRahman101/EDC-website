import type { NextAuthConfig } from "next-auth";

type AppRole = "CUSTOMER" | "ADMIN";
type AppUser = {
  id?: string;
  role?: AppRole;
};

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
        const appUser = user as AppUser;
        token.id = appUser.id;
        token.role = appUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & AppUser;
        sessionUser.id = token.id as string;
        sessionUser.role = token.role as AppRole;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as AppUser | undefined)?.role;

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
