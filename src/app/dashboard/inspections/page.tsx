"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { AssignedInspections } from "@/features/inspector";

/**
 * `/dashboard/inspections` — the inspector's work list.
 *
 * Admins are allowed through to the same list (the endpoint already widens
 * its scope to every record for them) rather than to a separate view: the
 * quality module has one interface and two audiences.
 */
export default function Page() {
  return (
    <PortalGate allow={["inspector", "admin"]} moduleLabel="Inspections">
      <AssignedInspections />
    </PortalGate>
  );
}
