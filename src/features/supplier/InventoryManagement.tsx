"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon, Plus, Warehouse } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { tr, trPhrase } from "@/lib/localize";
import { bnNum } from "@/lib/format";
import type { SupplierProduct } from "@/types";
import {
  createProduct,
  deleteProduct,
  getSupplierProducts,
  updateProduct,
  type ProductPayload,
} from "@/lib/supplierApi";

const CATEGORIES: SupplierProduct["category"][] = [
  "Seeds",
  "Fertilizers",
  "Pesticides",
  "Tools",
  "Equipment",
  "Irrigation",
  "Packaging",
];

const UNITS: SupplierProduct["unit"][] = ["kg", "liter", "piece", "bag", "set"];

/** Category labels the shared dictionary does not cover. */
const CATEGORY_LABEL: Record<string, [string, string]> = {
  Tools: ["কৃষি সরঞ্জাম", "Tools"],
  Equipment: ["যন্ত্রপাতি", "Equipment"],
  Packaging: ["প্যাকেজিং", "Packaging"],
};

/** Display text for an English enum/option value — `value=` props stay English. */
const optionLabel = (value: string, t: (bn: string, en: string) => string) => {
  const local = CATEGORY_LABEL[value];
  return local ? t(local[0], local[1]) : tr(value);
};

const emptyPayload = (): ProductPayload => ({
  productName: "",
  category: "Fertilizers",
  description: "",
  pricePerUnitBdt: 0,
  unit: "kg",
  stockQuantity: 0,
  minimumOrderQuantity: 1,
  imageUrl: "",
  isAvailable: true,
});

const availabilityBadge = (row: SupplierProduct): BadgeVariant =>
  row.isAvailable ? "success" : "neutral";

/**
 * Supplier inventory — `/dashboard/inventory`.
 *
 * CRUD over `GET/POST/PUT/DELETE /api/products`, which is also what the public
 * `/inputs` page reads: delisting an item here (`isAvailable = false`) is how
 * it leaves that catalogue, and the stock figure on this page is the same
 * number checkout decrements when someone orders it.
 *
 * One record is edited at a time through a modal rather than an inline row
 * form — nine fields do not fit in a table row without horizontal scrolling,
 * and the failure modes of a half-applied edit are worse than one extra click.
 */
