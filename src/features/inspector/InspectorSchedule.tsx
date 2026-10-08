"use client";

import React, { useEffect, useState } from "react";
import { trPhrase } from "@/lib/localize";
import { Icon, Calendar } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import type { InspectorScheduleEntry } from "@/types";
import { getInspectorSchedule } from "@/lib/inspectorApi";

const STATUS_META: Record<
  InspectorScheduleEntry["status"],
  { label: [string, string]; variant: BadgeVariant }
> = {
  upcoming: { label: ["আসন্ন", "Upcoming"], variant: "info" },
  in_progress: { label: ["চলমান", "In progress"], variant: "warning" },
  done: { label: ["সম্পন্ন", "Done"], variant: "success" },
  cancelled: { label: ["বাতিল", "Cancelled"], variant: "danger" },
};

/**
 * `GET /api/quality/schedule` already returns rows ordered by `scheduledDate`,
 * so grouping is a matter of splitting on a date change rather than sorting
 * client-side — the server's order is the order the page shows.
 */
function groupByDate(rows: InspectorScheduleEntry[]) {
  const groups: Array<{ date: string; rows: InspectorScheduleEntry[] }> = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.date === row.date) last.rows.push(row);
    else groups.push({ date: row.date, rows: [row] });
  });
  return groups;
}

const MONTHS: Array<[string, string]> = [
  ["জানু", "Jan"], ["ফেব্রু", "Feb"], ["মার্চ", "Mar"], ["এপ্রিল", "Apr"],
  ["মে", "May"], ["জুন", "Jun"], ["জুলাই", "Jul"], ["আগস্ট", "Aug"],
  ["সেপ্ট", "Sep"], ["অক্টো", "Oct"], ["নভে", "Nov"], ["ডিসে", "Dec"],
];

function dayParts(iso: string) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return { day: String(d).padStart(2, "0"), month: MONTHS[m - 1], year: y };
}

/** The inspector's calendar — `/dashboard/schedule`. */
export function InspectorSchedule() {
  const { language } = useLanguage();
  const [rows, setRows] = useState<InspectorScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  useEffect(() => {
    getInspectorSchedule()
      .then((res) => {
        if (res.success) setRows(res.data);
        else setError(res.message || t("সময়সূচি আনা যায়নি।", "Could not load your schedule."));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#111]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title={t("সময়সূচি আনা যায়নি", "Could not load your schedule")}
          description={error}
        />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Calendar}
          title={t("কোনো সাক্ষাৎ নির্ধারিত নেই", "Nothing scheduled")}
          description={t(
            "তারিখ দেওয়া পরীক্ষাগুলো এখানে দেখা যাবে।",
            "Inspections with a date set will appear here."
          )}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
          {t("আমার সময়সূচি", "My Schedule")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">
          {rows.length} {t("টি সাক্ষাৎ", "visits")}
        </p>
      </div>

      <div className="space-y-6">
        {groupByDate(rows).map((group) => {
          const parts = dayParts(group.date);
          return (
            <section key={group.date}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className="text-sm font-bold text-slate-700 dark:text-[#e0e0e0]">
                  {parts ? `${parts.day} ${t(parts.month[0], parts.month[1])} ${parts.year}` : group.date}
                </h2>
                <span className="text-xs text-slate-400">
                  {parts
                    ? `${parts.day} ${t(parts.month[0], parts.month[1])} ${parts.year}`
                    : ""}
                </span>
              </div>

              <div className="space-y-2">
                {group.rows.map((row) => {
                  const meta = STATUS_META[row.status];
                  return (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-[#222] dark:bg-[#111]"
                    >
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1a1a1a]">
                        <span className="text-[9px] font-bold uppercase text-slate-400">
                          {parts ? t(parts.month[0], parts.month[1]) : ""}
                        </span>
                        <span className="text-sm font-black leading-none">
                          {parts?.day}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400">
                          <Icon name="Clock" size={11} className="mr-1 inline" />
                          {row.time || "—"}
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-[#f0f0f0]">
                          {trPhrase(row.cropName)}
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            {row.farmerName}
                          </span>
                        </p>
                        {row.location && (
                          <p className="text-xs text-slate-400">{trPhrase(row.location)}</p>
                        )}
                      </div>

                      <Badge variant={meta.variant}>
                        {t(meta.label[0], meta.label[1])}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("রিফ্রেশ", "Refresh")}
        </Button>
      </div>
    </div>
  );
}
