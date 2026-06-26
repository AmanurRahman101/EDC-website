import { describe, it, expect } from "vitest";
import { authConfig } from "../auth.config";

describe("auth.config", () => {
  describe("session strategy", () => {
    it("uses JWT strategy", () => {
      expect(authConfig.session).toEqual({ strategy: "jwt" });
    });
  });

  describe("pages", () => {
    it("configures sign-in page to /login", () => {
      expect(authConfig.pages).toEqual({ signIn: "/login" });
    });
  });

  describe("trustHost", () => {
    it("is enabled", () => {
      expect(authConfig.trustHost).toBe(true);
    });
  });

  describe("callbacks.jwt", () => {
    const jwtCallback = authConfig.callbacks.jwt;

    it("attaches user id and role to token on first sign-in", async () => {
      const token = { sub: "some-sub" };
      const user = { id: "user-123", role: "ADMIN" };
      const result = await jwtCallback({ token, user } as Parameters<typeof jwtCallback>[0]);
      expect(result.id).toBe("user-123");
      expect(result.role).toBe("ADMIN");
    });

    it("preserves existing token when no user (subsequent requests)", async () => {
      const token = { sub: "some-sub", id: "user-123", role: "CUSTOMER" };
      const result = await jwtCallback({ token, user: undefined } as unknown as Parameters<typeof jwtCallback>[0]);
      expect(result.id).toBe("user-123");
      expect(result.role).toBe("CUSTOMER");
    });
  });

  describe("callbacks.session", () => {
    const sessionCallback = authConfig.callbacks.session;

    it("populates session.user with id and role from token", async () => {
      const session = { user: { name: "Test" } };
      const token = { id: "user-456", role: "ADMIN" };
      const result = await sessionCallback({ session, token } as Parameters<typeof sessionCallback>[0]);
      expect(result.user).toMatchObject({ id: "user-456", role: "ADMIN" });
    });
  });

  describe("callbacks.authorized", () => {
    const authorizedCallback = authConfig.callbacks.authorized;

    function makeArgs(pathname: string, user?: { role?: string }) {
      return {
        auth: user ? { user } : null,
        request: { nextUrl: { pathname } },
      } as Parameters<typeof authorizedCallback>[0];
    }

    it("allows public routes for unauthenticated users", () => {
      expect(authorizedCallback(makeArgs("/"))).toBe(true);
      expect(authorizedCallback(makeArgs("/products/knife-1"))).toBe(true);
      expect(authorizedCallback(makeArgs("/login"))).toBe(true);
    });

    it("blocks /admin for unauthenticated users", () => {
      expect(authorizedCallback(makeArgs("/admin"))).toBe(false);
      expect(authorizedCallback(makeArgs("/admin/products"))).toBe(false);
    });

    it("blocks /admin for non-admin users", () => {
      expect(authorizedCallback(makeArgs("/admin", { role: "CUSTOMER" }))).toBe(false);
    });

    it("allows /admin for admin users", () => {
      expect(authorizedCallback(makeArgs("/admin", { role: "ADMIN" }))).toBe(true);
      expect(authorizedCallback(makeArgs("/admin/orders", { role: "ADMIN" }))).toBe(true);
    });

    it("blocks /account for unauthenticated users", () => {
      expect(authorizedCallback(makeArgs("/account"))).toBe(false);
      expect(authorizedCallback(makeArgs("/account/orders"))).toBe(false);
    });

    it("allows /account for any authenticated user", () => {
      expect(authorizedCallback(makeArgs("/account", { role: "CUSTOMER" }))).toBe(true);
      expect(authorizedCallback(makeArgs("/account/wishlist", { role: "ADMIN" }))).toBe(true);
    });

    it("allows public routes for authenticated users", () => {
      expect(authorizedCallback(makeArgs("/", { role: "CUSTOMER" }))).toBe(true);
      expect(authorizedCallback(makeArgs("/products/item", { role: "ADMIN" }))).toBe(true);
    });
  });
});
