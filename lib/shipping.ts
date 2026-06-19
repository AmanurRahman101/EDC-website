// Flat-rate shipping for Bangladesh, in minor units (poisha).
// Inside Dhaka (Dhaka district): ৳60. Everywhere else: ৳120.

export const SHIPPING_INSIDE_DHAKA = 6000; // ৳60
export const SHIPPING_OUTSIDE_DHAKA = 12000; // ৳120

/**
 * Compute shipping cost (in poisha) from the destination district.
 * "Inside Dhaka" means the Dhaka district specifically.
 */
export function shippingForDivisionDistrict(_division: string, district: string): number {
  return district.trim().toLowerCase() === "dhaka"
    ? SHIPPING_INSIDE_DHAKA
    : SHIPPING_OUTSIDE_DHAKA;
}

export function shippingLabel(district: string): string {
  return district.trim().toLowerCase() === "dhaka" ? "Inside Dhaka" : "Outside Dhaka";
}
