"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, ShoppingCart, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/lib/api";
import {
  getCart,
  removeFromCart,
  saveCart,
  type CartItem,
} from "@/lib/marketplaceApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { tr } from "@/lib/localize";

export function CartPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [items, setItems] = useState<CartItem[]>(() => getCart());

  const sync = useCallback(() => setItems(getCart()), []);

  useEffect(() => {
    // Initial sync on mount only
    const rafId = requestAnimationFrame(() => sync());
    return () => cancelAnimationFrame(rafId);
  }, [sync]);

  /**
   * Produce moves in 10 kg steps; an input moves by its own minimum order
   * (or by one when it has none), because "+10" on a 2-bag minimum is
   * nonsense.
   */
  const stepFor = (item: CartItem) =>
    item.kind === "input" ? Math.max(1, item.minimumOrder ?? 1) : 10;

  const clampQty = (item: CartItem, qty: number) => {
    const min = item.kind === "input" ? Math.max(1, item.minimumOrder ?? 1) : 1;
    const max = item.maxQuantity ?? Number.POSITIVE_INFINITY;
    return Math.min(max, Math.max(min, qty));
  };

  const handleRemove = (lineId: string) => {
    setItems(removeFromCart(lineId));
    showToast(
      "success",
      language === "bn" ? "কার্ট থেকে পণ্য সরানো হয়েছে" : "Item removed from cart"
    );
  };

  const handleQtyChange = (lineId: string, qty: number) => {
    const target = items.find((i) => i.lineId === lineId);
    if (!target) return;
    const next = clampQty(target, qty);
    if (next !== qty) {
      showToast(
        "error",
        target.maxQuantity !== undefined && qty > target.maxQuantity
          ? language === "bn"
            ? `স্টকে আছে মাত্র ${target.maxQuantity} ${tr(target.unitLabel)}`
            : `Only ${target.maxQuantity} ${target.unitLabel} in stock`
          : language === "bn"
            ? `সর্বনিম্ন অর্ডার ${target.minimumOrder ?? 1} ${tr(target.unitLabel)}`
            : `Minimum order is ${target.minimumOrder ?? 1} ${target.unitLabel}`
      );
    }
    const updated = items.map(i =>
      i.lineId === lineId ? { ...i, quantityKg: next } : i
    );
    saveCart(updated);
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.pricePerKgBdt * i.quantityKg, 0);
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/products" className="hover:text-blue-600">{language === "bn" ? "মার্কেটপ্লেস" : "Marketplace"}</Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium">{language === "bn" ? "কার্ট" : "Cart"}</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0] mb-6">
        {language === "bn" ? "শপিং কার্ট" : "Shopping Cart"}
        {items.length > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({items.length} {language === "bn" ? "টি পণ্য" : "items"})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={language === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}
          description={language === "bn"
            ? "যাচাইকৃত কৃষকের ফসল বা ইনপুট মার্কেটপ্লেস (বীজ, সার) থেকে পণ্য যোগ করুন — দুটোই একই কার্টে থাকে।"
            : "Add produce from verified farmers or farm inputs like seed and fertiliser — both go in this one basket."}
          action={
            <Button onClick={() => router.push("/products")} icon={ArrowRight} iconPosition="right">
              {language === "bn" ? "পণ্য ব্রাউজ করুন" : "Browse Products"}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.lineId} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-4 flex gap-4">
                <img
                  src={item.imageUrl}
                  alt={tr(item.cropName)}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">{tr(item.cropName)}</h3>
                      <p className="text-xs text-slate-400">{tr(item.variety)} · {item.farmerName}</p>
                      {item.kind === "input" ? (
                        /* Inputs have no quality grade — show which half of the
                           marketplace the line came from instead. */
                        <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
                          {language === "bn" ? "ইনপুট" : "Input"}
                        </span>
                      ) : (
                        <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.qualityGrade === "Grade A"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}>
                          {tr(item.qualityGrade)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.lineId)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(item.lineId, item.quantityKg - stepFor(item))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#333] flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
                      >
                        <Icon name="Minus" size={12} />
                      </button>
                      <span className="text-sm font-semibold text-slate-800 dark:text-[#e0e0e0] min-w-[70px] text-center">
                        {item.quantityKg} {tr(item.unitLabel)}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.lineId, item.quantityKg + stepFor(item))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#333] flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
                      >
                        <Icon name="Plus" size={12} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">৳{item.pricePerKgBdt}/{tr(item.unitLabel)}</p>
                      <p className="text-sm font-black text-blue-700 dark:text-blue-400">
                        ৳{(item.pricePerKgBdt * item.quantityKg).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-5 sticky top-28">
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0] mb-4">{language === "bn" ? "অর্ডার সামারি" : "Order Summary"}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-[#a0a0a0]">
                  <span>{language === "bn" ? `সাবটোটাল (${items.length}টি পণ্য)` : `Subtotal (${items.length} items)`}</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-[#a0a0a0]">
                  <span>{language === "bn" ? "ডেলিভারি ফি (আনুমানিক)" : "Delivery Fee (est.)"}</span>
                  <span>৳{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-[#1a1a1a] flex justify-between font-black text-slate-900 dark:text-[#f0f0f0]">
                  <span>{language === "bn" ? "মোট" : "Total"}</span>
                  <span className="text-blue-700 dark:text-blue-400">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full mt-5"
                size="lg"
                onClick={() => {
                  if (!user) {
                    router.push(getLoginUrl("/dashboard/checkout"));
                    return;
                  }
                  router.push("/dashboard/checkout");
                }}
              >
                {user
                  ? language === "bn"
                    ? "চেকআউটে যান"
                    : "Proceed to Checkout"
                  : language === "bn"
                    ? "চেকআউটের জন্য লগইন করুন"
                    : "Login to Checkout"}
              </Button>

              <Link href="/products" className="block text-center text-xs text-slate-400 hover:text-blue-600 mt-3">
                {"← " + (language === "bn" ? "কেনাকাটা চালিয়ে যান" : "Continue Shopping")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
