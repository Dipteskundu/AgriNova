"use client";

import React from "react";
import { ArrowRight } from "@/components/icons";
import { TONE_MAP, type ServiceCardItem } from "./types";
import { useT } from "./useT";

interface ServiceCardProps {
  item: ServiceCardItem;
  onSelect: (item: ServiceCardItem) => void;
}

/**
 * The clickable service tile used by every role's grid.
 *
 * Markup is a direct lift of the farmer card (icon tile + badge chip, title,
 * two-line description, "View Info →" footer) with the three hard-coded colour
 * classes replaced by a `TONE_MAP` lookup — so a card is now a data entry.
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({ item, onSelect }) => {
  const t = useT();
  const tone = TONE_MAP[item.tone];
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between text-left group ${tone.border}`}
    >
      <div>
        {/* Icon Tile & Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-11 h-11 rounded-xl ${tone.bg} ${tone.text} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {(item.badgeBn || item.badgeEn) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] truncate max-w-[90px]">
              {t(item.badgeBn ?? "", item.badgeEn ?? "")}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          {t(item.titleBn, item.titleEn)}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] mt-1 line-clamp-2 leading-relaxed">
          {t(item.descBn, item.descEn)}
        </p>
      </div>

      {/* Subtle Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#222222] flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-[#a0a0a0] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        <span>{t("তথ্য দেখুন", "View Info")}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
