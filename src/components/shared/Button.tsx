import React from "react";
import { LucideIcon } from "@/components/icons";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  id,
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white border-transparent shadow-xs",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-xs",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      id={id}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg border transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};