"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { setListingSaved } from "@/lib/marketplaceApi";

type Variant = "overlay" | "inline";

interface Props {
  listingId: string;
  saved: boolean;
  /**
   * Where the heart sits.
   *
   * `overlay` is the image-corner pill used by the card grid — positioned by
   * the caller (the card wraps it in an absolutely placed box) and icon-only,
   * because the crop photo already carries the listing's identity. `inline` is
   * the bordered, labelled button used beside a detail page's cart actions.
   */
  variant?: Variant;
  /**
   * Reacts to a settled change. Omit it on a page with nothing to update and
   * the button still works — state just lives in the server's copy.
   */
  onChange?: (listingId: string, saved: boolean) => void;
  className?: string;
}

/** Base pill/button styling both variants build on. */
const BASE =
  "inline-flex items-center justify-center gap-1.5 font-bold border backdrop-blur-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const VARIANTS: Record<Variant, string> = {
  // Sits on the photo, so it needs its own plate rather than a page colour.
  overlay:
    "w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 border-white/70 dark:border-[#333] hover:bg-white dark:hover:bg-black text-slate-600 dark:text-[#a0a0a0]",
  inline:
    "h-10 px-4 rounded-xl text-sm bg-white dark:bg-[#111] border-slate-200 dark:border-[#333] text-slate-700 dark:text-[#e0e0e0] hover:border-rose-300",
};

/**
 * Heart a listing on or off the reader's shelf.
 *
 * Two things worth knowing:
 *
 *   - The optimistic flip is *reverted* rather than applied unconditionally.
 *     `setListingSaved` returns `saved` from the server, so a 401 or a 404
 *     (the lot was withdrawn between render and click) lands the heart back
 *     where it belongs and says why, instead of leaving it lit for a listing
 *     that was never saved.
 *   - It is hidden entirely for signed-out visitors by its callers, which is
 *     what `GET /saved` would do for them anyway — an anonymous catalogue has
 *     no shelf to save to.
 */
export function SaveToggle({
  listingId,
  saved,
  variant = "overlay",
  onChange,
  className = "",
}: Props) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const res = await setListingSaved(listingId, !saved);
    setBusy(false);

    if (res.success) {
      onChange?.(listingId, res.data.saved);
      return;
    }
    showToast(
      "error",
      saved
        ? t("সংরক্ষিত তালিকা থেকে সরানো যায়নি", "Could not remove from saved")
        : t("সংরক্ষণ করা যায়নি", "Could not save"),
      res.message
    );
  };

  const on = saved;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      aria-label={
        on
          ? t("সংরক্ষিত তালিকা থেকে সরান", "Remove from saved")
          : t("পণ্য সংরক্ষণ করুন", "Save this listing")
      }
      title={
        on
          ? t("সংরক্ষিত তালিকা থেকে সরান", "Remove from saved")
          : t("পণ্য সংরক্ষণ করুন", "Save this listing")
      }
      className={`${BASE} ${VARIANTS[variant]} ${
        on
          ? "text-rose-500 border-rose-300 dark:border-rose-500/40"
          : ""
      } ${className}`}
    >
      {/* `fill-` on the icon only when saved: an outline reads as "not yet",
          a solid heart as "kept". */}
      <Icon
        name="Heart"
        size={variant === "overlay" ? 16 : 15}
        className={on ? "fill-current" : ""}
      />
      {variant === "inline" && (
        <span>{on ? t("সংরক্ষিত", "Saved") : t("সংরক্ষণ করুন", "Save")}</span>
      )}
    </button>
  );
}
