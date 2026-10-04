"use client";
import { ReportsManagement } from "@/features/admin/reports";
import { InspectionReports } from "@/features/inspector";
import { PortalGate } from "@/features/layout/PortalGate";

/**
 * `/dashboard/reports` is shared: the admin portal's platform-wide report and
 * the inspector's own certificates. The gate picks by role rather than
 * splitting into two URLs, which is how the other shared pages work.
 */
export default function Page() {
  return (
    <PortalGate
      allow={["admin"]}
      moduleLabel="Reports"
      fallbackAllow={["inspector"]}
      fallback={<InspectionReports />}
    >
      <ReportsManagement />
    </PortalGate>
  );
}
