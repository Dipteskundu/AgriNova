"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Heart, Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProduceCard } from "@/features/marketplace/browse/ProduceCard";
import { getSavedListings, type ProduceListing } from "@/lib/marketplaceApi";

/**
 * `/dashboard/saved` — the reader's shortlist of produce.
 *
 * Reads the same `GET /marketplace/saved` the dashboard counts through, so
 * the hero badge and this grid can never disagree about how many things are
 * kept: both are the same Approved-only projection of the same rows.
 *
 * Un-saving removes the row locally rather than refetching. The list is
 * exactly "everything I saved", so a settled toggle already tells us the whole
 * truth about what should disappear — a second round trip would only add a
 * loading flash in front of an answer we already have.
 */
export function SavedListings() {
  const router = useRouter();
  const { language } = useLanguage();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumping this is the retry: it re-runs the effect without a page reload,
  // which keeps the shelf's state in React rather than throwing it away.
  const [attempt, setAttempt] = useState(0);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  useEffect(() => {
    let cancelled = false;

    // Nested rather than lifted to the component scope: the lint rule that
    // keeps state writes out of effects only sees through a function declared
    // inside the effect body.
    async function load() {
      setLoading(true);
      const res = await getSavedListings();
      if (cancelled) return;
      if (res.success) {
        setListings(res.data);
        setError(null);
      } else {
        setError(
          res.message ||
            t("সংরক্ষিত তালিকা লোড করা যায়নি।", "Could not load your saved listings.")
        );
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // Deliberately not depending on `language`: translating a failure message
    // is not worth re-running the request every time someone switches scripts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const remove = (id: string) =>
    setListings((prev) => prev.filter((l) => l.id !== id));

  const retry = () => {
    setError(null);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("সংরক্ষিত পণ্য", "Saved Produce")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mt-0.5">
            {loading
              ? t("লোড হচ্ছে...", "Loading...")
              : error
                ? t("সংরক্ষিত তালিকা পাওয়া যায়নি", "Your shelf could not be loaded")
                : `${listings.length} ${t("টি সংরক্ষিত আছে", "saved listings")}`}
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors self-start"
        >
          <Icon name="Store" size={14} />
          {t("পণ্য ব্রাউজ করুন", "Browse produce")}
        </Link>
      </div>

      {/* Grid */}
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
                <div className="h-3 bg-slate-200 dark:bg-[#1a1a1a] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          id="saved-error"
          icon={AlertTriangle}
          title={t("সংরক্ষিত তালিকা আনা যায়নি", "Could not load your shelf")}
          description={error}
          action={
            <Button variant="outline" onClick={retry}>
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          }
        />
      ) : listings.length === 0 ? (
        <EmptyState
          id="saved-empty"
          icon={Heart}
          title={t("এখনো কিছু সংরক্ষণ করেননি", "Nothing saved yet")}
          description={t(
            "পণ্য ব্রাউজ করে হৃদয়ের আইকনে চাপ দিন — পছন্দের পণ্য এখানে জমা থাকবে।",
            "Tap the heart on any listing you like and it will collect here for later."
          )}
          action={
            <Button onClick={() => router.push("/products")}>
              {t("পণ্য ব্রাউজ করুন", "Browse produce")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ProduceCard
              key={listing.id}
              listing={listing}
              onSaveChange={(_id, saved) => {
                if (!saved) remove(listing.id);
                else
                  setListings((prev) =>
                    prev.map((l) =>
                      l.id === listing.id ? { ...l, saved } : l
                    )
                  );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
