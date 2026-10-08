"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Icon, FileCheck, FlaskConical, PlayCircle } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { tr, trPhrase } from "@/lib/localize";
import { bnNum, fmtDateBn } from "@/lib/format";
import type { InspectionRequest } from "@/types";
import {
  getAssignedInspections,
  startInspection,
  submitInspectionReport,
  type InspectionSubmitPayload,
} from "@/lib/inspectorApi";

type StatusFilter = "" | "assigned" | "in_progress" | "completed";

const STATUS_META: Record<
  InspectionRequest["status"],
  { label: [string, string]; variant: BadgeVariant }
> = {
  assigned: { label: ["নির্ধারিত", "Assigned"], variant: "info" },
  in_progress: { label: ["চলমান", "In progress"], variant: "warning" },
  completed: { label: ["সম্পন্ন", "Completed"], variant: "success" },
  cancelled: { label: ["বাতিল", "Cancelled"], variant: "danger" },
};

const TABS: Array<{ value: StatusFilter; label: [string, string] }> = [
  { value: "", label: ["সব", "All"] },
  { value: "assigned", label: ["শুরু হয়নি", "Awaiting start"] },
  { value: "in_progress", label: ["চলমান", "In progress"] },
  { value: "completed", label: ["সম্পন্ন", "Completed"] },
];

/**
 * "Results" form shown when closing an inspection. The verdict is *derived*
 * from the grade unless the inspector overrides it — grading something
 * `Rejected` while defaulting the verdict to `Passed` is the one combination
 * that should never reach the database untouched.
 */
const emptyPayload = (): InspectionSubmitPayload => ({
  grade: "Grade A",
  moistureContentPercent: 0,
  foreignMatterPercent: 0,
  aflatoxinPpm: 0,
  visualCondition: "Good",
  recommendedAction: "",
  verdict: "Passed",
  certificateNumber: "",
  findings: "",
});

/**
 * The inspector's work list — `/dashboard/inspections`.
 *
 * Backed by `GET /api/quality`, which scopes to the caller: an inspector sees
 * their own queue, an admin sees everything. Two verbs do the work here —
 * `start` and `submit` — because the server models them as state transitions
 * rather than field edits; `update` is deliberately absent so an inspector
 * cannot quietly reopen a record they already closed.
 */
