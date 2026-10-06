"use client";

import { useRouter } from "next/navigation";
import { FarmerDashboard } from "@/features/farmer/dashboard";
import { AdminDashboard } from "@/features/admin/dashboard";
import { BuyerDashboard } from "@/features/buyer/dashboard";
import { SupplierDashboard } from "@/features/supplier/dashboard";
import { InspectorDashboard } from "@/features/inspector/dashboard";
import { LogisticsDashboard } from "@/features/logistics/dashboard";
import { SupportDashboard } from "@/features/support/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { getRoute } from "@/features/layout/navConfig";

/**
 * One route, seven audiences.
 *
 * `/dashboard` is shared by every role, so the portal (plus the role list for
 * the two portals that carry more than one) picks the overview. All of the
 * per-role markup now lives in `features/<role>/dashboard` — the inline
 * emoji-stub dashboards that used to live in this file are gone, and the
 * operations portal finally distinguishes its two roles instead of showing
 * logistics the inspector's screen.
 *
 * Every dashboard takes the same `onNavigate` contract, which routes through
 * the role-aware `getRoute` so a module key never has to know its own URL.
 */
export default function DashboardPage() {
  const { portal, user } = useAuth();
  const router = useRouter();
  const roles = user?.roles ?? [];

  const handleNavigate = (moduleKey: string) => {
    router.push(getRoute(portal!, moduleKey, roles));
  };

  switch (portal) {
    case "admin":
      return <AdminDashboard onNavigate={handleNavigate} />;

    case "support":
      return <SupportDashboard onNavigate={handleNavigate} />;

    case "operations":
      // One portal, two jobs: the inspector queues quality work while
      // logistics moves the consignments. A user holding both roles gets the
      // inspector view, which is the more task-heavy of the two.
      return roles.includes("logistics") && !roles.includes("inspector") ? (
        <LogisticsDashboard onNavigate={handleNavigate} />
      ) : (
        <InspectorDashboard onNavigate={handleNavigate} />
      );

    case "main":
      // One portal, three audiences: the marketplace made `main` the home of
      // buyers and suppliers too, so the hero module is picked by role.
      if (roles.includes("farmer")) return <FarmerDashboard onNavigate={handleNavigate} />;
      if (roles.includes("supplier")) return <SupplierDashboard onNavigate={handleNavigate} />;
      return <BuyerDashboard onNavigate={handleNavigate} />;

    default:
      return <FarmerDashboard onNavigate={handleNavigate} />;
  }
}
