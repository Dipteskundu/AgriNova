import React from 'react';
import { PackageOpen, LucideIcon } from '@/components/icons';

interface EmptyStateProps {
  id?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  title,
  description,
  icon: Icon = PackageOpen,
  action,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 ${className}`}
    >
      <div className="p-3 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 text-slate-400 shadow-xs mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{title}</h4>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
