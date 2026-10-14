"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Shared Google/GitHub sign-in buttons (plus the "or" divider) used by both
 * the login and register screens. Solid theme-aware surfaces replace the old
 * glass buttons so they read cleanly on the new light form panel.
 */
interface SocialButtonsProps {
  loading: boolean;
  onGoogle: () => void;
  onGitHub: () => void;
}

const GOOGLE_ICON = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GITHUB_ICON = (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export function SocialButtons({ loading, onGoogle, onGitHub }: SocialButtonsProps) {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const buttonClass =
    "flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-2)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-surface-3)] hover:shadow-md cursor-pointer disabled:opacity-50 disabled:hover:shadow-none";

  return (
    <div>
      {/* Divider */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border-default)]" />
        <span className="text-xs text-[var(--text-muted)]">{t("অথবা", "or")}</span>
        <div className="h-px flex-1 bg-[var(--border-default)]" />
      </div>

      <div className="space-y-3">
        <button type="button" onClick={onGoogle} disabled={loading} className={buttonClass}>
          {GOOGLE_ICON}
          {loading ? <Spinner /> : t("গুগল দিয়ে চালিয়ে যান", "Continue with Google")}
        </button>
        <button type="button" onClick={onGitHub} disabled={loading} className={buttonClass}>
          {GITHUB_ICON}
          {loading ? <Spinner /> : t("গিটহাব দিয়ে চালিয়ে যান", "Continue with GitHub")}
        </button>
      </div>
    </div>
  );
}
