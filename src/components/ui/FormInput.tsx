import React from "react";
import { tr } from "@/lib/localize";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<InputProps> = ({
  id,
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-[#a0a0a0]">
          {label} {props.required && <span className="text-rose-500">{tr('*')}</span>}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2 text-sm bg-white text-slate-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all dark:bg-[#0a0a0a] dark:text-[#f0f0f0] dark:border-[#222222] dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400 dark:focus:shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ${
          error ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-300 hover:border-slate-400 dark:hover:border-[#333333]"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-400 dark:text-[#666666]">{helperText}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const FormSelect: React.FC<SelectProps> = ({
  id,
  label,
  error,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-[#a0a0a0]">
          {label} {props.required && <span className="text-rose-500">{tr('*')}</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-2 text-sm bg-white text-slate-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all dark:bg-[#0a0a0a] dark:text-[#f0f0f0] dark:border-[#222222] dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400 dark:focus:shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ${
          error ? "border-rose-300" : "border-slate-300 hover:border-slate-400 dark:hover:border-[#333333]"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  error?: string;
}

export const FormTextarea: React.FC<TextareaProps> = ({
  id,
  label,
  error,
  className = "",
  rows = 3,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-[#a0a0a0]">
          {label} {props.required && <span className="text-rose-500">{tr('*')}</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full px-3.5 py-2 text-sm bg-white text-slate-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all dark:bg-[#0a0a0a] dark:text-[#f0f0f0] dark:border-[#222222] dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400 dark:focus:shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ${
          error ? "border-rose-300" : "border-slate-300 hover:border-slate-400 dark:hover:border-[#333333]"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
};
