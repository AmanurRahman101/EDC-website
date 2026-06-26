import { describe, it, expect } from "vitest";
import { TAKA, formatTk, takaToMinor, minorToTaka } from "../money";

describe("money utilities", () => {
  describe("TAKA constant", () => {
    it("is the Bangladeshi Taka symbol", () => {
      expect(TAKA).toBe("৳");
    });
  });

  describe("formatTk", () => {
    it("formats minor units to taka string with symbol", () => {
      expect(formatTk(2850000)).toBe("৳28,500");
    });

    it("formats zero", () => {
      expect(formatTk(0)).toBe("৳0");
    });

    it("handles small amounts (less than 100 poisha)", () => {
      expect(formatTk(50)).toBe("৳1");
    });

    it("rounds half up", () => {
      expect(formatTk(150)).toBe("৳2");
    });

    it("handles exact taka amounts (no remainder)", () => {
      expect(formatTk(10000)).toBe("৳100");
    });

    it("adds thousands separators for large values", () => {
      expect(formatTk(100000000)).toBe("৳1,000,000");
    });

    it("treats falsy input (NaN, undefined cast) as zero", () => {
      expect(formatTk(NaN)).toBe("৳0");
      expect(formatTk(undefined as unknown as number)).toBe("৳0");
    });
  });

  describe("takaToMinor", () => {
    it("converts whole taka to minor units (poisha)", () => {
      expect(takaToMinor(100)).toBe(10000);
    });

    it("converts zero", () => {
      expect(takaToMinor(0)).toBe(0);
    });

    it("rounds fractional results", () => {
      expect(takaToMinor(1.5)).toBe(150);
    });

    it("handles large amounts", () => {
      expect(takaToMinor(28500)).toBe(2850000);
    });

    it("treats falsy input as zero", () => {
      expect(takaToMinor(NaN)).toBe(0);
      expect(takaToMinor(undefined as unknown as number)).toBe(0);
    });
  });

  describe("minorToTaka", () => {
    it("converts minor units back to whole taka", () => {
      expect(minorToTaka(10000)).toBe(100);
    });

    it("converts zero", () => {
      expect(minorToTaka(0)).toBe(0);
    });

    it("rounds the result", () => {
      expect(minorToTaka(150)).toBe(2);
    });

    it("handles large values", () => {
      expect(minorToTaka(2850000)).toBe(28500);
    });

    it("treats falsy input as zero", () => {
      expect(minorToTaka(NaN)).toBe(0);
      expect(minorToTaka(undefined as unknown as number)).toBe(0);
    });

    it("is the inverse of takaToMinor for whole numbers", () => {
      const taka = 500;
      expect(minorToTaka(takaToMinor(taka))).toBe(taka);
    });
  });
});
