import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "purple";

interface BadgeProps {
  id?: string;
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  warning: "bg-amber-50 text-amber-800 border-amber-200/80",
  danger: "bg-rose-50 text-rose-700 border-rose-200/80",
  info: "bg-blue-50 text-blue-700 border-blue-200/80",
  purple: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
};

export const Badge: React.FC<BadgeProps> = ({
  id,
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}) => {
  const sizeStyle = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${sizeStyle} ${variantStyles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};