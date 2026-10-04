"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getInputById, type SupplierProduct } from "@/lib/supplierApi";
import { addInputToCart } from "@/lib/marketplaceApi";

interface Props {
  id: string;
  basePath?: string;
}

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

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

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
      showToast("error", `${t("সর্বনিম্ন অর্ডার", "Minimum order is")} ${minOrder} ${product.unit}`);
      return;
    }
    setAddingToCart(true);
    addInputToCart(product, quantity);
    showToast(
      "success",
      `${product.productName} ${t("কার্টে যোগ হয়েছে", "added to cart")} (${quantity} ${product.unit})`
    );
    setAddingToCart(false);
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
          {product.productName}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="neutral">{product.category}</Badge>
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
                {product.stockQuantity.toLocaleString()} {product.unit}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-[#222] p-3">
              <p className="text-[11px] text-slate-400">{t("সর্বনিম্ন", "Min order")}</p>
              <p className="mt-1 text-sm font-bold">
                {minOrder} {product.unit}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-[#222] p-3">
              <p className="text-[11px] text-slate-400">{t("ক্যাটাগরি", "Category")}</p>
              <p className="mt-1 text-sm font-bold">{product.category}</p>
            </div>
          </div>
        </div>

        {/* Facts + action */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0]">
            {product.productName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mt-1">
            {product.supplierName}
          </p>

          <p className="mt-4 text-3xl font-black text-blue-700 dark:text-blue-400">
            ৳{product.pricePerUnitBdt.toLocaleString()}
            <span className="text-base font-semibold text-slate-400">/{product.unit}</span>
          </p>

          {lowStock && (
            <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              <Icon name="AlertTriangle" size={14} className="shrink-0 mt-0.5" />
              <span>
                {t("শুধুমাত্র", "Only")} {product.stockQuantity} {product.unit}{" "}
                {t("বাকি আছে।", "left in stock.")}
              </span>
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-[#a0a0a0]">
            {product.description}
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
                aria-label="Decrease quantity"
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
                aria-label="Increase quantity"
              >
                <Icon name="Plus" size={14} />
              </button>
              <span className="text-xs text-slate-400">{product.unit}</span>
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
    </div>
  );
}
