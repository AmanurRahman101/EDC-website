// Currency helpers for Bangladeshi Taka (BDT).
// Values are stored as minor units (poisha). 100 poisha = 1 Taka.

export const TAKA = "\u09f3"; // ৳

/**
 * Format a minor-unit (poisha) integer as a Taka string, e.g. 2850000 -> "৳28,500".
 * Whole-taka display with thousands separators (no decimals, which matches
 * typical Bangladeshi e-commerce pricing).
 */
export function formatTk(minor: number): string {
  const taka = Math.round((minor || 0) / 100);
  return `${TAKA}${taka.toLocaleString("en-US")}`;
}

/** Convert a whole-taka number (e.g. from an admin input) into minor units. */
export function takaToMinor(taka: number): number {
  return Math.round((taka || 0) * 100);
}

/** Convert minor units back to whole taka for editing in admin inputs. */
export function minorToTaka(minor: number): number {
  return Math.round((minor || 0) / 100);
}
