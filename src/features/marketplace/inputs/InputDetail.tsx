"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { tr } from "@/lib/localize";
import { useAuth } from "@/contexts/AuthContext";
import { getInputById, submitInputRating, getInputRatings, type SupplierProduct } from "@/lib/supplierApi";
import { addInputToCart } from "@/lib/marketplaceApi";
import { StarRating } from "../ratings/StarRating";
import { RatingForm } from "../ratings/RatingForm";
import { ReviewList } from "../ratings/ReviewList";
import { type RatingItem } from "@/types";

interface Props {
  id: string;
  basePath?: string;
}

const CATEGORY_LABEL: Record<string, [string, string]> = {
  Seeds: ["বীজ", "Seeds"],
  Fertilizers: ["সার", "Fertilizers"],
  Pesticides: ["কীটনাশক", "Pesticides"],
  Tools: ["সরঞ্জাম", "Tools"],
  Equipment: ["যন্ত্রপাতি", "Equipment"],
  Irrigation: ["সেচ যন্ত্র", "Irrigation"],
  Packaging: ["প্যাকেজিং", "Packaging"],
};

/**
 * Detail for a farm input — `/inputs/:id`.
 *
 * The route is wrapped in `LoginGate`, so by the time this renders the
 * visitor has a session and the "add to cart" branch below is the normal path
 * rather than the exception.
 *
 * Deliberately a separate component from `ProduceDetail` even though they
 * look alike: that one is bound to `ProduceListing` (asking price per kg,
 * quality grade, verification badge) and this one to `SupplierProduct`
 * (price per unit, stock, minimum order). The shared card primitives in
 * `components/ui` are reused; the data plumbing is not shared because there
 * are two distinct APIs behind it.
 */
