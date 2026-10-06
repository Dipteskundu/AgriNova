"use client";

import React from "react";
import type { HeroStatItem } from "./types";

interface DashboardHeroProps {
  /** `light` = the farmer-style greeting card, `dark` = the admin command banner. */
  variant?: "light" | "dark";
  /** Row above the title — season/location pill, network badge, etc. */
  meta?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned CTAs (helpline pill, broadcast buttons …). */
  actions?: React.ReactNode;
  /** Optional strip of clickable KPIs rendered under a divider. */
  stats?: HeroStatItem[];
}

/**
 * The top card every dashboard opens with.
 *
 * Both reference designs were independently hand-rolling this shape: a meta
 * row, a `font-black` title, a muted one-liner, right-side actions, and (for
 * the farmer) a four-cell stat strip. Unifying them here means a new role
 * dashboard gets the premium header by passing four props instead of copying
 * ~70 lines of markup.
 */
export const DashboardHero: React.FC<DashboardHeroProps> = ({
  variant = "light",
  meta,
  title,
  subtitle,
  actions,
  stats,
}) => {
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "bg-slate-900 text-white p-6 rounded-2xl shadow-sm"
          : "bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 p-4 sm:p-5 shadow-xs"
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          {meta && (
            <div
              className={
                isDark
                  ? "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2"
                  : "inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
              }
            >
              {meta}
            </div>
          )}
          <h1
            className={
              isDark
                ? "text-xl font-black tracking-tight"
                : "text-lg sm:text-xl font-black text-slate-900 dark:text-[#f0f0f0] tracking-tight"
            }
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={
                isDark
                  ? "text-xs text-slate-400 max-w-xl"
                  : "text-xs text-slate-500 dark:text-[#a0a0a0]"
              }
            >
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-4 mt-4 border-t ${
            isDark
              ? "border-white/10"
              : "border-slate-100 dark:border-[#222222]"
          }`}
        >
          {stats.map((stat, index) => {
            const cell = (
              <>
                <span
                  className={`text-[11px] block ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500 dark:text-[#a0a0a0]"
                  }`}
                >
                  {stat.label}
                </span>
                <span
                  className={`text-base font-black ${
                    stat.accent
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isDark
                        ? "text-white"
                        : "text-slate-900 dark:text-[#f0f0f0]"
                  }`}
                >
                  {stat.value}
                </span>
              </>
            );

            return stat.onClick ? (
              <button
                key={index}
                type="button"
                onClick={stat.onClick}
                className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-slate-50 dark:bg-[#111111]/60 hover:bg-emerald-50/50"
                }`}
              >
                {cell}
              </button>
            ) : (
              <div
                key={index}
                className={`p-2.5 rounded-xl ${
                  isDark ? "bg-white/5" : "bg-slate-50 dark:bg-[#111111]/60"
                }`}
              >
                {cell}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
