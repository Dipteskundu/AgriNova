"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The rating form — 1–5 whole stars plus a written comment, both required.
 *
 * Shared by the produce and input detail pages; the parent passes a single
 * `onSubmit` closure that knows which API to hit, so this component stays
 * agnostic of the catalogue half it is mounted in.
 *
 * Validation mirrors the server rules exactly (integer 1–5, comment of
 * 10–2000 characters) so a submit that passes here cannot surprise the user
 * with a 400 — the server's message is only the belt to these braces.
 */
interface Props {
  /** Resolves on success; returns falsey + message on failure is NOT needed —
   *  failures throw/return handled by the caller, which toasts them. */
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
}

const MIN_COMMENT = 10;
const MAX_COMMENT = 2000;

export function RatingForm({ onSubmit }: Props) {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const trimmed = comment.trim();
  const commentValid = trimmed.length >= MIN_COMMENT && trimmed.length <= MAX_COMMENT;
  const canSubmit = rating >= 1 && commentValid && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (rating < 1) {
        showToast("error", t("একটি রেটিং নির্বাচন করুন", "Select a star rating first"));
      } else if (trimmed.length < MIN_COMMENT) {
        showToast(
          "error",
          t(
            `মন্তব্য কমপক্ষে ${MIN_COMMENT} অক্ষরের হতে হবে`,
            `Comment must be at least ${MIN_COMMENT} characters`
          )
        );
      }
      return;
    }

    setSubmitting(true);
    const ok = await onSubmit(rating, trimmed);
    setSubmitting(false);

    if (ok) {
      setRating(0);
      setComment("");
      showToast(
        "success",
        t("আপনার রেটিং জমা হয়েছে", "Your rating has been submitted")
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#222] bg-white dark:bg-[#0a0a0a] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon
          name="Star"
          size={16}
          className="text-yellow-400"
          fill="currentColor"
        />
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
          {t("রেটিং ও মতামত দিন", "Rate this product")}
        </h3>
      </div>

      {/* Star picker — buttons rather than a radiogroup to keep the markup
          simple; aria-labels carry the meaning for screen readers. */}
      <div className="flex items-center gap-1.5 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={t(`${star} তারকা`, `${star} star${star > 1 ? "s" : ""}`)}
            aria-pressed={rating === star}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <Icon
              name="Star"
              size={26}
              className={
                star <= (hovered || rating)
                  ? "text-yellow-400"
                  : "text-slate-300 dark:text-[#333]"
              }
              fill={star <= (hovered || rating) ? "currentColor" : "none"}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-[#a0a0a0]">
            {rating}/5
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mb-3">
        {t("১ থেকে ৫ তারকা", "1 to 5 stars")}
      </p>

      <label className="block text-xs font-medium text-slate-500 dark:text-[#a0a0a0] mb-1.5">
        {t("আপনার মন্তব্য", "Your comment")}
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={MAX_COMMENT}
        placeholder={t(
          "এই পণ্য সম্পর্কে আপনার অভিজ্ঞতা লিখুন...",
          "Share your experience with this product..."
        )}
        className="w-full px-3 py-2.5 border border-slate-200 dark:border-[#333] rounded-xl text-sm bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors resize-y"
      />
      <div className="flex items-center justify-between mt-1.5 mb-4">
        <span
          className={`text-[11px] ${
            trimmed.length > 0 && trimmed.length < MIN_COMMENT
              ? "text-amber-600 dark:text-amber-400"
              : "text-slate-400"
          }`}
        >
          {trimmed.length < MIN_COMMENT
            ? t(
                `কমপক্ষে ${MIN_COMMENT} অক্ষর প্রয়োজন`,
                `At least ${MIN_COMMENT} characters required`
              )
            : t("চমৎকার!", "Looks good!")}
        </span>
        <span className="text-[11px] text-slate-400">
          {comment.length}/{MAX_COMMENT}
        </span>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        loading={submitting}
        disabled={!canSubmit}
        icon={Icon.bind(null, { name: "Star" }) as any}
      >
        {t("রেটিং জমা দিন", "Submit Rating")}
      </Button>
    </div>
  );
}
