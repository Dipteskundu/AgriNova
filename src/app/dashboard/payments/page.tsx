"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { PaymentsManagement } from "@/features/admin/payments";
import { BuyerPayments } from "@/features/buyer/payments";

/**
 * Shared URL, same situation as `/dashboard/orders`: admin sees the payout
 * ledger, a buyer sees their own escrowed purchases.
 */
export default function Page() {
  return (
    <PortalGate
      allow={["admin"]}
      moduleLabel="Payments"
      // Same rule as `/dashboard/orders`: escrow and refunds belong to every
      // participant in the marketplace, not to one role.
      fallbackAllow={["farmer", "buyer", "supplier"]}
      fallback={<BuyerPayments />}
    >
      <PaymentsManagement />
    </PortalGate>
  );
}
