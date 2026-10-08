"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon, Plus, Store } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { tr, trPhrase } from "@/lib/localize";
import { bnNum, fmtDateBn } from "@/lib/format";
import {
  createListing,
  deleteListing,
  getMyProduceListings,
  requestListingInspection,
  updateListing,
  uploadListingImage,
  type ListingPayload,
  type ProduceListing,
} from "@/lib/marketplaceApi";

const CATEGORIES: ProduceListing["category"][] = [
  "Cereal",
  "Pulse",
  "Oilseed",
  "Vegetable",
  "Fruit",
  "Cash Crop",
];

/** Same vocabulary the server validates against — keep the two in step. */
const CERTIFICATIONS = ["None", "GAP Certified", "Organic"] as const;
const STORAGE_CONDITIONS = [
  "Silo",
  "Ambient Warehouse",
  "Cold Storage",
  "Farm Shed",
] as const;

const STATUS_BADGE: Record<string, BadgeVariant> = {
  Approved: "success",
  "Pending Review": "warning",
  Rejected: "danger",
  Inactive: "neutral",
};

/** Display text for status/grade/option values — the English keys are unchanged. */
const STATUS_LABEL: Record<string, [string, string]> = {
  Approved: ["অনুমোদিত", "Approved"],
  "Pending Review": ["রিভিউ চলমান", "Pending Review"],
  Rejected: ["প্রত্যাখ্যাত", "Rejected"],
  Inactive: ["নিষ্ক্রিয়", "Inactive"],
};

/** Labels the shared dictionary does not cover (grades/certs/storage go via tr). */
const ENUM_LABEL: Record<string, [string, string]> = {
  "Pending Inspection": ["নিরীক্ষার অপেক্ষায়", "Pending Inspection"],
  "Farm Shed": ["খামার শেড", "Farm Shed"],
  None: ["না", "None"],
  "GAP Certified": ["GAP সার্টিফাইড", "GAP Certified"],
  Organic: ["জৈব", "Organic"],
};

const enumLabel = (value: string, t: (bn: string, en: string) => string) => {
  const local = ENUM_LABEL[value];
  return local ? t(local[0], local[1]) : tr(value);
};

const statusLabel = (status: string, t: (bn: string, en: string) => string) => {
  const local = STATUS_LABEL[status];
  return local ? t(local[0], local[1]) : tr(status);
};

const emptyPayload = (): ListingPayload => ({
  produceName: "",
  variety: "",
  category: "Cereal",
  quantityAvailableKg: 0,
  askingPricePerKg: 0,
  minimumOrderKg: 1,
  description: "",
  imageUrl: "",
  harvestDate: "",
  availableUntil: "",
  location: "",
  district: "",
  tags: [],
  storageCondition: "",
  lotCode: "",
  certification: "None",
  sampleAvailable: false,
  availableFrom: "",
});

/**
 * My Listings — `/dashboard/listings`.
 *
 * The produce half of the supplier's shelf: what appears on the public
 * `/products` page once moderation approves it. The inventory page next door
 * handles inputs; both exist because the two catalogues have genuinely
 * different moderation states (produce needs approval, inputs do not) and
 * different unit economics (per-kg pricing against a stock level).
 *
 * A listing is never edited while `Approved` is being re-declared here —
 * `status` and `isVerified` are absent from `ListingPayload` because the
 * server returns 403 for anyone but an admin who sends them.
 */