export function InventoryManagement() {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [rows, setRows] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<SupplierProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [payload, setPayload] = useState<ProductPayload>(emptyPayload);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const num = (v: string | number) => (language === "bn" ? bnNum(v) : String(v));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getSupplierProducts();
    if (res.success) setRows(res.data);
    else
      setError(
        res.message
          ? trPhrase(res.message)
          : t("ইনপুট আনা যায়নি", "Could not load your inputs.")
      );
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
        r.productName.toLowerCase().includes(needle) ||
        r.category.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle)
    );
  })();

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setPayload(emptyPayload());
    setFormError("");
  };

  const openEdit = (row: SupplierProduct) => {
    setEditing(row);
    setCreating(false);
    setPayload({
      productName: row.productName,
      category: row.category,
      description: row.description,
      pricePerUnitBdt: row.pricePerUnitBdt,
      unit: row.unit,
      stockQuantity: row.stockQuantity,
      minimumOrderQuantity: row.minimumOrderQuantity,
      imageUrl: row.imageUrl,
      isAvailable: row.isAvailable,
    });
    setFormError("");
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = async () => {
    if (!payload.productName.trim()) {
      setFormError(t("পণ্যের নাম দিন।", "Give the product a name."));
      return;
    }
    setSaving(true);
    setFormError("");

    const res = editing
      ? await updateProduct(editing.id, payload)
      : await createProduct(payload);

    if (res.success && res.data) {
      showToast(
        "success",
        editing
          ? t("ইনপুট আপডেট হয়েছে", "Input updated")
          : t("নতুন ইনপুট যোগ হয়েছে", "Input added")
      );
      close();
      load();
    } else {
      setFormError(
        res.message
          ? trPhrase(res.message)
          : t("সংরক্ষণ করা যায়নি", "Could not save.")
      );
    }
    setSaving(false);
  };

  const toggleAvailability = async (row: SupplierProduct) => {
    const res = await updateProduct(row.id, { isAvailable: !row.isAvailable });
    if (res.success && res.data) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? res.data! : r)));
      showToast(
        "success",
        row.isAvailable
          ? t("ক্যাটালগ থেকে সরানো হয়েছে", "Delisted from the catalogue")
          : t("ক্যাটালগে ফিরে এসেছে", "Back on the catalogue")
      );
    } else {
      showToast("error", (res.message ? trPhrase(res.message) : "") || t("পরিবর্তন করা যায়নি", "Could not change that."));
    }
  };

  const remove = async (row: SupplierProduct) => {
    if (
      !window.confirm(
        t(
          `"${trPhrase(row.productName)}" মুছে ফেলবেন?`,
          `Delete "${row.productName}" permanently?`
        )
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    const res = await deleteProduct(row.id);
    if (res.success) {
      showToast("success", t("ইনপুট মুছে ফেলা হয়েছে", "Input deleted"));
      load();
    } else {
      showToast("error", (res.message ? trPhrase(res.message) : "") || t("মুছা যায়নি", "Could not delete."));
    }
    setDeletingId("");
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
          title={t("ইনপুট আনা যায়নি", "Could not load your inventory")}
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
            {t("ইনভেন্টরি", "Inventory")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0]">
            {num(rows.length)} {t("টি ইনপুট", "items")} ·{" "}
            <Link href="/inputs" className="text-blue-600 hover:underline">
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
            {t("নতুন ইনপুট", "New input")}
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title={t("কোনো ইনপুট নেই", "No inputs yet")}
          description={t(
            "সার, বীজ বা সরঞ্জাম যোগ করুন — সেগুলো /inputs পেজে দেখা যাবে।",
            "Add fertiliser, seed or tools and they appear on /inputs."
          )}
          action={<Button onClick={openCreate}>{t("শুরু করুন", "Add one")}</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#222]">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 dark:bg-[#111]">
              <tr>
                <th className="px-4 py-3 font-medium">{t("পণ্য", "Product")}</th>
                <th className="px-4 py-3 font-medium">{t("ক্যাটাগরি", "Category")}</th>
                <th className="px-4 py-3 font-medium">{t("দাম", "Price")}</th>
                <th className="px-4 py-3 font-medium">{t("মজুত", "Stock")}</th>
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
                          {trPhrase(row.productName)}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {trPhrase(row.description)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-[#a0a0a0]">
                    {optionLabel(row.category, t)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ৳{num(row.pricePerUnitBdt.toLocaleString())}
                    <span className="text-xs font-normal text-slate-400">
                      /{tr(row.unit)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {num(row.stockQuantity.toLocaleString())} {tr(row.unit)}
                    <p className="text-[11px] text-slate-400">
                      {t("সর্বনিম্ন", "MOQ")} {num(row.minimumOrderQuantity)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={availabilityBadge(row)}>
                      {row.isAvailable
                        ? t("ক্যাটালগে আছে", "Listed")
                        : t("লুকানো", "Delisted")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => toggleAvailability(row)}
                        className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
                          row.isAvailable
                            ? "border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-[#333] dark:text-[#a0a0a0]"
                            : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                        }`}
                      >
                        {row.isAvailable
                          ? t("সরান", "Delist")
                          : t("দেখান", "List")}
                      </button>
                      <button
                        onClick={() => openEdit(row)}
                        title={t("সম্পাদনা", "Edit")}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#222]"
                      >
                        <Icon name="Edit" size={15} />
                      </button>
                      <button
                        onClick={() => remove(row)}
                        disabled={deletingId === row.id}
                        title={t("মুছুন", "Delete")}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
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
        <FormModal
          title={
            editing
              ? t("ইনপুট সম্পাদনা", "Edit input")
              : t("নতুন ইনপুট", "New input")
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

function FormModal({
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
  payload: ProductPayload;
  setPayload: (next: ProductPayload) => void;
  error: string;
  saving: boolean;
  t: (bn: string, en: string) => string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const set = (patch: Partial<ProductPayload>) =>
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
            aria-label={t("বন্ধ করুন", "Close")}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className={`col-span-2 ${label}`}>
            {t("পণ্যের নাম", "Product name")}
            <input
              value={payload.productName}
              onChange={(e) => set({ productName: e.target.value })}
              maxLength={120}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("ক্যাটাগরি", "Category")}
            <select
              value={payload.category}
              onChange={(e) =>
                set({ category: e.target.value as ProductPayload["category"] })
              }
              className={`mt-1 ${field}`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {optionLabel(c, t)}
                </option>
              ))}
            </select>
          </label>

          <label className={label}>
            {t("একক", "Unit")}
            <select
              value={payload.unit}
              onChange={(e) => set({ unit: e.target.value as ProductPayload["unit"] })}
              className={`mt-1 ${field}`}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {optionLabel(u, t)}
                </option>
              ))}
            </select>
          </label>

          <label className={label}>
            {t("দাম (৳)", "Price (BDT)")}
            <input
              type="number"
              min={0}
              value={payload.pricePerUnitBdt}
              onChange={(e) => set({ pricePerUnitBdt: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("মজুত", "Stock")}
            <input
              type="number"
              min={0}
              value={payload.stockQuantity}
              onChange={(e) => set({ stockQuantity: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className={label}>
            {t("সর্বনিম্ন অর্ডার", "Min order")}
            <input
              type="number"
              min={1}
              value={payload.minimumOrderQuantity}
              onChange={(e) => set({ minimumOrderQuantity: Number(e.target.value) })}
              className={`mt-1 ${field}`}
            />
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

          <label className={`col-span-2 ${label}`}>
            {t("বর্ণনা", "Description")}
            <textarea
              value={payload.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              maxLength={1000}
              className={`mt-1 resize-y ${field}`}
            />
          </label>

          <label className="col-span-2 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={payload.isAvailable}
              onChange={(e) => set({ isAvailable: e.target.checked })}
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm text-slate-600 dark:text-[#a0a0a0]">
              {t("ক্যাটালগে দেখান", "Show on the public catalogue")}
            </span>
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
