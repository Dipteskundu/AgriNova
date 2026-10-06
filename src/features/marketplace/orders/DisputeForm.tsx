"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  openOrderDispute,
  DISPUTE_REASONS,
  type BuyerOrder,
  type DisputeReason,
} from "@/lib/marketplaceApi";

interface Props {
  orderId: string;
  /** The fresh order the API returns, so the caller can re-render in place. */
  onOpened: (order: BuyerOrder) => void;
  onCancel: () => void;
  /** Classes for the `<form>` itself — the caller owns the rules around it. */
  className?: string;
  /** Freeze the form while some *other* action on the same order is in flight. */
  disabled?: boolean;
}

/**
 * The "something went wrong" form.
 *
 * Extracted because the order list and the order detail page both offer it:
 * a buyer who spots a problem in a list row should not have to open the order
 * to report it, and the two copies would otherwise drift on the reason list
 * the backend validates against.
 *
 * It owns its own submit state, which is what lets a list show one open form
 * per row without a parent tracking which row is busy.
 */
export function DisputeForm({
  orderId,
  onOpened,
  onCancel,
  className = "",
  disabled = false,
}: Props) {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [reason, setReason] = useState<DisputeReason>("Order Not Received");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const locked = busy || disabled;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (locked) return;
    setBusy(true);
    const res = await openOrderDispute(orderId, { reason, note: note.trim() });
    setBusy(false);

    if (res.success && res.data) {
      onOpened(res.data);
      setNote("");
      showToast(
        "warning",
        t("বিরোধ খোলা হয়েছে", "Dispute opened"),
        t("নিষ্পত্তি না হওয়া পর্যন্ত রাখা টাকা স্থির থাকবে।", "Held funds are frozen until the case is resolved.")
      );
    } else {
      showToast(
        "error",
        t("বিরোধ খোলা যায়নি", "Could not open the dispute"),
        res.message
      );
    }
  };

  return (
    <form onSubmit={submit} className={className}>
      <div>
        <label
          htmlFor="dispute-reason"
          className="block text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-1"
        >
          {t("কী সমস্যা হয়েছে?", "What went wrong?")}
        </label>
        <select
          id="dispute-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as DisputeReason)}
          disabled={locked}
          className="w-full rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] px-3 py-2 text-sm text-slate-800 dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DISPUTE_REASONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        <label
          htmlFor="dispute-note"
          className="block text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-1"
        >
          {t("বিস্তারিত (ঐচ্ছিক)", "Details (optional)")}
        </label>
        <textarea
          id="dispute-note"
          rows={3}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={locked}
          placeholder={t("আপনি কী পেয়েছেন, বা কী পাননি?", "What did you receive, or not receive?")}
          className="w-full rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] px-3 py-2 text-sm text-slate-800 dark:text-[#e0e0e0] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={locked}
          onClick={onCancel}
        >
          {t("বাতিল", "Cancel")}
        </Button>
        <Button type="submit" variant="danger" size="sm" loading={busy} disabled={locked}>
          {t("বিরোধ খুলুন", "Open dispute")}
        </Button>
      </div>
    </form>
  );
}
