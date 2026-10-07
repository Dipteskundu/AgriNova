"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { RatingItem } from "@/types";
import { StarRating } from "./StarRating";

/**
 * The reviews feed under the detail pages — every comment with its author,
 * date and stars, newest first (the API already sorts).
 *
 * Long comments truncate at 200 characters behind a "Read more" link rather
 * than a modal: a review is short-form text, and expanding in place keeps the
 * reader on the page with the product they are deciding about. Each row owns
 * only its own expanded state, so opening one does not open the rest.
 */
const TRUNCATE_AT = 200;

/** "2026-10-07T…" → a locale date; keeps invalid input from throwing. */
function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

/** "MK" from a display name — the same initial logic as the listing avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ReviewRow({ item }: { item: RatingItem }) {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const long = item.comment.length > TRUNCATE_AT;
  const text =
    expanded || !long ? item.comment : `${item.comment.slice(0, TRUNCATE_AT)}…`;

  return (
    <li className="p-4 rounded-xl border border-slate-200 dark:border-[#222] bg-slate-50 dark:bg-[#0f0f0f]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[11px] font-bold shrink-0">
          {initials(item.userName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] truncate">
              {item.userName || t("ব্যবহারকারী", "User")}
            </span>
            <StarRating rating={item.rating} size={12} />
            {item.createdAt && (
              <span className="text-[11px] text-slate-400 ml-auto shrink-0">
                {formatDate(item.createdAt)}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-[#a0a0a0] whitespace-pre-wrap break-words">
            {text}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              {expanded
                ? t("কম দেখুন", "Read less")
                : t("আরও পড়ুন", "Read more")}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

interface Props {
  ratings: RatingItem[];
  loading?: boolean;
}

export function ReviewList({ ratings, loading = false }: Props) {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  if (loading) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-slate-200 dark:border-[#222] bg-slate-100 dark:bg-[#111] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!ratings.length) {
    return (
      <div className="flex flex-col items-center text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 dark:border-[#333]">
        <Icon
          name="Star"
          size={22}
          className="text-slate-300 dark:text-[#333]"
        />
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-[#a0a0a0]">
          {t("এখনও কোনো রেটিং নেই", "No reviews yet")}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {t("প্রথম রেটিংটি দিন!", "Be the first to rate this product!")}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {ratings.map((item, idx) => (
        <ReviewRow
          key={`${item.userId}-${item.createdAt}-${idx}`}
          item={item}
        />
      ))}
    </ul>
  );
}
