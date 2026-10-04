"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBuyerDashboardStats } from "@/lib/marketplaceApi";
import { useLanguage } from "@/contexts/LanguageContext";

interface KPIs {
  activeOrders: number;
  totalSpentBdt: number;
  openDemands: number;
  savedListings: number;
}

export function BuyerDashboard({ onNavigate }: { onNavigate: (key: string) => void }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<KPIs>({
    activeOrders: 0,
    totalSpentBdt: 0,
    openDemands: 0,
    savedListings: 0,
  });

  useEffect(() => {
    let cancelled = false;
    getBuyerDashboardStats()
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        setDashboardStats({
          activeOrders: res.data.activeOrders ?? 0,
          totalSpentBdt: res.data.totalSpentBdt ?? 0,
          openDemands: res.data.openDemands ?? 0,
          savedListings: res.data.savedListings ?? 0,
        });
      })
      .catch(() => {
        // Leave the zeroed KPIs in place rather than spinning forever.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNavigate = (key: string) => onNavigate(key);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const totalSpent = useMemo(
    () => dashboardStats.totalSpentBdt,
    [dashboardStats]
  );
  const activeOrders = useMemo(
    () => dashboardStats.activeOrders,
    [dashboardStats]
  );
  const openDemands = useMemo(
    () => dashboardStats.openDemands,
    [dashboardStats]
  );
  const savedListings = useMemo(
    () => dashboardStats.savedListings,
    [dashboardStats]
  );

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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t("ক্রেতা ড্যাশবোর্ড", "Buyer Dashboard")}
            {user?.name ? (
              <span className="ml-2 text-base font-medium text-slate-400">
                · {user.name}
              </span>
            ) : null}
          </h1>
          <p className="text-slate-500">
            {t(
              "আপনার অর্ডার, চাহিদা ও মোট খরচের সারসংক্ষেপ।",
              "A summary of your orders, demands, and total spend."
            )}
          </p>
        </div>
        <button
          onClick={() => handleNavigate("products")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t("পণ্য দেখুন", "Browse Produce")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#111]">
          <p className="text-sm font-medium text-slate-500">
            {t("সক্রিয় অর্ডার", "Active Orders")}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {activeOrders.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#111]">
          <p className="text-sm font-medium text-slate-500">
            {t("মোট খরচ (BDT)", "Total Spent (BDT)")}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            ৳{totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#111]">
          <p className="text-sm font-medium text-slate-500">
            {t("খোলা চাহিদা", "Open Demands")}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {openDemands.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#111]">
          <p className="text-sm font-medium text-slate-500">
            {t("সংরক্ষিত তালিকা", "Saved Listings")}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {savedListings.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}