export function AssignedInspections() {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [items, setItems] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [submitting, setSubmitting] = useState<InspectionRequest | null>(null);
  const [payload, setPayload] = useState<InspectionSubmitPayload>(emptyPayload);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const num = (v: string | number) => (language === "bn" ? bnNum(v) : String(v));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getAssignedInspections();
    if (res.success) setItems(res.data);
    else setError(res.message ? trPhrase(res.message) : t("তালিকা আনা যায়নি।", "Could not load inspections."));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = (() => {
    const needle = search.trim().toLowerCase();
    return items.filter((i) => {
      if (tab && i.status !== tab) return false;
      if (!needle) return true;
      return (
        i.harvestBatchCode.toLowerCase().includes(needle) ||
        i.farmerName.toLowerCase().includes(needle) ||
        i.cropName.toLowerCase().includes(needle)
      );
    });
  })();

  const handleStart = async (inspection: InspectionRequest) => {
    setBusyId(inspection.id);
    const res = await startInspection(inspection.id);
    if (res.success && res.data) {
      setItems((prev) =>
        prev.map((i) => (i.id === inspection.id ? res.data! : i))
      );
      showToast(
        "success",
        language === "bn"
          ? `${inspection.harvestBatchCode} পরিদর্শন শুরু হয়েছে`
          : `${inspection.harvestBatchCode} started`
      );
    } else {
      showToast(
        "error",
        (res.message ? trPhrase(res.message) : "") ||
        t("পরীক্ষা শুরু করা যায়নি।", "Could not start the inspection.")
      );
    }
    setBusyId("");
  };

  const openSubmit = (inspection: InspectionRequest) => {
    setSubmitting(inspection);
    setPayload(emptyPayload());
    setFormError("");
  };

  const handleSubmit = async () => {
    if (!submitting) return;
    if (payload.moistureContentPercent < 0 || payload.moistureContentPercent > 100) {
      setFormError(t("আর্দ্রতা ০-১০০ এর মধ্যে হতে হবে।", "Moisture must be between 0 and 100."));
      return;
    }
    if (payload.verdict === "Rejected" && payload.grade !== "Rejected") {
      setFormError(
        t(
          "রিজেক্ট করলে গ্রেডও 'Rejected' হতে হবে।",
          "A Rejected verdict needs a Rejected grade."
        )
      );
      return;
    }

    setSaving(true);
    setFormError("");
    const res = await submitInspectionReport(submitting.id, payload);
    if (res.success && res.data) {
      const report = res.data;
      showToast(
        "success",
        language === "bn"
          ? `${report.harvestBatchCode} পরিদর্শন সম্পন্ন · ${report.certificateNumber || "রিপোর্ট সংরক্ষিত"}`
          : `${report.harvestBatchCode} closed · ${report.certificateNumber || "report saved"}`
      );
      setSubmitting(null);
      load();
    } else {
      setFormError(res.message ? trPhrase(res.message) : t("রিপোর্ট জমা দেওয়া যায়নি।", "Could not submit the report."));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
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
          title={t("তালিকা আনা যায়নি", "Could not load inspections")}
          description={error}
          action={
            <Button variant="outline" onClick={load}>
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("নির্ধারিত পরীক্ষা", "Assigned Inspections")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">
            {num(visible.length)} {t("টি রেকর্ড", "records")}
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
            placeholder={t("ব্যাচ বা কৃষক খুঁজুন", "Search batch or farmer")}
            className="w-full sm:w-72 pl-9 pr-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#111] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === item.value
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:text-[#a0a0a0] dark:hover:bg-[#222]"
            }`}
          >
            {t(item.label[0], item.label[1])}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={t("কোনো পরীক্ষা নেই", "No inspections here")}
          description={t(
            "অন্য ট্যাব দেখুন বা অনুসন্ধান পরিবর্তন করুন।",
            "Try another tab or adjust your search."
          )}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const meta = STATUS_META[item.status];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#111]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-[#a0a0a0]">
                        {item.harvestBatchCode}
                      </span>
                      <Badge variant={meta.variant}>
                        {t(meta.label[0], meta.label[1])}
                      </Badge>
                      {item.priority === "urgent" && (
                        <Badge variant="danger">{t("জরুরি", "Urgent")}</Badge>
                      )}
                    </div>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-[#f0f0f0]">
                      {trPhrase(item.cropName)}
                      {item.variety ? ` · ${trPhrase(item.variety)}` : ""}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">
                      {item.farmerName}
                      {item.farmLocation ? ` — ${trPhrase(item.farmLocation)}` : ""}
                    </p>
                    {item.notes && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {trPhrase(item.notes)}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700 dark:text-[#e0e0e0]">
                      {num(item.quantityKg.toLocaleString())} {tr("kg")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.scheduledDate
                        ? fmtDateBn(item.scheduledDate)
                        : t("তারিখ নেই", "No date set")}
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      {item.status === "assigned" && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={PlayCircle}
                          disabled={busyId === item.id}
                          onClick={() => handleStart(item)}
                        >
                          {t("শুরু করুন", "Start")}
                        </Button>
                      )}
                      {item.status === "in_progress" && (
                        <Button
                          size="sm"
                          icon={FileCheck}
                          onClick={() => openSubmit(item)}
                        >
                          {t("ফলাফল দিন", "Record results")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {submitting && (
        <SubmitModal
          inspection={submitting}
          payload={payload}
          setPayload={setPayload}
          error={formError}
          saving={saving}
          t={t}
          onClose={() => setSubmitting(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

interface SubmitModalProps {
  inspection: InspectionRequest;
  payload: InspectionSubmitPayload;
  setPayload: (next: InspectionSubmitPayload) => void;
  error: string;
  saving: boolean;
  t: (bn: string, en: string) => string;
  onClose: () => void;
  onSubmit: () => void;
}

function SubmitModal({
  inspection,
  payload,
  setPayload,
  error,
  saving,
  t,
  onClose,
  onSubmit,
}: SubmitModalProps) {
  const set = (patch: Partial<InspectionSubmitPayload>) =>
    setPayload({ ...payload, ...patch });

  const field =
    "w-full text-sm px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] focus:outline-none focus:border-emerald-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 dark:bg-[#111]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">
              {t("ইনস্পেকশন রিপোর্ট", "Inspection report")}
            </h2>
            <p className="text-xs text-slate-400">
              {inspection.harvestBatchCode} · {trPhrase(inspection.cropName)} ·{" "}
              {inspection.farmerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]"
            aria-label={t("বন্ধ করুন", "Close")}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="col-span-2 text-xs font-medium text-slate-500">
            {t("গ্রেড", "Grade")}
            <select
              value={payload.grade}
              onChange={(e) => {
                const grade = e.target.value as InspectionSubmitPayload["grade"];
                set({
                  grade,
                  // Rejected is not "Passed" — carry the grade through to the
                  // verdict so the inspector has to consciously override it.
                  ...(grade === "Rejected" ? { verdict: "Rejected" as const } : {}),
                });
              }}
              className={`mt-1 ${field}`}
            >
              <option value="Grade A">{tr("Grade A")}</option>
              <option value="Grade B">{tr("Grade B")}</option>
              <option value="Grade C">{tr("Grade C")}</option>
              <option value="Rejected">{tr("Rejected")}</option>
            </select>
          </label>

          <label className="text-xs font-medium text-slate-500">
            {t("আর্দ্রতা (%)", "Moisture (%)")}
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={payload.moistureContentPercent}
              onChange={(e) => set({ moistureContentPercent: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            {t("বিদেশী পদার্থ (%)", "Foreign matter (%)")}
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={payload.foreignMatterPercent}
              onChange={(e) => set({ foreignMatterPercent: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            {t("অ্যাফ্লাটক্সিন (ppm)", "Aflatoxin (ppm)")}
            <input
              type="number"
              min={0}
              max={1000}
              step="0.1"
              value={payload.aflatoxinPpm}
              onChange={(e) => set({ aflatoxinPpm: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            {t("চেহারা", "Visual condition")}
            <select
              value={payload.visualCondition}
              onChange={(e) =>
                set({ visualCondition: e.target.value as InspectionSubmitPayload["visualCondition"] })
              }
              className={`mt-1 ${field}`}
            >
              <option value="Excellent">{t("চমৎকার", "Excellent")}</option>
              <option value="Good">{t("ভালো", "Good")}</option>
              <option value="Fair">{t("মোটামুটি", "Fair")}</option>
              <option value="Poor">{t("খারাপ", "Poor")}</option>
            </select>
          </label>

          <label className="col-span-2 text-xs font-medium text-slate-500">
            {t("সিদ্ধান্ত", "Verdict")}
            <select
              value={payload.verdict}
              onChange={(e) =>
                set({ verdict: e.target.value as InspectionSubmitPayload["verdict"] })
              }
              className={`mt-1 ${field}`}
            >
              <option value="Passed">{t("উত্তীর্ণ", "Passed")}</option>
              <option value="Conditional Pass">{t("শর্তসাপেক্ষে উত্তীর্ণ", "Conditional Pass")}</option>
              <option value="Rejected">{t("প্রত্যাখ্যাত", "Rejected")}</option>
            </select>
          </label>

          <label className="col-span-2 text-xs font-medium text-slate-500">
            {t("সুপারিশকৃত পদক্ষেপ", "Recommended action")}
            <input
              value={payload.recommendedAction}
              onChange={(e) => set({ recommendedAction: e.target.value })}
              maxLength={300}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="col-span-2 text-xs font-medium text-slate-500">
            {t("অনুসন্ধানের ফলাফল", "Findings")}
            <textarea
              value={payload.findings}
              onChange={(e) => set({ findings: e.target.value })}
              rows={4}
              maxLength={2000}
              className={`mt-1 resize-y ${field}`}
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            {t("সার্টিফিকেট (ঐচ্ছিক)", "Certificate (optional)")}
            <input
              value={payload.certificateNumber}
              onChange={(e) => set({ certificateNumber: e.target.value })}
              placeholder="QC-26-0000"
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            {t("তারিখ", "Date")}
            <input
              type="date"
              value={payload.inspectionDate ?? ""}
              onChange={(e) => set({ inspectionDate: e.target.value || undefined })}
              className={`mt-1 ${field}`}
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("বাতিল", "Cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? t("পাঠানো হচ্ছে...", "Submitting...") : t("জমা দিন", "Submit report")}
          </Button>
        </div>
      </div>
    </div>
  );
}
