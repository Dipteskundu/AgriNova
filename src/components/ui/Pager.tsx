"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Prev/next pager footer for client-side paginated lists.
 *
 * Visual match for the footer of `DataTable` ("Showing X to Y of Z" plus
 * chevron buttons), extracted so tables and card lists that keep their own
 * bespoke markup can share the same paging affordance without being
 * restructured into `DataTable` columns.
 *
 * Renders nothing while there is a single page — lists that fit on one
 * screen look exactly as they did before.
 */
interface PagerProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pager({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className = "",
}: PagerProps) {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  if (totalPages <= 1) return null;

  const numberFormat = new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-US");
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const buttonClass =
    "p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div
      className={`px-4 py-3 border-t border-slate-100 dark:border-slate-600/60 bg-slate-50/50 dark:bg-slate-700/50 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <span>
        {language === "bn"
          ? `মোট ${numberFormat.format(total)}টি রেকর্ডের মধ্যে ${numberFormat.format(rangeStart)}–${numberFormat.format(rangeEnd)} দেখানো হচ্ছে`
          : `Showing ${numberFormat.format(rangeStart)} to ${numberFormat.format(rangeEnd)} of ${numberFormat.format(total)} entries`}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("আগের পৃষ্ঠা", "Previous page")}
          className={buttonClass}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
          {numberFormat.format(page)} / {numberFormat.format(totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("পরের পৃষ্ঠা", "Next page")}
          className={buttonClass}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Incremental reveal for public card grids (Browse Produce, Inputs), where
 * a "Load more" button reads better than numbered pages. Renders nothing
 * once everything is on screen.
 */
interface LoadMoreButtonProps {
  hasMore: boolean;
  onLoadMore: () => void;
  /** How many more items the next batch reveals, for the aria hint. */
  batchSize?: number;
  label?: string;
}

export function LoadMoreButton({ hasMore, onLoadMore, label }: LoadMoreButtonProps) {
  const { language } = useLanguage();

  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        onClick={onLoadMore}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-[#333] bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
      >
        {label ?? (language === "bn" ? "আরও দেখুন" : "Load more")}
      </button>
    </div>
  );
}
