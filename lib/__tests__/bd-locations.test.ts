import { describe, it, expect } from "vitest";
import {
  BD_DIVISIONS,
  DIVISION_NAMES,
  districtsForDivision,
  isValidDivisionDistrict,
} from "../bd-locations";

describe("bd-locations utilities", () => {
  describe("BD_DIVISIONS", () => {
    it("has 8 divisions", () => {
      expect(Object.keys(BD_DIVISIONS)).toHaveLength(8);
    });

    it("contains the expected divisions", () => {
      const expected = [
        "Dhaka",
        "Chattogram",
        "Rajshahi",
        "Khulna",
        "Barishal",
        "Sylhet",
        "Rangpur",
        "Mymensingh",
      ];
      expect(Object.keys(BD_DIVISIONS)).toEqual(expected);
    });

    it("Dhaka division has 13 districts", () => {
      expect(BD_DIVISIONS.Dhaka).toHaveLength(13);
    });

    it("includes Dhaka as first district in Dhaka division", () => {
      expect(BD_DIVISIONS.Dhaka[0]).toBe("Dhaka");
    });

    it("Sylhet division has 4 districts", () => {
      expect(BD_DIVISIONS.Sylhet).toHaveLength(4);
    });
  });

  describe("DIVISION_NAMES", () => {
    it("is the list of division keys", () => {
      expect(DIVISION_NAMES).toEqual(Object.keys(BD_DIVISIONS));
    });

    it("has 8 entries", () => {
      expect(DIVISION_NAMES).toHaveLength(8);
    });
  });

  describe("districtsForDivision", () => {
    it("returns districts for a valid division", () => {
      const districts = districtsForDivision("Dhaka");
      expect(districts).toContain("Dhaka");
      expect(districts).toContain("Gazipur");
      expect(districts).toContain("Narayanganj");
    });

    it("returns empty array for unknown division", () => {
      expect(districtsForDivision("Unknown")).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      expect(districtsForDivision("")).toEqual([]);
    });

    it("is case-sensitive (follows the data)", () => {
      expect(districtsForDivision("dhaka")).toEqual([]);
      expect(districtsForDivision("Dhaka")).not.toEqual([]);
    });

    it("returns the correct districts for Mymensingh", () => {
      expect(districtsForDivision("Mymensingh")).toEqual([
        "Mymensingh",
        "Jamalpur",
        "Netrokona",
        "Sherpur",
      ]);
    });
  });

  describe("isValidDivisionDistrict", () => {
    it("returns true for valid division-district pair", () => {
      expect(isValidDivisionDistrict("Dhaka", "Dhaka")).toBe(true);
      expect(isValidDivisionDistrict("Dhaka", "Gazipur")).toBe(true);
      expect(isValidDivisionDistrict("Chattogram", "Cox's Bazar")).toBe(true);
    });

    it("returns false for district in wrong division", () => {
      expect(isValidDivisionDistrict("Dhaka", "Chattogram")).toBe(false);
      expect(isValidDivisionDistrict("Sylhet", "Dhaka")).toBe(false);
    });

    it("returns false for unknown division", () => {
      expect(isValidDivisionDistrict("Unknown", "Dhaka")).toBe(false);
    });

    it("returns false for unknown district", () => {
      expect(isValidDivisionDistrict("Dhaka", "FakeDistrict")).toBe(false);
    });

    it("returns false for empty strings", () => {
      expect(isValidDivisionDistrict("", "")).toBe(false);
      expect(isValidDivisionDistrict("Dhaka", "")).toBe(false);
    });

    it("is case-sensitive (matches stored data exactly)", () => {
      expect(isValidDivisionDistrict("Dhaka", "dhaka")).toBe(false);
      expect(isValidDivisionDistrict("dhaka", "Dhaka")).toBe(false);
    });
  });
});
