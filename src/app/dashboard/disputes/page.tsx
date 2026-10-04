"use client";
import { DisputesManagement } from "@/features/admin/disputes";
import { PortalGate } from "@/features/layout/PortalGate";

export default function Page() {
  return (
    <PortalGate allow={["admin"]} moduleLabel="Disputes">
      <DisputesManagement />
    </PortalGate>
  );
}
