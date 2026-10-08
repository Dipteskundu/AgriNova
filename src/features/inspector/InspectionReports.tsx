"use client";

import React, { useEffect, useState } from "react";
import { trPhrase } from "@/lib/localize";
import { Icon, FileCheck } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import type { InspectionReport } from "@/types";
import { getCompletedReports } from "@/lib/inspectorApi";

const VERDICT_META: Record<
  InspectionReport["verdict"],
  { label: [string, string]; variant: BadgeVariant }
> = {
  Passed: { label: ["উত্তীর্ণ", "Passed"], variant: "success" },
  "Conditional Pass": { label: ["শর্তসাপেক্ষে", "Conditional"], variant: "warning" },
  Rejected: { label: ["প্রত্যাখ্যাত", "Rejected"], variant: "danger" },
};

/**
 * Completed inspection reports — `/dashboard/reports` for an inspector.
 *
 * The admin portal shares this URL with its own `ReportsManagement` view, so
 * `/dashboard/reports` gates on role: admin sees the platform-wide report,
 * inspector sees the certificates they actually signed.
 */
export function InspectionReports() {
  const { language } = useLanguage();
  const [rows, setRows] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState("");

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const gradeLabel = (g: string) =>
    g === "Grade A"
      ? t("গ্রেড A", "Grade A")
      : g === "Grade B"
        ? t("গ্রেড B", "Grade B")
        : g === "Grade C"
          ? t("গ্রেড C", "Grade C")
          : t("প্রত্যাখ্যাত", "Rejected");

  const conditionLabel = (c: string) =>
    c === "Excellent"
      ? t("চমৎকার", "Excellent")
      : c === "Good"
        ? t("ভালো", "Good")
        : c === "Fair"
          ? t("মোটামুটি", "Fair")
          : c === "Poor"
            ? t("খারাপ", "Poor")
            : c;

  useEffect(() => {
    getCompletedReports()
      .then((res) => {
        if (res.success) setRows(res.data);
        else setError(res.message || t("রিপোর্ট আনা যায়নি।", "Could not load reports."));
      })
      .finally(() => setLoading(false));
  }, []);

  const visible = (() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.harvestBatchCode.toLowerCase().includes(needle) ||
        r.certificateNumber.toLowerCase().includes(needle) ||
        r.farmerName.toLowerCase().includes(needle) ||
        r.cropName.toLowerCase().includes(needle)
    );
  })();

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#111]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title={t("রিপোর্ট আনা যায়নি", "Could not load reports")}
          description={error}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          }
        />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-6">
        <EmptyState
          icon={FileCheck}
          title={t("এখনো কোনো রিপোর্ট নেই", "No reports yet")}
          description={t(
            "একটি পরীক্ষা সম্পন্ন করলে তার সার্টিফিকেট এখানে জমা হবে।",
            "Closing an inspection files its certificate here."
          )}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("সম্পন্ন রিপোর্ট", "Completed Reports")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">
            {visible.length} {t("টি সার্টিফিকেট", "certificates")}
          </p>
        </div>
        <div className="relative">
          <Icon
            name="Search"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("সার্টিফিকেট বা ব্যাচ খুঁজুন", "Search certificate or batch")}
            className="w-full sm:w-72 pl-9 pr-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#111] focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((report) => {
          const meta = VERDICT_META[report.verdict];
          const open = openId === report.id;
          return (
            <div
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#111]"
            >
              <button
                onClick={() => setOpenId(open ? "" : report.id)}
                className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-[#a0a0a0]">
                      {report.certificateNumber || "—"}
                    </span>
                    <Badge variant={meta.variant}>
                      {t(meta.label[0], meta.label[1])}
                    </Badge>
                    <Badge variant="neutral">{gradeLabel(report.grade)}</Badge>
                  </div>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-[#f0f0f0]">
                    {trPhrase(report.cropName)} · {report.farmerName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {report.harvestBatchCode} · {report.inspectionDate}
                  </p>
                </div>
                <Icon
                  name={open ? "ChevronLeft" : "ChevronRight"}
                  size={16}
                  className="shrink-0 text-slate-400"
                />
              </button>

              {open && (
                <div className="border-t border-slate-100 p-4 dark:border-[#1a1a1a]">
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat
                      label={t("আর্দ্রতা", "Moisture")}
                      value={`${report.moistureContentPercent}%`}
                    />
                    <Stat
                      label={t("বিদেশী পদার্থ", "Foreign matter")}
                      value={`${report.foreignMatterPercent}%`}
                    />
                    <Stat
                      label={t("অ্যাফ্লাটক্সিন", "Aflatoxin")}
                      value={`${report.aflatoxinPpm} ppm`}
                    />
                    <Stat
                      label={t("চেহারা", "Visual")}
                      value={conditionLabel(report.visualCondition)}
                    />
                  </dl>

                  {report.recommendedAction && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-[#a0a0a0]">
                      <span className="font-semibold">
                        {t("সুপারিশ:", "Recommended:")}
                      </span>{" "}
                      {report.recommendedAction}
                    </p>
                  )}
                  {report.findings && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-[#a0a0a0]">
                      <span className="font-semibold">{t("অনুসন্ধান:", "Findings:")}</span>{" "}
                      {report.findings}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{report.inspectorName}</span>
                    <span>{report.submittedAt}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-[#1a1a1a]">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="text-sm font-bold text-slate-800 dark:text-[#e0e0e0]">
        {value}
      </dd>
    </div>
  );
}
