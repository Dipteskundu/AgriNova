import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", id, ...props }) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 transition-all duration-200 dark:bg-[#0a0a0a] dark:border-[#222222] dark-glow dark:hover:border-[#333333] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-[#1a1a1a] ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-[#f0f0f0] tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
