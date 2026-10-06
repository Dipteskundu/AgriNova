/**
 * Number and currency formatting shared by every dashboard.
 *
 * These three helpers used to live copy-pasted inside `FarmerDashboard`; they
 * are pulled out here so buyer, supplier, inspector, logistics and support can
 * render Bengali digits and ৳ amounts the exact same way.
 */

/** Latin digits → Bengali digits (no-op on any character that is not 0-9). */
export const bnNum = (v: string | number): string =>
  String(v).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** `1234567` → `৳12,34,567` (Indian grouping, matching the farmer ledger). */
export const fmtBdt = (n: number): string => {
  const sign = n < 0 ? "-" : "";
  return `${sign}৳${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
};

/** Compact variant for badges: `125000` → `৳125.0k`. */
export const fmtBdtShort = (n: number): string => {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 100000) return `${sign}৳${(a / 100000).toFixed(1)}L`;
  if (a >= 1000) return `${sign}৳${(a / 1000).toFixed(1)}k`;
  return `${sign}৳${a}`;
};

/** `2026-10-05T10:30:00Z` → `05 Oct 2026` — used by list-style modal bodies. */
export const fmtDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
