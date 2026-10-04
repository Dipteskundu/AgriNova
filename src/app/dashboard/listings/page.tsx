"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { ListingsManagement } from "@/features/supplier";

/**
 * `/dashboard/listings` — the produce shelf.
 *
 * Gated to the roles that can actually own one: the create endpoint accepts
 * `farmer`, `supplier` and `admin`, so those are the roles the nav offers it
 * to and the only ones that will not hit a 403.
 */
export default function Page() {
  return (
    <PortalGate allow={["farmer", "supplier", "admin"]} moduleLabel="My Listings">
      <ListingsManagement />
    </PortalGate>
  );
}
