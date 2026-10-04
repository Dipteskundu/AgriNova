"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getProduceListings,
  type ProduceListing,
  type MarketplaceFilters,
  type QualityGrade,
} from "@/lib/marketplaceApi";

const CATEGORIES = ["", "Cereal", "Vegetable", "Pulse", "Oilseed", "Fruit", "Cash Crop"] as const;
const GRADES: Array<QualityGrade | ""> = ["", "Grade A", "Grade B", "Grade C"];

interface Props {
  /**
   * Where detail pages live. `/products` on the public route, and the same
   * component is reused wherever a produce grid is wanted, so the link
   * target is never hard-coded inside it.
   */
  basePath?: string;
}

export function BrowseProduce({ basePath = "/products" }: Props) {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [grade, setGrade] = useState<QualityGrade | "">("");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "quantity">("newest");
  const [showFilters, setShowFilters] = useState(false);

  const t = (bn: string, en: string) => language === "bn" ? bn : en;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const filters: MarketplaceFilters = {
      search: search || undefined,
      category: category || undefined,
      grade: grade || undefined,
      verifiedOnly: verifiedOnly || undefined,
    };
    const res = await getProduceListings(filters);
    if (res.success) {
      let sorted = [...res.data];
      if (sortBy === "price_asc") sorted.sort((a, b) => a.pricePerKgBdt - b.pricePerKgBdt);
      else if (sortBy === "price_desc") sorted.sort((a, b) => b.pricePerKgBdt - a.pricePerKgBdt);
      else if (sortBy === "quantity") sorted.sort((a, b) => b.quantityKg - a.quantityKg);
      setListings(sorted);
    }
    setLoading(false);
  }, [search, category, grade, verifiedOnly, sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const gradeColor = {
    "Grade A": "success",
    "Grade B": "warning",
    "Grade C": "neutral",
  } as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("পণ্য ব্রাউজ করুন", "Browse Produce")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mt-0.5">
            {loading ? "Loading..." : `${listings.length} ${t("পণ্য পাওয়া গেছে", "listings found")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="quantity">Most Available</option>
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

      {/* Search bar */}
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("পণ্য, কৃষক বা জেলা দিয়ে খুঁজুন...", "Search by crop, farmer, or district...")}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-[#333] rounded-xl text-sm bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#222] rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-[#a0a0a0] mb-1">{t("ক্যাটাগরি", "Category")}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] focus:outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-[#a0a0a0] mb-1">{t("গ্রেড", "Grade")}</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as QualityGrade | "")}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] focus:outline-none"
            >
              {GRADES.map((g) => <option key={g} value={g}>{g || "Any Grade"}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-[#e0e0e0]">{t("শুধু যাচাইকৃত", "Verified only")}</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setCategory(""); setGrade(""); setVerifiedOnly(false); setSearch(""); }}
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

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-[#1a1a1a]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-[#1a1a1a] rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-[#1a1a1a] rounded w-1/2" />
                <div className="h-3 bg-slate-200 dark:bg-[#1a1a1a] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title={t("কোনো পণ্য পাওয়া যায়নি", "No produce found")}
          description={t("ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।", "Try adjusting your filters.")}
          action={<Button variant="outline" onClick={() => { setSearch(""); setCategory(""); setGrade(""); setVerifiedOnly(false); }}>Clear Filters</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`${basePath}/${listing.id}`}
              className="group block bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg transition-all duration-200"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={listing.imageUrl}
                  alt={listing.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  <Badge variant={gradeColor[listing.qualityGrade]} size="sm">{listing.qualityGrade}</Badge>
                  {listing.isVerified && (
                    <span className="flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      <Icon name="ShieldCheck" size={9} /> Verified
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-black text-blue-700 dark:text-blue-400">
                  ৳{listing.pricePerKgBdt}<span className="text-[10px] font-normal">/kg</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">{listing.cropName}</h3>
                <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">{listing.variety}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Icon name="MapPin" size={11} />{listing.location}
                  </span>
                  <span className="text-[11px] text-slate-400">{listing.quantityKg.toLocaleString()} kg</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#1a1a1a]">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {listing.farmerAvatar}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] truncate">{listing.farmerName}</span>
                  <span className="text-[11px] text-slate-400 ml-auto shrink-0">Min {listing.minimumOrderKg} kg</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
