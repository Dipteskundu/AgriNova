"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Compass } from "@/components/icons";

interface PortalComingSoonProps {
  /** Page heading, e.g. "Demand Board". */
  title: string;
  /** One-line explanation of what the module will do. */
  description: string;
  /** Phase that ships the real implementation, e.g. "Phase 2". */
  phase: string;
}

/**
 * Stand-in for a portal route that has a nav entry and a route-map target but
 * no real page yet. Without this, clicking the nav item is a hard 404.
 *
 * Each placeholder is deleted when its real page lands in Phases 1-4.
 */
export function PortalComingSoon({
  title,
  description,
  phase,
}: PortalComingSoonProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#f0f0f0]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#a0a0a0]">
          {description}
        </p>
      </div>

      <EmptyState
        icon={Compass}
        title={
          language === "bn"
            ? "এই মডিউল নির্মাণাধীন"
            : "This module is under construction"
        }
        description={
          language === "bn"
            ? `${phase} পর্যায়ে যুক্ত হবে।`
            : `Ships in ${phase} of the Marketplace & Business Portals plan.`
        }
      />
    </div>
  );
}
