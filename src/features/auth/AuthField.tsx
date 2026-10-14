"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Themed icon-input used by both auth forms. Replaces the old glass inputs
 * with token-driven styling so it follows the site's light/dark theme, and
 * adds the premium touches: emerald focus ring, focus-reactive leading icon
 * and a show/hide toggle for password fields.
 *
 * The `auth-input` class hooks into the autofill override in globals.css so
 * browsers that force-fill the field don't paint white-on-white text in
 * light mode (the legacy global autofill rule was written for dark glass).
 */
interface AuthFieldProps {
  id: string;
  /** Pre-localized by the parent form. */
  label: string;
  /** Leading icon node (e.g. `<Mail className="w-4 h-4" />`). */
  icon: React.ReactNode;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export function AuthField({
  id,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: AuthFieldProps) {
  const { language } = useLanguage();
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="auth-input peer w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-2)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors peer-focus:text-emerald-500 dark:peer-focus:text-emerald-400"
        >
          {icon}
        </span>
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={
              language === "bn"
                ? revealed
                  ? "পাসওয়ার্ড লুকান"
                  : "পাসওয়ার্ড দেখান"
                : revealed
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
          >
            {revealed ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
