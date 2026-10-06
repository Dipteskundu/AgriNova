"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { InspectorSchedule } from "@/features/inspector";

export default function Page() {
  return (
    <PortalGate allow={["inspector", "admin"]} moduleLabel="My Schedule">
      <InspectorSchedule />
    </PortalGate>
  );
}
