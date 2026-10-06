"use client";
import { DisputesManagement } from "@/features/admin/disputes";
import { MyDisputes } from "@/features/buyer/disputes";
import { PortalGate } from "@/features/layout/PortalGate";

/**
 * Shared URL: the tribunal's board and the claimant's own shelf both live at
 * `/dashboard/disputes` (`ADMIN_ROUTE_MAP` and the buyer's route map point
 * here), exactly as `/dashboard/orders` is Admin Orders or My Orders depending
 * on who is standing in front of it.
 *
 * The gate picks: an admin gets every case and the arbitration modal, a buyer
 * gets only the ones they opened and no buttons at all — settling a case is
 * the tribunal's call, and a shelf you can edit is an appeal you can win.
 */
export default function Page() {
  return (
    <PortalGate
      allow={["admin"]}
      moduleLabel="Disputes"
      fallbackAllow={["buyer"]}
      fallback={<MyDisputes />}
    >
      <DisputesManagement />
    </PortalGate>
  );
}
