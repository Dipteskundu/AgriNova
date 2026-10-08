"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Lock } from "@/components/icons";

interface PortalGateProps {
  /** Roles allowed to render the wrapped module. */
  allow: string[];
  /** Human-readable name of the module, used in the fallback copy. */
  moduleLabel: string;
  children: React.ReactNode;
  /**
   * Roles that should get a portal-specific component rather than the lock
   * message. Used where two portals share one URL (`/dashboard/orders` is
   * "Admin Orders" for an admin and "My Orders" for a buyer).
   */
  fallbackAllow?: string[];
  /** Rendered for `fallbackAllow` roles in place of `children`. */
  fallback?: React.ReactNode;
}

/** Bengali names for the English `moduleLabel` values the dashboard pages pass. */
const MODULE_LABEL_BN: Record<string, string> = {
  Disputes: "বিতর্ক",
  Inspections: "পরিদর্শন",
  Orders: "অর্ডার",
  "My Listings": "আমার পোস্টিং",
  Inventory: "ইনভেন্টরি",
  "Sales & Wallet": "বিক্রয় ও ওয়ালেট",
  Reports: "রিপোর্ট",
  Payments: "পেমেন্ট",
  "My Schedule": "আমার শিডিউল",
  Saved: "সংরক্ষিত",
  Profile: "প্রোফাইল",
};

const ROLE_LABEL_BN: Record<string, string> = {
  admin: "প্রশাসক",
  buyer: "ক্রেতা",
  farmer: "কৃষক",
  inspector: "পরিদর্শক",
  logistics: "লজিস্টিকস",
  supplier: "সরবরাহকারী",
  support: "সহায়তা",
};

/**
 * Keeps a module from rendering for roles the backend would reject with 403.
 *
 * Several portal route maps deliberately share the same URL (`/dashboard/orders`
 * is "Admin Orders" for the admin portal and "My Orders" for a buyer), so the
 * page component has to decide which feature component to mount. Roles listed
 * in `fallbackAllow` get that alternate component; everyone else gets an
 * explanatory empty state instead of firing a request that is guaranteed to
 * fail.
 */
export function PortalGate({
  allow,
  moduleLabel,
  children,
  fallbackAllow,
  fallback,
}: PortalGateProps) {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-[#222]" />
        <div className="mt-6 h-64 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#111]" />
      </div>
    );
  }

  const roles = user?.roles ?? [];
  const permitted = allow.some((role) => roles.includes(role));

  if (permitted) return <>{children}</>;

  const alternate =
    fallback !== undefined &&
    (fallbackAllow ?? []).some((role) => roles.includes(role));

  if (alternate) return <>{fallback}</>;

  return (
    <div className="p-6">
      <EmptyState
        icon={Lock}
        title={
          language === "bn"
            ? `${MODULE_LABEL_BN[moduleLabel] ?? moduleLabel} এই ভূমিকার জন্য উপলব্ধ নয়`
            : `${moduleLabel} is not available for your role`
        }
        description={
          language === "bn"
            ? `আপনার অ্যাকাউন্ট (${roles.map((role) => ROLE_LABEL_BN[role] ?? role).join(", ") || "কোনো ভূমিকা নেই"}) এই মডিউলটি দেখার অনুমতি পায় না।`
            : `Your account (${roles.join(", ") || "no role"}) does not have access to this module.`
        }
      />
    </div>
  );
}
