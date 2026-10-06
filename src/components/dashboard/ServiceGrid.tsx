"use client";

import React from "react";
import { ServiceCard } from "./ServiceCard";
import type { ServiceCardItem } from "./types";
import { useT } from "./useT";

interface ServiceGridProps {
  items: ServiceCardItem[];
  onSelect: (item: ServiceCardItem) => void;
  /** Section label. Defaults to "Services (Click Icon for Details)". */
  label?: string;
}

/**
 * The sectioned card grid shared by all dashboards: a tracked-out uppercase
 * header with a live count, then the responsive 2→6 column grid.
 */
export const ServiceGrid: React.FC<ServiceGridProps> = ({
  items,
  onSelect,
  label,
}) => {
  const t = useT();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#666666]">
          {label ?? t("সেবাসমূহ (আইকনে ক্লিক করে তথ্য দেখুন)", "Services (Click Icon for Details)")}
        </h2>
        <span className="text-xs text-slate-400 dark:text-[#666666]">
          {items.length} {t("টি সেবা", "Services")}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {items.map((item) => (
          <ServiceCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};
