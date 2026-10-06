"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Icon, Scale } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMyDisputes } from "@/lib/marketplaceApi";
import type { DisputeCase } from "@/types";

type Variant = "info" | "warning" | "success" | "neutral" | "danger";

/**
 * Where a case stands. Both scripts live here rather than in a dictionary
 * because this is a closed set the backend defines and the page must be able
 * to say it without hunting a translation.
 */
const CASE_STATUS: Record<
  DisputeCase["caseStatus"],
  { label: string; labelBn: string; variant: Variant }
> = {
  "Open - Under Review": {
    label: "Under Review",
    labelBn: "পর্যালোচনায়",
    variant: "warning",
  },
  "Mediation In Progress": {
    label: "In Mediation",
    labelBn: "মধ্যস্থতা চলছে",
    variant: "info",
  },
  "Resolved - Buyer Refunded": {
    label: "Refunded to You",
    labelBn: "আপনাকে ফেরত",
    variant: "success",
  },
  "Resolved - Farmer Compensated": {
    label: "Settled",
    labelBn: "নিষ্পত্তি হয়েছে",
    variant: "success",
  },
  Dismissed: { label: "Dismissed", labelBn: "খারিজ", variant: "neutral" },
};

/** The six reasons `disputeRules()` accepts, said in both scripts. */
const REASON_LABEL: Record<DisputeCase["disputeReason"], { bn: string; en: string }> = {
  "Order Not Received": { bn: "মাল পাওয়া যায়নি", en: "Order Not Received" },
  "Produce Grade Degradation": { bn: "পণ্যের গ্রেড নামছে", en: "Produce Grade Degradation" },
  "Moisture Mismatch": { bn: "আর্দ্রতার অমিল", en: "Moisture Mismatch" },
  "Delivery Transit Spoilage": { bn: "পরিবহনে পণ্য নষ্ট", en: "Delivery Transit Spoilage" },
  "Weight Shortage": { bn: "ওজন ঘাটতি", en: "Weight Shortage" },
  "Payment Delay": { bn: "পেমেন্ট বিলম্ব", en: "Payment Delay" },
};

const ROLE_LABEL: Record<string, { bn: string; en: string }> = {
  Farmer: { bn: "কৃষক", en: "Farmer" },
  Supplier: { bn: "সরবরাহকারী", en: "Supplier" },
  Buyer: { bn: "ক্রেতা", en: "Buyer" },
  "Logistics Provider": { bn: "লজিস্টিক সেবা", en: "Logistics Provider" },
};

/** A case that is still open is one whose escrow is still frozen. */
function isOpen(c: DisputeCase) {
  return c.caseStatus === "Open - Under Review" || c.caseStatus === "Mediation In Progress";
}

/**
 * `/dashboard/disputes` for a buyer — their own cases, read-only.
 *
 * Read-only by design, and not for want of buttons: the money is already
 * frozen the moment a case opens, the outcome is the tribunal's to write, and
 * this shelf's job is to answer "what did I claim, against whom, and where has
 * it got to" without letting the claimant grade their own appeal.
 *
 * Admin shares the URL but not this component — the portal gate sends them to
 * the arbitration board, which is the only place a case can be settled.
 */
