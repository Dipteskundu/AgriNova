"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon, Plus, Store } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createListing,
  deleteListing,
  getMyProduceListings,
  updateListing,
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

const GRADES = ["Grade A", "Grade B", "Grade C"] as const;

const STATUS_BADGE: Record<string, BadgeVariant> = {
  Approved: "success",
  "Pending Review": "warning",
  Rejected: "danger",
  Inactive: "neutral",
};

const emptyPayload = (): ListingPayload => ({
  produceName: "",
  variety: "",
  category: "Cereal",
  quantityAvailableKg: 0,
  askingPricePerKg: 0,
  minimumOrderKg: 1,
  qualityGrade: "Grade A",
  description: "",
  imageUrl: "",
  harvestDate: "",
  availableUntil: "",
  location: "",
  district: "",
  tags: [],
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

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getMyProduceListings();
    if (res.success) setRows(res.data);
    else setError(res.message || "Could not load your listings.");
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
      qualityGrade: row.qualityGrade,
      description: row.description,
      imageUrl: row.imageUrl,
      harvestDate: row.harvestDate,
      availableUntil: row.availableUntil,
      location: row.location,
      district: row.district,
      tags: row.tags ?? [],
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
      setFormError(res.message || t("সংরক্ষণ করা যায়নি", "Could not save."));
    }
    setSaving(false);
  };

  const remove = async (row: ProduceListing) => {
    if (
      !window.confirm(
        t(`"${row.cropName}" মুছে ফেলবেন?`, `Delete "${row.cropName}" permanently?`)
      )
    ) {
      return;
    }
    const res = await deleteListing(row.id);
    if (res.success) {
      showToast("success", t("তালিকা মুছে ফেলা হয়েছে", "Listing deleted"));
      load();
    } else {
      showToast("error", res.message || t("মুছা যায়নি", "Could not delete."));
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
            {rows.length} {t("টি তালিকা", "listings")} ·{" "}
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
                          {row.cropName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {row.variety} · {row.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-[#a0a0a0]">
                    {row.quantityKg.toLocaleString()} kg
                    <p className="text-[11px] text-slate-400">
                      {t("সর্বনিম্ন", "MOQ")} {row.minimumOrderKg} kg
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ৳{row.pricePerKgBdt.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/kg</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={row.qualityGrade === "Grade A" ? "success" : "neutral"}>
                      {row.qualityGrade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[row.status ?? ""] ?? "neutral"}>
                      {row.status || "Pending Review"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
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
  t,
  onClose,
  onSubmit,
}: {
  title: string;
  payload: ListingPayload;
  setPayload: (next: ListingPayload) => void;
  error: string;
  saving: boolean;
  t: (bn: string, en: string) => string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const set = (patch: Partial<ListingPayload>) =>
    setPayload({ ...payload, ...patch });

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
            aria-label="Close"
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
                <option key={c}>{c}</option>
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
            {t("গ্রেড", "Grade")}
            <select
              value={payload.qualityGrade}
              onChange={(e) =>
                set({ qualityGrade: e.target.value as ListingPayload["qualityGrade"] })
              }
              className={`mt-1 ${field}`}
            >
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>

          <label className={label}>
            {t("ছবির লিংক (ঐচ্ছিক)", "Image URL (optional)")}
            <input
              value={payload.imageUrl}
              onChange={(e) => set({ imageUrl: e.target.value })}
              placeholder="https://..."
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("ধরন/জেলা", "Place / district")}
            <input
              value={payload.location}
              onChange={(e) => set({ location: e.target.value })}
              maxLength={160}
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
            {t("কতক্ষণ থাকবে", "Available until")}
            <input
              type="date"
              value={payload.availableUntil}
              onChange={(e) => set({ availableUntil: e.target.value })}
              className={`mt-1 ${field}`}
            />
          </label>

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
