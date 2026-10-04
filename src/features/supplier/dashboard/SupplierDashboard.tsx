"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getSupplierDashboardStats,
  type SupplierDashboardStats,
} from "@/lib/supplierApi";

const EMPTY: SupplierDashboardStats = {
  activeInputsCount: 0,
  activeProduceListingsCount: 0,
  openOrdersCount: 0,
  inventoryValueBdt: 0,
};

/**
 * Home screen for the supplier role.
 *
 * A supplier sits in the `main` portal alongside farmers and buyers, so this
 * is deliberately built the same way as `BuyerDashboard` — four KPIs and a row
 * of shortcuts — rather than reintroducing a portal-shaped dashboard. The
 * shortcuts all resolve through the role-aware `onNavigate`, which is how the
 * marketplace ends up being a section of this sidebar instead of a separate
 * place to go.
 */
export function SupplierDashboard({
  onNavigate,
}: {
  onNavigate: (key: string) => void;
}) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SupplierDashboardStats>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    getSupplierDashboardStats()
      .then((res) => {
        if (cancelled || !res.success) return;
        setStats(res.data ?? EMPTY);
      })
      .catch(() => {
        // Keep the zeroed KPIs rather than spinning forever on a bad network.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-[#222]" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#111]"
            />
          ))}
        </div>
      </div>
    );
  }

  const kpis: Array<{ label: string; value: string }> = [
    { label: t("সক্রিয় ইনপুট", "Active Inputs"), value: stats.activeInputsCount.toLocaleString() },
    {
      label: t("সক্রিয় তালিকা", "Active Produce Listings"),
      value: stats.activeProduceListingsCount.toLocaleString(),
    },
    { label: t("খোলা অর্ডার", "Open Orders"), value: stats.openOrdersCount.toLocaleString() },
    {
      label: t("মজুত মূল্য (BDT)", "Inventory Value (BDT)"),
      value: `৳${stats.inventoryValueBdt.toLocaleString()}`,
    },
  ];

  const shortcuts: Array<{ key: string; label: string; emoji: string }> = [
    { key: "inventory", label: t("ইনপুট মজুত", "Manage Inputs"), emoji: "📦" },
    { key: "my_listings", label: t("পণ্য তালিকা", "My Listings"), emoji: "🌾" },
    { key: "inputs", label: t("ইনপুট মার্কেট", "Browse Inputs"), emoji: "🛒" },
    { key: "products", label: t("পণ্য মার্কেট", "Browse Products"), emoji: "🧺" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t("সরবরাহকারী ড্যাশবোর্ড", "Supplier Dashboard")}
          {user?.name ? (
            <span className="ml-2 text-base font-medium text-slate-400">
              · {user.name}
            </span>
          ) : null}
        </h1>
        <p className="text-slate-500">
          {t(
            "আপনার কৃষি ইনপুট ও তালিকার সারসংক্ষেপ।",
            "Your farm inputs, listings and open orders at a glance."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#111]"
          >
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#f0f0f0]">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.key}
            onClick={() => onNavigate(shortcut.key)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-emerald-400 dark:border-[#222] dark:bg-[#111] dark:hover:border-emerald-500/60"
          >
            <div className="text-2xl">{shortcut.emoji}</div>
            <p className="mt-2 text-sm font-semibold">{shortcut.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