export function ListingsManagement() {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [rows, setRows] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<ProduceListing | null>(null);
  const [creating, setCreating] = useState(false);
  const [payload, setPayload] = useState<ListingPayload>(emptyPayload);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  /** Listing id whose inspection request is in flight, for the busy state. */
  const [requestingId, setRequestingId] = useState("");

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const num = (v: string | number) => (language === "bn" ? bnNum(v) : String(v));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getMyProduceListings();
    if (res.success) setRows(res.data);
    else setError(res.message ? trPhrase(res.message) : t("তালিকা আনা যায়নি", "Could not load your listings."));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = (() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.cropName.toLowerCase().includes(needle) ||
        r.variety.toLowerCase().includes(needle) ||
        r.category.toLowerCase().includes(needle)
    );
  })();

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setPayload(emptyPayload());
    setFormError("");
  };

  const openEdit = (row: ProduceListing) => {
    setEditing(row);
    setCreating(false);
    setPayload({
      produceName: row.cropName,
      variety: row.variety,
      category: row.category,
      quantityAvailableKg: row.quantityKg,
      askingPricePerKg: row.pricePerKgBdt,
      minimumOrderKg: row.minimumOrderKg,
      description: row.description,
      // The mapper substitutes a placeholder for a row that never had a photo.
      // Treat that as "no image" so the form asks for a real one instead of
      // submitting a relative URL the server's isURL() rule rejects.
      imageUrl: /listing-placeholder\.svg$/.test(row.imageUrl) ? "" : row.imageUrl,
      harvestDate: row.harvestDate,
      availableUntil: row.availableUntil,
      location: row.location,
      district: row.district,
      tags: row.tags ?? [],
      storageCondition: row.storageCondition ?? "",
      lotCode: row.lotCode ?? "",
      certification: row.certification || "None",
      sampleAvailable: row.sampleAvailable ?? false,
      availableFrom: row.availableFrom ?? "",
    });
    setFormError("");
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = async () => {
    if (!payload.produceName.trim()) {
      setFormError(t("পণ্যের নাম দিন।", "Give the produce a name."));
      return;
    }
    if (payload.quantityAvailableKg <= 0) {
      setFormError(t("পরিমাণ শূন্যের বেশি হতে হবে।", "Quantity must be above zero."));
      return;
    }

    if (payload.askingPricePerKg <= 0) {
      setFormError(t("দাম শূন্যের বেশি হতে হবে।", "Asking price must be above zero."));
      return;
    }
    if (!payload.district.trim()) {
      setFormError(t("জেলা উল্লেখ করুন।", "Give the district."));
      return;
    }
    if (!payload.imageUrl.trim()) {
      setFormError(t("পণ্যের ছবি যোগ করুন।", "Add a photo of the produce."));
      return;
    }

    setSaving(true);
    setFormError("");
    const res = editing
      ? await updateListing(editing.id, payload)
      : await createListing(payload);

    if (res.success && res.data) {
      showToast(
        "success",
        editing
          ? t("তালিকা আপডেট হয়েছে", "Listing updated")
          : t("তালিকা জমা হয়েছে — অনুমোদনের অপেক্ষায়", "Listing submitted for review")
      );
      close();
      load();
    } else {
      setFormError(res.message ? trPhrase(res.message) : t("সংরক্ষণ করা যায়নি", "Could not save."));
    }
    setSaving(false);
  };

  const remove = async (row: ProduceListing) => {
    if (
      !window.confirm(
        t(`"${trPhrase(row.cropName)}" মুছে ফেলবেন?`, `Delete "${row.cropName}" permanently?`)
      )
    ) {
      return;
    }
    const res = await deleteListing(row.id);
    if (res.success) {
      showToast("success", t("তালিকা মুছে ফেলা হয়েছে", "Listing deleted"));
      load();
    } else {
      showToast("error", (res.message ? trPhrase(res.message) : "") || t("মুছা যায়নি", "Could not delete."));
    }
  };

  /**
   * Phase 2 — hand the lot to an inspector.
   *
   * The grade is not the seller's to choose, so the only move available is to
   * open a request. It lands unassigned for any inspector to claim, and the
   * row stays at "Pending Inspection" until one of them submits a report —
   * which is also what eventually lets an admin approve the listing.
   */
  const requestInspection = async (row: ProduceListing) => {
    setRequestingId(row.id);
    const res = await requestListingInspection(row.id);
    setRequestingId("");
    if (res.success) {
      // `load()` refreshes the table, but the open edit modal holds its own
      // copy of the row — patch that too so the button it just used becomes
      // the "waiting for an inspector" note without a close/reopen.
      setEditing((prev) =>
        prev && prev.id === row.id
          ? { ...prev, inspectionRequestedAt: new Date().toISOString().slice(0, 10) }
          : prev
      );
      showToast(
        "success",
        t(
          "নিরীক্ষার অনুরোধ পাঠানো হয়েছে — নিরীক্ষকের অপেক্ষায়",
          "Inspection requested — waiting for an inspector"
        )
      );
      load();
    } else {
      showToast(
        "error",
        (res.message ? trPhrase(res.message) : "") ||
        t("নিরীক্ষার অনুরোধ করা যায়নি", "Could not request the inspection.")
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
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
          title={t("তালিকা আনা যায়নি", "Could not load your listings")}
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
            {t("আমার তালিকা", "My Listings")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">
            {num(rows.length)} {t("টি তালিকা", "listings")} ·{" "}
            <Link href="/products" className="text-blue-600 hover:underline">
              {t("ক্যাটালগ দেখুন →", "View public catalogue →")}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("খুঁজুন", "Search")}
              className="w-full sm:w-56 pl-9 pr-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#111] focus:outline-none"
            />
          </div>
          <Button icon={Plus} onClick={openCreate}>
            {t("নতুন তালিকা", "New listing")}
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t("কোনো তালিকা নেই", "No listings yet")}
          description={t(
            "আপনার ফসলের তালিকা তৈরি করুন — অনুমোদনের পর /products পেজে দেখা যাবে।",
            "Create a produce listing; once approved it shows on /products."
          )}
          action={<Button onClick={openCreate}>{t("শুরু করুন", "Add one")}</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#222]">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 dark:bg-[#111]">
              <tr>
                <th className="px-4 py-3 font-medium">{t("পণ্য", "Produce")}</th>
                <th className="px-4 py-3 font-medium">{t("পরিমাণ", "Quantity")}</th>
                <th className="px-4 py-3 font-medium">{t("দাম", "Price")}</th>
                <th className="px-4 py-3 font-medium">{t("গ্রেড", "Grade")}</th>
                <th className="px-4 py-3 font-medium">{t("অবস্থা", "Status")}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a1a1a]">
              {visible.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white transition-colors hover:bg-slate-50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-[#f0f0f0]">
                          {trPhrase(row.cropName)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {trPhrase(row.variety)} · {tr(row.category)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-[#a0a0a0]">
                    {num(row.quantityKg.toLocaleString())} {tr("kg")}
                    <p className="text-[11px] text-slate-400">
                      {t("সর্বনিম্ন", "MOQ")} {num(row.minimumOrderKg)} {tr("kg")}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ৳{num(row.pricePerKgBdt.toLocaleString())}
                    <span className="text-xs font-normal text-slate-400">
                      /{tr("kg")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        row.qualityGrade === "Grade A"
                          ? "success"
                          : row.qualityGrade === "Pending Inspection"
                            ? "info"
                            : row.qualityGrade === "Rejected"
                              ? "danger"
                              : "neutral"
                      }
                    >
                      {enumLabel(row.qualityGrade, t)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[row.status ?? ""] ?? "neutral"}>
                      {statusLabel(row.status || "Pending Review", t)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {row.inspectionRequestedAt ? (
                        <span
                          title={t(
                            "নিরীক্ষকের অপেক্ষায় — গ্রেড নির্ধারিত হলে স্বয়ংক্রিয়ভাবে আপডেট হবে",
                            "Waiting for an inspector — the grade updates itself once a report lands"
                          )}
                          className="whitespace-nowrap rounded-lg bg-sky-50 px-2 py-1.5 text-[11px] font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                        >
                          {t("নিরীক্ষার অপেক্ষায়", "Inspection queued")}
                        </span>
                      ) : (
                        <button
                          onClick={() => requestInspection(row)}
                          disabled={requestingId === row.id}
                          title={t("নিরীক্ষকের কাছে গ্রেড চান", "Ask an inspector to grade this lot")}
                          className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                        >
                          <Icon name="Microscope" size={14} />
                          {requestingId === row.id
                            ? t("পাঠানো হচ্ছে...", "Requesting…")
                            : row.qualityGrade === "Pending Inspection"
                              ? t("নিরীক্ষা চান", "Request inspection")
                              : t("পুনর্নিরীক্ষা", "Re-inspect")}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(row)}
                        title={t("সম্পাদনা", "Edit")}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#222]"
                      >
                        <Icon name="Edit" size={15} />
                      </button>
                      <button
                        onClick={() => remove(row)}
                        title={t("মুছুন", "Delete")}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <ListingFormModal
          title={
            editing ? t("তালিকা সম্পাদনা", "Edit listing") : t("নতুন তালিকা", "New listing")
          }
          payload={payload}
          setPayload={setPayload}
          error={formError}
          saving={saving}
          t={t}
          grade={editing?.qualityGrade ?? ""}
          inspectionRequestedAt={editing?.inspectionRequestedAt ?? ""}
          requesting={!!editing && requestingId === editing.id}
          onRequest={editing ? () => requestInspection(editing) : undefined}
          onClose={close}
          onSubmit={save}
        />
      )}
    </div>
  );
}

function ListingFormModal({
  title,
  payload,
  setPayload,
  error,
  saving,
  grade,
  inspectionRequestedAt,
  requesting,
  onRequest,
  t,
  onClose,
  onSubmit,
}: {
  title: string;
  payload: ListingPayload;
  setPayload: (next: ListingPayload) => void;
  error: string;
  saving: boolean;
  /** Read-only: set by an inspector, never by this form. */
  grade: string;
  /** Non-empty while an inspection request for this listing is open. */
  inspectionRequestedAt: string;
  /** An inspection request is in flight. */
  requesting: boolean;
  /** Opens the request. Absent when creating — there is no listing yet. */
  onRequest?: () => void;
  t: (bn: string, en: string) => string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = (patch: Partial<ListingPayload>) =>
    setPayload({ ...payload, ...patch });

  /**
   * Upload immediately on pick rather than on save — the URL has to exist
   * before the listing does, and failing here means the farmer retries a
   * 5 MB transfer instead of a whole form submit.
   */
  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    const res = await uploadListingImage(file);
    if (res.success && res.data) set({ imageUrl: res.data });
    else setUploadError(res.message ? trPhrase(res.message) : t("আপলোড ব্যর্থ হয়েছে", "Upload failed."));
    setUploading(false);
    // Clear so choosing the same file again re-fires `onChange`.
    input.value = "";
  };

  const field =
    "w-full text-sm px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] focus:outline-none focus:border-emerald-400";
  const label = "text-xs font-medium text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 dark:bg-[#111]">
        <div className="flex items-start justify-between">
          <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]"
            aria-label={t("বন্ধ করুন", "Close")}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className={`col-span-2 ${label}`}>
            {t("পণ্যের নাম", "Produce name")}
            <input
              value={payload.produceName}
              onChange={(e) => set({ produceName: e.target.value })}
              maxLength={120}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("জাত", "Variety")}
            <input
              value={payload.variety}
              onChange={(e) => set({ variety: e.target.value })}
              maxLength={60}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("ক্যাটাগরি", "Category")}
            <select
              value={payload.category}
              onChange={(e) =>
                set({ category: e.target.value as ListingPayload["category"] })
              }
              className={`mt-1 ${field}`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tr(c)}
                </option>
              ))}
            </select>
          </label>

          <label className={label}>
            {t("পরিমাণ (কেজি)", "Quantity (kg)")}
            <input
              type="number"
              min={0}
              value={payload.quantityAvailableKg}
              onChange={(e) => set({ quantityAvailableKg: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("দাম/কেজি (৳)", "Price/kg (BDT)")}
            <input
              type="number"
              min={0}
              value={payload.askingPricePerKg}
              onChange={(e) => set({ askingPricePerKg: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("সর্বনিম্ন অর্ডার (কেজি)", "Min order (kg)")}
            <input
              type="number"
              min={1}
              value={payload.minimumOrderKg}
              onChange={(e) => set({ minimumOrderKg: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("সংরক্ষণের ধরন", "Storage condition")}
            <select
              value={payload.storageCondition}
              onChange={(e) => set({ storageCondition: e.target.value })}
              className={`mt-1 ${field}`}
            >
              <option value="">{t("নির্বাচন করুন", "Select…")}</option>
              {STORAGE_CONDITIONS.map((s) => (
                <option key={s} value={s}>
                  {enumLabel(s, t)}
                </option>
              ))}
            </select>
          </label>

          <label className={label}>
            {t("লট/ব্যাচ নম্বর", "Lot / batch code")}
            <input
              value={payload.lotCode}
              onChange={(e) => set({ lotCode: e.target.value })}
              maxLength={40}
              placeholder={t("যেমন: RICE-24-091", "e.g. RICE-24-091")}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("সার্টিফিকেশন", "Certification")}
            <select
              value={payload.certification}
              onChange={(e) => set({ certification: e.target.value })}
              className={`mt-1 ${field}`}
            >
              {CERTIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {enumLabel(c, t)}
                </option>
              ))}
            </select>
          </label>

          <label className={label}>
            {t("খামারের এলাকা (উপজেলা)", "Upazila / area")}
            <input
              value={payload.location}
              onChange={(e) => set({ location: e.target.value })}
              maxLength={160}
              placeholder={t("যেমন: শেরপুর", "e.g. Sherpur")}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("জেলা *", "District *")}
            <input
              value={payload.district}
              onChange={(e) => set({ district: e.target.value })}
              maxLength={80}
              placeholder={t("যেমন: বগুড়া", "e.g. Bogura")}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("তোলার তারিখ", "Harvest date")}
            <input
              type="date"
              value={payload.harvestDate}
              onChange={(e) => set({ harvestDate: e.target.value })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("কবে থেকে পাওয়া যাবে", "Available from")}
            <input
              type="date"
              value={payload.availableFrom}
              onChange={(e) => set({ availableFrom: e.target.value })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("কতক্ষণ থাকবে", "Available until")}
            <input
              type="date"
              value={payload.availableUntil}
              onChange={(e) => set({ availableUntil: e.target.value })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("নমুনা পাঠানো যাবে", "Sample available")}
            <select
              value={payload.sampleAvailable ? "1" : "0"}
              onChange={(e) => set({ sampleAvailable: e.target.value === "1" })}
              className={`mt-1 ${field}`}
            >
              <option value="0">{t("না", "No")}</option>
              <option value="1">{t("হ্যাঁ", "Yes")}</option>
            </select>
          </label>

          <label className={`col-span-2 ${label}`}>
            {t("পণ্যের ছবি *", "Produce photo *")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={pickImage}
              disabled={uploading}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-60 dark:file:bg-emerald-500/15 dark:file:text-emerald-300 dark:hover:file:bg-emerald-500/25"
            />
            {uploading ? (
              <p className="mt-1 text-[11px] text-slate-500">
                {t("আপলোড হচ্ছে...", "Uploading…")}
              </p>
            ) : uploadError ? (
              <p className="mt-1 text-[11px] text-rose-600">{uploadError}</p>
            ) : payload.imageUrl ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-[#333] p-2">
                <img
                  src={payload.imageUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <p className="min-w-0 flex-1 truncate text-[11px] text-slate-500">
                  {payload.imageUrl}
                </p>
                <button
                  type="button"
                  onClick={() => set({ imageUrl: "" })}
                  className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  {t("সরান", "Remove")}
                </button>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                {t(
                  "JPEG, PNG, GIF বা WebP · সর্বোচ্চ ৫ MB",
                  "JPEG, PNG, GIF or WebP · max 5 MB"
                )}
              </p>
            )}
          </label>

          <div className={`col-span-2 ${label}`}>
            {t("গ্রেড (নিরীক্ষক নির্ধারণ করবেন)", "Grade (set by your inspector)")}
            <div
              className={`mt-1 flex items-center justify-between gap-2 ${field}`}
            >
              <Badge
                variant={
                  grade === "Grade A"
                    ? "success"
                    : grade === "Pending Inspection" || !grade
                      ? "info"
                      : grade === "Rejected"
                        ? "danger"
                        : "neutral"
                }
              >
                {grade ? enumLabel(grade, t) : t("নিরীক্ষার অপেক্ষায়", "Pending inspection")}
              </Badge>
              <span className="text-[11px] font-normal text-slate-400">
                {t("কৃষক নিজে গ্রেড বেছে নেন না", "Sellers cannot pick a grade")}
              </span>
            </div>

            {onRequest &&
              (inspectionRequestedAt ? (
                <p className="mt-1.5 text-[11px] text-sky-700 dark:text-sky-300">
                  {t(
                    `নিরীক্ষার অনুরোধ দেওয়া হয়েছে (${fmtDateBn(inspectionRequestedAt)}) — নিরীক্ষকের অপেক্ষায়`,
                    `Inspection requested (${fmtDateBn(inspectionRequestedAt)}) — waiting for an inspector`
                  )}
                </p>
              ) : (
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    {t(
                      "গ্রেড পেতে নিরীক্ষার অনুরোধ করুন",
                      "Request an inspection to get a grade"
                    )}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={requesting || saving}
                    onClick={onRequest}
                  >
                    {requesting
                      ? t("পাঠানো হচ্ছে...", "Requesting…")
                      : t("নিরীক্ষা চান", "Request inspection")}
                  </Button>
                </div>
              ))}
          </div>

          <label className={`col-span-2 ${label}`}>
            {t("বর্ণনা", "Description")}
            <textarea
              value={payload.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              className={`mt-1 resize-y ${field}`}
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
            {saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ", "Save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
