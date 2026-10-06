/**
 * Shared vocabulary for the dashboard kit.
 *
 * Every role dashboard (farmer, admin, buyer, supplier, inspector, logistics,
 * support) is assembled from the same primitives declared here: a hero, a
 * strip of KPI tiles, a grid of service cards, and an info modal. Defining the
 * types and the tone palette in one place is what lets a service card be a
 * data entry instead of 30 lines of copy-pasted JSX.
 */
import type React from "react";
import type { LucideIcon } from "@/components/icons";

/**
 * Colour palettes for the icon tile and the hover border of a service card.
 *
 * These are written out as literal class strings (rather than composed with
 * template interpolation) so Tailwind's scanner can see them — the whole file
 * is one lookup table, so adding a colour is one edit.
 */
export const TONE_MAP = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "hover:border-emerald-400",
  },
  emeraldDeep: {
    bg: "bg-emerald-50 dark:bg-emerald-500/15",
    text: "text-emerald-800 dark:text-emerald-400",
    border: "hover:border-emerald-500",
  },
  emeraldStrong: {
    bg: "bg-emerald-100/70 dark:bg-emerald-500/15",
    text: "text-emerald-900 dark:text-emerald-400",
    border: "hover:border-emerald-500",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-500/15",
    text: "text-sky-700 dark:text-sky-400",
    border: "hover:border-sky-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    border: "hover:border-amber-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/15",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "hover:border-indigo-400",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-500/15",
    text: "text-teal-700 dark:text-teal-400",
    border: "hover:border-teal-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-400",
    border: "hover:border-rose-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-400",
    border: "hover:border-orange-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-500/15",
    text: "text-purple-700 dark:text-purple-400",
    border: "hover:border-purple-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/15",
    text: "text-violet-700 dark:text-violet-400",
    border: "hover:border-violet-400",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-500/15",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "hover:border-cyan-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-400",
    border: "hover:border-blue-400",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-[#1a1a1a]",
    text: "text-slate-800 dark:text-[#e0e0e0]",
    border: "hover:border-slate-400",
  },
} as const;

export type ServiceTone = keyof typeof TONE_MAP;

/**
 * One entry in a dashboard's service grid.
 *
 * Field names intentionally mirror the shape `FarmerDashboard` already used
 * (`titleBn` / `titleEn` / `badgeBn` …) so migrating a dashboard is a data
 * move rather than a rename. `badge` is optional — cards without one simply
 * drop the chip.
 */
export interface ServiceCardItem {
  /** Stable key for React and for the modal switch. */
  id: string;
  /** Role-aware route key resolved via `getRoute(portal, moduleKey, roles)`. Omit for cards that only open the modal (e.g. the helpline). */
  moduleKey?: string;
  icon: LucideIcon;
  titleBn: string;
  titleEn: string;
  badgeBn?: string;
  badgeEn?: string;
  descBn: string;
  descEn: string;
  tone: ServiceTone;
  /** Marks a card that dials out instead of routing (renders the call CTA). */
  isHelpline?: boolean;
}

/** A clickable figure inside the hero's stat strip. */
export interface HeroStatItem {
  /** Pre-translated label — callers pass `t(bn, en)` or a dictionary key. */
  label: React.ReactNode;
  value: React.ReactNode;
  onClick?: () => void;
  /** Emerald value instead of the default ink (money, profit, health). */
  accent?: boolean;
}

/** KPI tile descriptor consumed by `DashboardStatGrid` → `MetricCard`. */
export interface StatTile {
  id?: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  colorScheme?: "emerald" | "blue" | "amber" | "indigo" | "rose" | "slate";
  onClick?: () => void;
}
