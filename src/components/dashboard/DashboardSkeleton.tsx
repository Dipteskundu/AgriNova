"use client";

import React from "react";

interface DashboardSkeletonProps {
  /** `full` = hero + KPI row + card grid, `metrics` = hero + KPI row only. */
  variant?: "full" | "metrics";
}

/**
 * The one loading state for every dashboard.
 *
 * Previously each dashboard hand-rolled its own pulse blocks (three different
 * shapes across four files). This reproduces the farmer dashboard's skeleton —
 * the most complete of them — and drops the card grid for dashboards that
 * render a KPI row instead.
 */
export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  variant = "full",
}) => (
  <div className="space-y-6">
    {/* Hero */}
    <div className="h-28 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] animate-pulse" />

    {/* KPI row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-28 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222] p-4 animate-pulse"
        >
          <div className="h-3 w-20 bg-slate-200/70 dark:bg-[#1a1a1a] rounded-md animate-pulse mb-3" />
          <div className="h-8 w-28 bg-slate-200/70 dark:bg-[#1a1a1a] rounded-md animate-pulse" />
        </div>
      ))}
    </div>

    {/* Service grid */}
    {variant === "full" && (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-40 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] p-4 animate-pulse"
          />
        ))}
      </div>
    )}
  </div>
);
