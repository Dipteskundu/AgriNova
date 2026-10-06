"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { SalesWallet } from "@/features/marketplace/sales/SalesWallet";

/**
 * `/dashboard/sales` — the seller's side of the marketplace: what sold, where
 * each order's escrow sits, and the wallet those releases credit.
 *
 * Gated to the same three roles `GET /api/orders/sales` admits. The gate and
 * the route map in `navConfig.ts` have to agree — one decides who may render
 * the page, the other decides who is allowed to have the URL at all.
 */
export default function Page() {
  return (
    <PortalGate allow={["farmer", "supplier", "admin"]} moduleLabel="Sales & Wallet">
      <SalesWallet />
    </PortalGate>
  );
}
