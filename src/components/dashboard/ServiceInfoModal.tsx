"use client";

import React, { useEffect } from "react";
import { ArrowUpRight, X } from "@/components/icons";
import { TONE_MAP, type ServiceCardItem } from "./types";
import { useT } from "./useT";

interface ServiceInfoModalProps {
  item: ServiceCardItem;
  onClose: () => void;
  /** Fires when the footer's "Open Full Page" is pressed. Omit for cards with no `moduleKey` (the button is hidden anyway). */
  onOpenPage?: () => void;
  /** Live detail body for this card — each dashboard renders its own content here. */
  children: React.ReactNode;
}

/**
 * The "click a service card → see details → open the full page" dialog.
 *
 * Extracted from `FarmerDashboard`, which owned ~430 lines of shell + content.
 * The shell (backdrop, header, scroll body, footer with Close / Open Full
 * Page) lives here; only the body is injected, so every role gets the same
 * interaction with none of the duplicated chrome.
 */
export const ServiceInfoModal: React.FC<ServiceInfoModalProps> = ({
  item,
  onClose,
  onOpenPage,
  children,
}) => {
  const t = useT();
  const tone = TONE_MAP[item.tone];
  const Icon = item.icon;

  // Lock body scroll while the dialog is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Escape closes — the backdrop handles clicks.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-[#222222] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t(item.titleBn, item.titleEn)}
      >
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-[#222222] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl ${tone.bg} ${tone.text} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-[#f0f0f0] truncate">
                {t(item.titleBn, item.titleEn)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#a0a0a0] line-clamp-2">
                {t(item.descBn, item.descEn)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-[#999999] hover:bg-slate-100 hover:dark:bg-[#1a1a1a] dark:bg-[#1a1a1a] transition-colors cursor-pointer shrink-0"
            aria-label={t("বন্ধ করুন", "Close dialog")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Live Content Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
          {children}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-[#111111]/60 border-t border-slate-100 dark:border-[#222222] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-[#a0a0a0] hover:bg-slate-200/60 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            {t("বন্ধ করুন", "Close")}
          </button>

          {item.moduleKey && onOpenPage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPage();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t("সম্পূর্ণ পাতা খুলুন", "Open Full Page")}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
