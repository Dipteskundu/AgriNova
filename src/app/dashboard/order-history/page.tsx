"use client";

import { BuyerOrders } from "@/features/marketplace/orders/BuyerOrders";

/**
 * Settled orders only. Shares its fetch with `/dashboard/orders` — the nav
 * lists them as two entries, but they are the same collection filtered to
 * `delivered` / `cancelled`.
 */
export default function Page() {
  return <BuyerOrders view="history" />;
}
