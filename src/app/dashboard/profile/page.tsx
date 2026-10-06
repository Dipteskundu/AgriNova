"use client";
import { FarmerProfile } from "@/features/farmer/profile";
import { PortalGate } from "@/features/layout/PortalGate";

/**
 * `/profile` is in `MAIN_OVERVIEW_GROUP`, `INSPECTOR_ROUTE_MAP`,
 * `LOGISTICS_ROUTE_MAP` and `SUPPORT_ROUTE_MAP` — i.e. every role that has a
 * sidebar entry for it. Gating on `farmer` alone would lock buyers and
 * suppliers out of their own account page, so the gate mirrors the nav
 * instead of naming one portal's role.
 */
export default function Page() {
  return (
    <PortalGate
      allow={[
        "farmer",
        "buyer",
        "supplier",
        "inspector",
        "logistics",
        "support",
        "admin",
      ]}
      moduleLabel="Profile"
    >
      <FarmerProfile />
    </PortalGate>
  );
}
