import React from "react";
import { LucideIcon } from "@/components/icons";

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
  colorScheme?: "emerald" | "blue" | "amber" | "indigo" | "rose" | "slate";
  onClick?: () => void;
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
  },
  blue: {
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-100",
  },
  amber: {
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    border: "border-indigo-100",
  },
  rose: {
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    border: "border-rose-100",
  },
  slate: {
    bg: "bg-slate-100",
    iconColor: "text-slate-700",
    border: "border-slate-200",
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  subtitle,
  colorScheme = "emerald",
  onClick,
}) => {
  const colors = colorMap[colorScheme];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200/80 dark:border-[#222222] p-5 shadow-xs dark-glow transition-all duration-150 ${
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-sm" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-[#a0a0a0] uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-[#f0f0f0] tracking-tight">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : trend === "down"
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-100 text-slate-700 dark:bg-[#1a1a1a] dark:text-[#a0a0a0]"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 dark:text-[#666666] font-normal">{subtitle}</p>}
    </div>
  );
};