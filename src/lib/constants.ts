export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const USER_ROLES = {
  FARMER: "farmer",
  BUYER: "buyer",
  SUPPLIER: "supplier",
  INSPECTOR: "inspector",
  LOGISTICS: "logistics",
  SUPPORT: "support",
  ADMIN: "admin",
} as const;

export const CROP_SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export const QUALITY_GRADES = ["A+", "A", "B+", "B", "C"] as const;

export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

export const PAYMENT_STATUS = [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
] as const;
