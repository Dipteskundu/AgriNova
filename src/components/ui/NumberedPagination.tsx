"use client";

import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Numbered ("1 2 3 …") pagination for the public catalogue grids.
 *
 * A more premium alternative to `LoadMoreButton` for `/products` and
 * `/inputs`: pills styled after the category-pill row on those pages
 * (blue-600 active state, rounded-full), with ellipsis windowing so long
 * lists collapse to `‹ 1 … 4 5 6 … 20 ›` rather than a wall of numbers.
 *
 * Paging itself is owned by `usePagination` (`src/hooks/usePagination.ts`);
 * this component is presentational. It renders nothing while a single page
 * exists, so small result sets look exactly like an unpaginated grid.
 *
 * When `targetRef` is supplied, changing pages smooth-scrolls that element
 * into view — the grid's top — so the new page's first row is visible no
 * matter how far down the buttons were.
 */
interface NumberedPaginationProps {
  /** 1-based, already clamped by the hook. */
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Results container to scroll back to on page change. */
  targetRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

type Token = number | "gap";

/**
 * Windowed page list: always the first and last page plus the current page
 * and its immediate neighbours, extended by one when the window would
 * otherwise touch the edges. A single missing page renders as itself
 * rather than an ellipsis.
 */
function pageTokens(page: number, totalPages: number): Token[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) {
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const tokens: Token[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev === 2) tokens.push(prev + 1);
    else if (p - prev > 2) tokens.push("gap");
    tokens.push(p);
    prev = p;
  }
  return tokens;
}

export function NumberedPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  targetRef,
  className = "",
}: NumberedPaginationProps) {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  // Scroll only on an actual page turn, never on mount or filter rewind.
  const lastPage = useRef(page);
  useEffect(() => {
    if (lastPage.current !== page) {
      lastPage.current = page;
      targetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page, targetRef]);

  if (totalPages <= 1) return null;

  const numberFormat = new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-US");
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const pillBase =
    "inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40";
  const pillIdle =
    "text-slate-600 dark:text-[#a0a0a0] hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400";
  const pillActive = "bg-blue-600 text-white shadow-sm";

  return (
    <nav
      aria-label={t("পৃষ্ঠাসমূহ", "Pagination")}
      className={`mt-8 flex flex-col items-center gap-3 ${className}`}
    >
      <span className="text-xs text-slate-400">
        {language === "bn"
          ? `মোট ${numberFormat.format(total)}টি ফলাফলের মধ্যে ${numberFormat.format(rangeStart)}–${numberFormat.format(rangeEnd)} দেখানো হচ্ছে`
          : `Showing ${numberFormat.format(rangeStart)}–${numberFormat.format(rangeEnd)} of ${numberFormat.format(total)} results`}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("আগের পৃষ্ঠা", "Previous page")}
          className={`${pillBase} ${pillIdle} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:disabled:hover:text-[#a0a0a0]`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageTokens(page, totalPages).map((token, idx) =>
          token === "gap" ? (
            <span
              key={`gap-${idx}`}
              aria-hidden="true"
              className="inline-flex items-center justify-center min-w-9 h-9 text-sm text-slate-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={token}
              type="button"
              onClick={() => onPageChange(token)}
              aria-current={token === page ? "page" : undefined}
              aria-label={t(`পৃষ্ঠা ${token}`, `Page ${token}`)}
              className={`${pillBase} ${token === page ? pillActive : pillIdle}`}
            >
              {numberFormat.format(token)}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("পরের পৃষ্ঠা", "Next page")}
          className={`${pillBase} ${pillIdle} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:disabled:hover:text-[#a0a0a0]`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
