"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { InventoryManagement } from "@/features/supplier";

/**
 * `/dashboard/inventory` — CRUD over the farm inputs that back the public
 * `/inputs` page. Supplier-only: `POST /api/products` is gated to
 * `["supplier", "admin"]`.
 */
export default function Page() {
  return (
    <PortalGate allow={["supplier", "admin"]} moduleLabel="Inventory">
      <InventoryManagement />
    </PortalGate>
  );
}
