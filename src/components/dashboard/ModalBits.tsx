"use client";

import React from "react";
import { CheckCircle2 } from "@/components/icons";

/**
 * Small building blocks for the body of `ServiceInfoModal`.
 *
 * Every role's modal content repeats the same four shapes — a highlighted
 * summary band, a label/value cell, a list row with a status chip, and an
 * empty state. Giving them names here keeps each dashboard's modal body to
 * data instead of one-off class strings.
 */

/** Label-over-value cell used in the `grid-cols-2` pairs. */
export const ModalStat: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}> = ({ label, value, className = "", valueClassName = "" }) => (
  <div
    className={`p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] ${className}`}
  >
    <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">
      {label}
    </span>
    <span
      className={`text-base font-black text-slate-900 dark:text-[#f0f0f0] ${valueClassName}`}
    >
      {value}
    </span>
  </div>
);

/** A list row: primary text, secondary line, and an optional right-hand chip. */
export const ModalRow: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  chip?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, chip, className = "" }) => (
  <div
    className={`p-2.5 rounded-xl border border-slate-100 dark:border-[#222222] flex items-center justify-between gap-2.5 bg-slate-50 dark:bg-[#111111]/60 ${className}`}
  >
    <div className="min-w-0">
      <p className="font-bold text-slate-900 dark:text-[#f0f0f0] truncate">
        {title}
      </p>
      {subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] truncate">
          {subtitle}
        </p>
      )}
    </div>
    {chip && <div className="shrink-0">{chip}</div>}
  </div>
);

/** Small pill chip — pairs with `Badge` when a variant is needed. */
export const ModalChip: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

/** Neutral empty state with the "everything is in sync" reassurance line. */
export const ModalEmpty: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-200 dark:border-[#222222] text-slate-700 dark:text-[#999999] leading-relaxed">
    {children}
  </div>
);

/** The green "records synchronized" footer strip used by the farmer modal. */
export const ModalSyncedNote: React.FC<{ label: React.ReactNode }> = ({
  label,
}) => (
  <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-200 dark:border-[#222222] text-slate-700 dark:text-[#999999] flex items-center gap-2">
    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
    <span>{label}</span>
  </div>
);
