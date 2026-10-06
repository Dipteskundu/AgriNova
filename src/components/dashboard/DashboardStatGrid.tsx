"use client";

import React from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import type { StatTile } from "./types";

interface DashboardStatGridProps {
  tiles: StatTile[];
}

/**
 * The four-across KPI row used by the admin dashboard, now shared by every
 * role. It is a thin composition over the existing `MetricCard` from the UI
 * kit — the kit already had the component, it simply had no consumers outside
 * `AdminDashboard`.
 */
export const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({
  tiles,
}) => {
  if (tiles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <MetricCard
          key={tile.id ?? tile.title}
          id={tile.id}
          title={tile.title}
          value={tile.value}
          icon={tile.icon}
          change={tile.change}
          trend={tile.trend}
          subtitle={tile.subtitle}
          colorScheme={tile.colorScheme}
          onClick={tile.onClick}
        />
      ))}
    </div>
  );
};
