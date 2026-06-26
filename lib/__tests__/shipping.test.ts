import { describe, it, expect } from "vitest";
import {
  SHIPPING_INSIDE_DHAKA,
  SHIPPING_OUTSIDE_DHAKA,
  shippingForDivisionDistrict,
  shippingLabel,
} from "../shipping";

describe("shipping utilities", () => {
  describe("constants", () => {
    it("inside Dhaka is 6000 poisha (৳60)", () => {
      expect(SHIPPING_INSIDE_DHAKA).toBe(6000);
    });

    it("outside Dhaka is 12000 poisha (৳120)", () => {
      expect(SHIPPING_OUTSIDE_DHAKA).toBe(12000);
    });
  });

  describe("shippingForDivisionDistrict", () => {
    it("returns inside-Dhaka rate for Dhaka district", () => {
      expect(shippingForDivisionDistrict("Dhaka", "Dhaka")).toBe(SHIPPING_INSIDE_DHAKA);
    });

    it("is case-insensitive for district", () => {
      expect(shippingForDivisionDistrict("Dhaka", "dhaka")).toBe(SHIPPING_INSIDE_DHAKA);
      expect(shippingForDivisionDistrict("Dhaka", "DHAKA")).toBe(SHIPPING_INSIDE_DHAKA);
    });

    it("trims whitespace from district", () => {
      expect(shippingForDivisionDistrict("Dhaka", "  Dhaka  ")).toBe(SHIPPING_INSIDE_DHAKA);
    });

    it("returns outside-Dhaka rate for other districts in Dhaka division", () => {
      expect(shippingForDivisionDistrict("Dhaka", "Gazipur")).toBe(SHIPPING_OUTSIDE_DHAKA);
      expect(shippingForDivisionDistrict("Dhaka", "Narayanganj")).toBe(SHIPPING_OUTSIDE_DHAKA);
    });

    it("returns outside-Dhaka rate for districts in other divisions", () => {
      expect(shippingForDivisionDistrict("Chattogram", "Chattogram")).toBe(SHIPPING_OUTSIDE_DHAKA);
      expect(shippingForDivisionDistrict("Rajshahi", "Bogura")).toBe(SHIPPING_OUTSIDE_DHAKA);
      expect(shippingForDivisionDistrict("Sylhet", "Sylhet")).toBe(SHIPPING_OUTSIDE_DHAKA);
    });

    it("ignores division parameter (only district matters)", () => {
      expect(shippingForDivisionDistrict("Anywhere", "Dhaka")).toBe(SHIPPING_INSIDE_DHAKA);
      expect(shippingForDivisionDistrict("", "Dhaka")).toBe(SHIPPING_INSIDE_DHAKA);
    });
  });

  describe("shippingLabel", () => {
    it("returns 'Inside Dhaka' for Dhaka district", () => {
      expect(shippingLabel("Dhaka")).toBe("Inside Dhaka");
    });

    it("is case-insensitive", () => {
      expect(shippingLabel("dhaka")).toBe("Inside Dhaka");
      expect(shippingLabel("DHAKA")).toBe("Inside Dhaka");
    });

    it("trims whitespace", () => {
      expect(shippingLabel("  Dhaka  ")).toBe("Inside Dhaka");
    });

    it("returns 'Outside Dhaka' for other districts", () => {
      expect(shippingLabel("Gazipur")).toBe("Outside Dhaka");
      expect(shippingLabel("Chattogram")).toBe("Outside Dhaka");
      expect(shippingLabel("Rajshahi")).toBe("Outside Dhaka");
    });
  });
});