export function MyDisputes() {
  const router = useRouter();
  const { language } = useLanguage();

  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The retry: it re-runs the effect without a reload, so the shelf keeps its
  // state in React instead of throwing the page away to try once more.
  const [attempt, setAttempt] = useState(0);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  useEffect(() => {
    let cancelled = false;

    // Nested rather than lifted: the lint rule that keeps state writes out of
    // effects only sees through a function declared inside the effect body.
    async function load() {
      setLoading(true);
      const res = await getMyDisputes();
      if (cancelled) return;
      if (res.success) {
        setCases(res.data);
        setError(null);
      } else {
        setError(
          res.message || t("আপনার মামলাগুলো লোড করা যায়নি।", "Could not load your cases.")
        );
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // Deliberately not depending on `language`: re-fetching every time someone
    // switches scripts would buy a translated error message at the cost of a
    // round trip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = () => {
    setError(null);
    setAttempt((n) => n + 1);
  };

  const open = cases.filter(isOpen).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("আমার বিরোধ", "My Disputes")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mt-0.5">
            {loading
              ? t("লোড হচ্ছে...", "Loading...")
              : error
                ? t("মামলার তালিকা আনা যায়নি", "Your cases could not be loaded")
                : t(
                    `${cases.length} টি মামলা · ${open} টি চলমান`,
                    `${cases.length} case${cases.length === 1 ? "" : "s"} · ${open} still open`
                  )}
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors self-start"
        >
          <Icon name="ClipboardList" size={14} />
          {t("অর্ডার", "My Orders")}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          id="disputes-error"
          icon={AlertTriangle}
          title={t("মামলার তালিকা আনা যায়নি", "Could not load your cases")}
          description={error}
          action={
            <Button variant="outline" onClick={retry}>
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          }
        />
      ) : cases.length === 0 ? (
        <EmptyState
          id="disputes-empty"
          icon={Scale}
          title={t("কোনো মামলা নেই", "No cases yet")}
          description={t(
            "অর্ডারে কোনো সমস্যা হলে ‘সমস্যার খবর দিন’ চাপুন — সেটিই এখানে মামলা হিসেবে আসবে।",
            "If something is wrong with an order, use “Report a problem” on it — that is what becomes a case here."
          )}
          action={
            <Button onClick={() => router.push("/dashboard/orders")}>
              {t("অর্ডার দেখুন", "Go to my orders")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const status = CASE_STATUS[c.caseStatus] || CASE_STATUS["Open - Under Review"];
            const reason = REASON_LABEL[c.disputeReason];
            const defendantRole = ROLE_LABEL[c.defendant.role];
            const frozen = isOpen(c);

            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
                      {c.caseNumber}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t("অর্ডার", "Order")}{" "}
                      <span className="font-mono">{c.relatedOrderCode}</span>
                    </p>
                  </div>
                  <Badge variant={status.variant}>{t(status.labelBn, status.label)}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                  <span className="text-slate-400">{t("দাবির কারণ", "Reason")}</span>
                  <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">
                    {reason ? t(reason.bn, reason.en) : c.disputeReason}
                  </span>
                  <span className="text-slate-400">{t("দাবিকৃত অঙ্ক", "Amount claimed")}</span>
                  <span className="font-black text-blue-700 dark:text-blue-400">
                    ৳{c.disputedAmountBdt.toLocaleString()}
                  </span>
                  <span className="text-slate-400">{t("খোলা হয়েছে", "Opened")}</span>
                  <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">
                    {c.openedAt}
                  </span>
                  <span className="text-slate-400">{t("বিপক্ষে", "Against")}</span>
                  <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">
                    {c.defendant.name}
                    {defendantRole
                      ? ` · ${t(defendantRole.bn, defendantRole.en)}`
                      : c.defendant.role
                        ? ` · ${c.defendant.role}`
                        : ""}
                  </span>
                </div>

                {c.openedNote && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1a1a1a]">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                      {t("আপনার লেখা", "What you wrote")}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-[#a0a0a0]">{c.openedNote}</p>
                  </div>
                )}

                {c.resolutionNotes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1a1a1a]">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                      {t("প্ল্যাটফর্মের মন্তব্য", "Platform notes")}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-[#a0a0a0]">
                      {c.resolutionNotes}
                    </p>
                  </div>
                )}

                {frozen && (
                  <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Icon name="Scale" size={12} />
                    {t(
                      "মামলা নিষ্পত্তি না হওয়া পর্যন্ত এসক্রোতে টাকা স্থির থাকে।",
                      "Held escrow stays frozen until the case is resolved."
                    )}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
