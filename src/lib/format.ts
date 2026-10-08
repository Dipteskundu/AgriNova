/**
 * Number and currency formatting shared by every dashboard.
 *
 * These three helpers used to live copy-pasted inside `FarmerDashboard`; they
 * are pulled out here so buyer, supplier, inspector, logistics and support can
 * render Bengali digits and ৳ amounts the exact same way.
 */

import { getAppLanguage } from "./localize";

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

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/** `2026-10-05` → `০৫ অক্টোবর ২০২৬` (bn) / `05 Oct 2026` (en). */
export const fmtDateBn = (iso?: string): string => {
  if (!iso) return "—";
  if (getAppLanguage() !== "bn") return fmtDate(iso);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return bnNum(iso.slice(0, 10));
  return `${bnNum(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${bnNum(d.getFullYear())}`;
};

/**
 * `2026-09-16 11:30` → `১৬ সেপ্টেম্বর ২০২৬, ১১:৩০` (bn) / unchanged (en).
 * Parses the parts directly so a date-only string can never shift a day
 * across time zones.
 */
export const fmtDateTimeBn = (value?: string): string => {
  if (!value) return "—";
  if (getAppLanguage() !== "bn") return value;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return bnNum(value);
  const date = `${bnNum(Number(m[2]))} ${BN_MONTHS[Number(m[1]) - 1]} ${bnNum(Number(m[3]))}`;
  return m[4] ? `${date}, ${bnNum(m[4])}:${bnNum(m[5])}` : date;
};
