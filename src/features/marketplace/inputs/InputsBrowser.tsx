"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPublicInputs, type SupplierProduct } from "@/lib/supplierApi";

/** The UI union `mapSupplierProduct` emits, plus "" for "everything". */
const CATEGORIES = [
  "",
  "Seeds",
  "Fertilizers",
  "Pesticides",
  "Tools",
  "Equipment",
  "Irrigation",
  "Packaging",
] as const;

type SortKey = "newest" | "price_asc" | "price_desc" | "stock";

/**
 * The public Inputs catalogue — `/inputs`.
 *
 * Structurally the sibling of `BrowseProduce`: same card grid, same filter
 * bar, same `EmptyState`, same `basePath`-driven detail link. The two are kept
 * as separate components rather than one component taking a `kind` flag
 * because the filter sets genuinely differ (produce grades by quality; inputs
 * filter by category and stock) and because their card metadata is different
 * — a fertiliser listing has a supplier and a stock level, not a harvest date.
 *
 * Reads `GET /api/products`, which needs no token. Anything that needs a
 * session (ordering) happens on the detail page, behind `LoginGate`.
 */
export function InputsBrowser({ basePath = "/inputs" }: { basePath?: string }) {
  const { language } = useLanguage();

  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const fetchInputs = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getPublicInputs();
    if (res.success) setProducts(res.data);
    else setError(res.message || "Could not load inputs.");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInputs();
  }, [fetchInputs]);

  const visible = (() => {
    const needle = search.trim().toLowerCase();
    let rows = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (inStockOnly && p.stockQuantity <= 0) return false;
      if (!needle) return true;
      return (
        p.productName.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.supplierName.toLowerCase().includes(needle)
      );
    });

    if (sortBy === "price_asc") rows = [...rows].sort((a, b) => a.pricePerUnitBdt - b.pricePerUnitBdt);
    else if (sortBy === "price_desc") rows = [...rows].sort((a, b) => b.pricePerUnitBdt - a.pricePerUnitBdt);
    else if (sortBy === "stock") rows = [...rows].sort((a, b) => b.stockQuantity - a.stockQuantity);

    return rows;
  })();

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setInStockOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("কৃষি ইনপুট", "Agricultural Inputs")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mt-0.5">
            {loading
              ? "Loading..."
              : `${visible.length} ${t("টি আইটেম পাওয়া গেছে", "items found")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="stock">Most In Stock</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Icon name="SlidersHorizontal" size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("সার, বীজ বা সরঞ্জাম দিয়ে খুঁজুন...", "Search by fertiliser, seed, tool, or supplier...")}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-[#333] rounded-xl text-sm bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#222] rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-[#a0a0a0] mb-1">
              {t("ক্যাটাগরি", "Category")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c || "All"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-[#e0e0e0]">
                {t("শুধু স্টকে আছে", "In stock only")}
              </span>
            </label>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              {t("ফিল্টার মুছুন", "Clear filters")}
            </button>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            }`}
          >
            {cat || t("সব", "All")}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-slate-200 dark:bg-[#1a1a1a]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-[#1a1a1a] rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-[#1a1a1a] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title={t("ইনপুট লোড করা যায়নি", "Could not load inputs")}
          description={error}
          action={
            <Button variant="outline" onClick={fetchInputs}>
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title={t("কোনো ইনপুট পাওয়া যায়নি", "No inputs found")}
          description={t("ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।", "Try adjusting your filters.")}
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((product) => (
            <Link
              key={product.id}
              href={`${basePath}/${product.id}`}
              className="group block bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg transition-all duration-200"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  <Badge variant="neutral" size="sm">
                    {product.category}
                  </Badge>
                  {product.stockQuantity <= 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {t("স্টক নেই", "Out of stock")}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-black text-blue-700 dark:text-blue-400">
                  ৳{product.pricePerUnitBdt}
                  <span className="text-[10px] font-normal">/{product.unit}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">
                  {product.productName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#a0a0a0] line-clamp-2 mt-0.5">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400 truncate">
                    {product.supplierName}
                  </span>
                  <span
                    className={`text-[11px] shrink-0 ${
                      product.stockQuantity > 0 ? "text-slate-400" : "text-red-500"
                    }`}
                  >
                    {product.stockQuantity.toLocaleString()} {product.unit}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#1a1a1a] text-[11px] text-slate-400">
                  <Icon name="Info" size={11} />
                  {t("সর্বনিম্ন অর্ডার", "Min order")}: {product.minimumOrderQuantity} {product.unit}
                  <span className="ml-auto font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("বিস্তারিত", "Details")} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
