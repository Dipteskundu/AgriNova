"use client";

import React from "react";
import { Icon } from "@/components/icons";

/**
 * Read-only star display — used by the browse cards, the detail headers and
 * the review list, so the star look lives in exactly one place.
 *
 * Whole stars only: the platform rates 1–5 in integers (no half stars), so a
 * display simply rounds the average and lets the count next to it carry the
 * precision. Filled stars override the icon's default `fill="none"` — the
 * `Icon` component spreads extra props after its own attributes, so
 * `fill="currentColor"` wins without touching the shared icon set.
 */
interface Props {
  /** 0–5. Rounded for display; 0 renders five empty stars. */
  rating: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, size = 14, className = "" }: Props) {
  const rounded = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rounded ? (
          <Icon
            key={star}
            name="Star"
            size={size}
            className="text-yellow-400"
            fill="currentColor"
          />
        ) : (
          <Icon
            key={star}
            name="Star"
            size={size}
            className="text-yellow-300/50 dark:text-yellow-500/30"
          />
        )
      )}
    </span>
  );
}