export function InputDetail({ id, basePath = "/inputs" }: Props) {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [product, setProduct] = useState<SupplierProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Ratings & feedback — loaded apart from the product so a failed review
  // load never blanks the detail page.
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);
  const categoryLabel = (cat: string) => {
    const pair = CATEGORY_LABEL[cat];
    return pair ? (language === "bn" ? pair[0] : pair[1]) : cat;
  };

  useEffect(() => {
    getInputById(id).then((res) => {
      if (res.success && res.data) {
        setProduct(res.data);
        setQuantity(Math.max(1, res.data.minimumOrderQuantity));
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    setRatingsLoading(true);
    getInputRatings(id).then((res) => {
      setRatings(res.success && Array.isArray(res.data) ? res.data : []);
      setRatingsLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-[#1a1a1a] rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-5 bg-slate-200 dark:bg-[#1a1a1a] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">{t("ইনপুট পাওয়া যায়নি।", "Input not found.")}</p>
        <Link
          href={basePath}
          className="mt-4 inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
        >
          <Icon name="ArrowLeft" size={14} /> {t("ইনপুটে ফিরে যান", "Back to Inputs")}
        </Link>
      </div>
    );
  }

  const minOrder = Math.max(1, product.minimumOrderQuantity);
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity < 10;

  const handleAddToCart = () => {
    if (!user) return; // LoginGate already covers this; belt and braces.
    if (outOfStock) return;
    if (quantity < minOrder) {
      showToast("error", `${t("সর্বনিম্ন অর্ডার", "Minimum order is")} ${minOrder} ${tr(product.unit)}`);
      return;
    }
    setAddingToCart(true);
    addInputToCart(product, quantity);
    showToast(
      "success",
      `${tr(product.productName)} ${t("কার্টে যোগ হয়েছে", "added to cart")} (${quantity} ${tr(product.unit)})`
    );
    setAddingToCart(false);
  };

  /**
   * Submit a rating. The server returns the recomputed summary, so both the
   * header stats and the review list update locally — no second fetch.
   */
  const handleRate = async (rating: number, comment: string): Promise<boolean> => {
    if (!user) return false; // LoginGate already covers this.
    const res = await submitInputRating(id, rating, comment);
    if (!res.success || !res.data) {
      showToast(
        "error",
        res.message || t("রেটিং জমা দিতে ব্যর্থ", "Could not submit your rating")
      );
      return false;
    }

    setProduct((prev) =>
      prev
        ? {
            ...prev,
            averageRating: res.data!.averageRating,
            totalRatings: res.data!.totalRatings,
          }
        : prev
    );
    setRatings((prev) => [
      {
        rating,
        comment,
        userName: user.name || user.email || t("ব্যবহারকারী", "User"),
        userId: user.id,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href={basePath} className="hover:text-blue-600">
          {t("ইনপুট", "Inputs")}
        </Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium">
          {tr(product.productName)}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80">
            <img
              src={product.imageUrl}
              alt={tr(product.productName)}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="neutral">{categoryLabel(product.category)}</Badge>
              {outOfStock && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {t("স্টক নেই", "Out of stock")}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 dark:border-[#222] p-3">
              <p className="text-[11px] text-slate-400">{t("মজুত", "In stock")}</p>
              <p className="mt-1 text-sm font-bold">
                {product.stockQuantity.toLocaleString()} {tr(product.unit)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-[#222] p-3">
              <p className="text-[11px] text-slate-400">{t("সর্বনিম্ন", "Min order")}</p>
              <p className="mt-1 text-sm font-bold">
                {minOrder} {tr(product.unit)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-[#222] p-3">
              <p className="text-[11px] text-slate-400">{t("ক্যাটাগরি", "Category")}</p>
              <p className="mt-1 text-sm font-bold">{categoryLabel(product.category)}</p>
            </div>
          </div>
        </div>

        {/* Facts + action */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0]">
            {tr(product.productName)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mt-1">
            {product.supplierName}
          </p>

          <p className="mt-4 text-3xl font-black text-blue-700 dark:text-blue-400">
            ৳{product.pricePerUnitBdt.toLocaleString()}
            <span className="text-base font-semibold text-slate-400">/{tr(product.unit)}</span>
          </p>

          {/* Rating summary — always rendered; "0 rating(s)" rather than a
              hidden row, so buyers see the feature exists. */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={product.averageRating ?? 0} size={14} />
            <span className="text-xs font-semibold text-slate-700 dark:text-[#e0e0e0]">
              {(product.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({product.totalRatings ?? 0} {t("রেটিং", "rating(s)")})
            </span>
          </div>

          {lowStock && (
            <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              <Icon name="AlertTriangle" size={14} className="shrink-0 mt-0.5" />
              <span>
                {t("শুধুমাত্র", "Only")} {product.stockQuantity} {tr(product.unit)}{" "}
                {t("বাকি আছে।", "left in stock.")}
              </span>
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-[#a0a0a0]">
            {tr(product.description)}
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-[#222] p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-[#a0a0a0] mb-2">
              {t("পরিমাণ", "Quantity")}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setQuantity((q) => Math.max(minOrder, q - Math.max(1, minOrder)))
                }
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-[#333] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
                aria-label={t("পরিমাণ কমান", "Decrease quantity")}
              >
                <Icon name="Minus" size={14} />
              </button>
              <input
                type="number"
                value={quantity}
                min={minOrder}
                max={product.stockQuantity}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) setQuantity(Math.max(0, next));
                }}
                className="w-24 text-center text-sm font-semibold px-2 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#111] focus:outline-none"
              />
              <button
                onClick={() => setQuantity((q) => q + Math.max(1, minOrder))}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-[#333] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
                aria-label={t("পরিমাণ বাড়ান", "Increase quantity")}
              >
                <Icon name="Plus" size={14} />
              </button>
              <span className="text-xs text-slate-400">{tr(product.unit)}</span>
              <span className="ml-auto text-sm font-black text-slate-900 dark:text-[#f0f0f0]">
                ৳{(product.pricePerUnitBdt * Math.max(quantity, 0)).toLocaleString()}
              </span>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              disabled={outOfStock || addingToCart}
              onClick={handleAddToCart}
            >
              {outOfStock
                ? t("স্টক নেই", "Out of stock")
                : t("কার্টে যোগ করুন", "Add to Cart")}
            </Button>
            <Link
              href={basePath}
              className="mt-3 block text-center text-xs text-slate-400 hover:text-blue-600"
            >
              ← {t("অন্য ইনপুট দেখুন", "Keep browsing inputs")}
            </Link>
          </div>
        </div>
      </div>

      {/* Ratings & feedback */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-[#f0f0f0] flex items-center gap-2">
            <Icon name="Star" size={17} className="text-yellow-400" fill="currentColor" />
            {t("রেটিং ও মতামত", "Ratings & Reviews")}
          </h2>
          <div className="flex items-center gap-2">
            <StarRating rating={product.averageRating ?? 0} size={14} />
            <span className="text-xs text-slate-400">
              {product.totalRatings ?? 0} {t("টি রেটিং", "rating(s)")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* One rating per user — the form disappears once theirs is in. */}
          <div>
            {!user ? (
              <div className="rounded-2xl border border-slate-200 dark:border-[#222] bg-white dark:bg-[#0a0a0a] p-5 text-center">
                <p className="text-sm text-slate-600 dark:text-[#a0a0a0]">
                  {t("রেটিং দিতে সাইন ইন করুন", "Sign in to rate this product")}
                </p>
              </div>
            ) : ratings.some((r) => r.userId === user.id) ? (
              <div className="rounded-2xl border border-slate-200 dark:border-[#222] bg-slate-50 dark:bg-[#0f0f0f] p-5 text-center">
                <Icon
                  name="Star"
                  size={20}
                  className="text-yellow-400 mx-auto"
                  fill="currentColor"
                />
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-[#e0e0e0]">
                  {t("আপনি ইতিমধ্যে রেটিং দিয়েছেন", "You have already rated this product")}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t(
                    "একজন ব্যবহারকারী একটি পণ্যে একবার রেটিং দিতে পারেন",
                    "Each user can rate a product once"
                  )}
                </p>
              </div>
            ) : (
              <RatingForm onSubmit={handleRate} />
            )}
          </div>

          <ReviewList ratings={ratings} loading={ratingsLoading} />
        </div>
      </section>
    </div>
  );
}
