"use client";

import React, { useEffect, useState } from "react";
import {
  Store,
  ShoppingCart,
  Send,
  CreditCard,
  ClipboardList,
  FileText,
  Heart,
  Coins,
} from "@/components/icons";
import {
  DashboardHero,
  DashboardStatGrid,
  ServiceGrid,
  ServiceInfoModal,
  DashboardSkeleton,
  ModalRow,
  ModalChip,
  ModalStat,
  ModalEmpty,
  useT,
  type ServiceCardItem,
} from "@/components/dashboard";
import { getBuyerDashboardStats } from "@/lib/marketplaceApi";
import { fmtBdt } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";

interface KPIs {
  activeOrders: number;
  totalSpentBdt: number;
  openDemands: number;
  savedListings: number;
}

const EMPTY: KPIs = {
  activeOrders: 0,
  totalSpentBdt: 0,
  openDemands: 0,
  savedListings: 0,
};

/**
 * Overview for the buyer role (`main` portal).
 *
 * Rebuilt on the dashboard kit: the flat "title + four bare boxes" layout is
 * gone in favour of the farmer/admin hero + KPI + service-grid structure, and
 * the blue accent that used to set it apart from the rest of the app is now
 * the shared emerald.
 */
export function BuyerDashboard({
  onNavigate,
}: {
  onNavigate: (key: string) => void;
}) {
  const t = useT();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KPIs>(EMPTY);
  const [selected, setSelected] = useState<ServiceCardItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBuyerDashboardStats()
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        setStats({
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

  const avgOrderValue =
    stats.activeOrders > 0
      ? Math.round(stats.totalSpentBdt / Math.max(stats.activeOrders, 1))
      : 0;

  const serviceCards: ServiceCardItem[] = [
    {
      id: "products",
      moduleKey: "products",
      icon: Store,
      titleBn: "পণ্য ব্রাউজ করুন",
      titleEn: "Browse Produce",
      badgeBn: "খুচরা ও পাইকারি",
      badgeEn: "Retail & Bulk",
      descBn: "তাজা ফসল, মৌসুমি সবজি ও মূল্য তুলনা",
      descEn: "Fresh harvests, seasonal vegetables and price comparison",
      tone: "emerald",
    },
    {
      id: "orders",
      moduleKey: "my_orders",
      icon: ClipboardList,
      titleBn: "আমার অর্ডার",
      titleEn: "My Orders",
      badgeBn: `${stats.activeOrders}টি সক্রিয়`,
      badgeEn: `${stats.activeOrders} Active`,
      descBn: "চলমান অর্ডারের অবস্থা, ডেলিভারি ও রসিদ",
      descEn: "Track order status, delivery and invoices",
      tone: "blue",
    },
    {
      id: "demands",
      moduleKey: "demands",
      icon: Send,
      titleBn: "চাহিদা জানান",
      titleEn: "Post a Demand",
      badgeBn: `${stats.openDemands}টি খোলা`,
      badgeEn: `${stats.openDemands} Open`,
      descBn: "কোন পণ্য কত পরিমাণে লাগে তা বিক্রেতাদের জানান",
      descEn: "Tell suppliers what you need and in what quantity",
      tone: "amber",
    },
    {
      id: "payments",
      moduleKey: "payments",
      icon: CreditCard,
      titleBn: "পেমেন্ট",
      titleEn: "Payments",
      badgeBn: `${fmtBdt(stats.totalSpentBdt)} খরচ`,
      badgeEn: `${fmtBdt(stats.totalSpentBdt)} Spent`,
      descBn: "বিকাশ, নগদ ও ব্যাংক পেমেন্টের হিসাব",
      descEn: "bKash, Nagad and bank transfer history",
      tone: "indigo",
    },
    {
      id: "saved",
      // Was `products` — the shelf had nowhere to go, so the card quietly
      // sent buyers to the whole catalogue and its count was pinned at zero.
      // Both are fixed by `/dashboard/saved` and the `SavedListing` rows
      // behind `GET /marketplace/saved`.
      moduleKey: "saved",
      icon: Heart,
      titleBn: "সংরক্ষিত তালিকা",
      titleEn: "Saved Listings",
      badgeBn: `${stats.savedListings}টি সংরক্ষিত`,
      badgeEn: `${stats.savedListings} Saved`,
      descBn: "পছন্দের পণ্য ও দাম আবার দ্রুত খুঁজে নিন",
      descEn: "Reopen your favourite products and prices quickly",
      tone: "rose",
    },
    {
      id: "history",
      moduleKey: "order_history",
      icon: FileText,
      titleBn: "অর্ডার ইতিহাস",
      titleEn: "Order History",
      badgeBn: "পুরোনো রেকর্ড",
      badgeEn: "Past Records",
      descBn: "সম্পন্ন অর্ডার, রসিদ ও পুনরায় কেনার সুবিধা",
      descEn: "Completed orders, receipts and quick re-ordering",
      tone: "teal",
    },
  ];

  if (loading) {
    return <DashboardSkeleton variant="metrics" />;
  }

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <DashboardHero
        title={t("ক্রেতা ড্যাশবোর্ড", "Buyer Dashboard")}
        subtitle={t(
          "আপনার অর্ডার, চাহিদা ও মোট খরচের সারসংক্ষেপ এক নজরে।",
          "A summary of your orders, demands, and total spend."
        )}
        meta={
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{user?.name ?? t("ডেমো ক্রেতা", "Demo Buyer")}</span>
            <span className="text-slate-300 dark:text-[#444]">•</span>
            <span>{t("বাংলাদেশ মার্কেটপ্লেস", "Bangladesh Marketplace")}</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => onNavigate("products")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>{t("পণ্য দেখুন", "Browse Produce")}</span>
          </button>
        }
      />

      {/* KPI row */}
      <DashboardStatGrid
        tiles={[
          {
            id: "active-orders",
            title: t("সক্রিয় অর্ডার", "Active Orders"),
            value: stats.activeOrders,
            change: stats.activeOrders > 0 ? t("চলছে", "In progress") : t("নতুন শুরু", "Get started"),
            trend: stats.activeOrders > 0 ? "up" : "neutral",
            subtitle: t("ডেলিভারির জন্য অপেক্ষমাণ", "Awaiting delivery"),
            icon: ShoppingCart,
            colorScheme: "emerald",
            onClick: () => onNavigate("my_orders"),
          },
          {
            id: "total-spent",
            title: t("মোট খরচ (BDT)", "Total Spent (BDT)"),
            value: fmtBdt(stats.totalSpentBdt),
            change: avgOrderValue > 0 ? fmtBdt(avgOrderValue) : undefined,
            trend: "neutral",
            subtitle: t("গড় অর্ডার মূল্য", "Average order value"),
            icon: Coins,
            colorScheme: "blue",
            onClick: () => onNavigate("payments"),
          },
          {
            id: "open-demands",
            title: t("খোলা চাহিদা", "Open Demands"),
            value: stats.openDemands,
            change: stats.openDemands > 0 ? t("সক্রিয়", "Live") : t("নতুন", "New"),
            trend: stats.openDemands > 0 ? "up" : "neutral",
            subtitle: t("সরবরাহকারীদের জন্য প্রকাশিত", "Published to suppliers"),
            icon: Send,
            colorScheme: "amber",
            onClick: () => onNavigate("demands"),
          },
          {
            id: "saved-listings",
            title: t("সংরক্ষিত তালিকা", "Saved Listings"),
            value: stats.savedListings,
            change: t("পছন্দ", "Favourites"),
            trend: "neutral",
            subtitle: t("দ্রুত দেখার জন্য রাখা", "Kept for quick access"),
            icon: Heart,
            colorScheme: "indigo",
            onClick: () => onNavigate("saved"),
          },
        ]}
      />

      {/* Service grid */}
      <ServiceGrid
        label={t("কেনাকাটা সেবা (আইকনে ক্লিক করে তথ্য দেখুন)", "Shopping Services (Click Icon for Details)")}
        items={serviceCards}
        onSelect={setSelected}
      />

      {/* Info modal */}
      {selected && (
        <ServiceInfoModal
          item={selected}
          onClose={() => setSelected(null)}
          onOpenPage={selected.moduleKey ? () => onNavigate(selected.moduleKey!) : undefined}
        >
          {selected.id === "products" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সংরক্ষিত পণ্য", "Saved Products")}
                  value={stats.savedListings}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("খোলা চাহিদা", "Open Demands")}
                  value={stats.openDemands}
                />
              </div>
              <ModalRow
                title={t("মৌসুমি সবজি", "Seasonal Vegetables")}
                subtitle={t(
                  "প্রত্যক্ষ খামার থেকে সরাসরি সরবরাহ",
                  "Direct from farm gates"
                )}
                chip={
                  <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {t("তাজা", "Fresh")}
                  </ModalChip>
                }
              />
              <ModalRow
                title={t("চাল ও শস্য", "Rice & Grains")}
                subtitle={t(
                  "পাইকারি দামে বাল্ক অর্ডার",
                  "Bulk orders at wholesale rates"
                )}
                chip={
                  <ModalChip className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    {t("পাইকারি", "Wholesale")}
                  </ModalChip>
                }
              />
            </div>
          )}

          {selected.id === "orders" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সক্রিয় অর্ডার", "Active Orders")}
                  value={stats.activeOrders}
                  valueClassName="text-blue-700 dark:text-blue-400"
                />
                <ModalStat
                  label={t("মোট খরচ", "Total Spent")}
                  value={fmtBdt(stats.totalSpentBdt)}
                />
              </div>
              {stats.activeOrders > 0 ? (
                <ModalRow
                  title={t("চলমান অর্ডার ট্র্যাক করুন", "Track your running orders")}
                  subtitle={t(
                    "সরাসরি অর্ডার পাতায় স্ট্যাটাস ও ডেলিভারি দেখুন",
                    "Open the orders page for live status and delivery"
                  )}
                  chip={
                    <ModalChip className="bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                      {stats.activeOrders}
                    </ModalChip>
                  }
                />
              ) : (
                <ModalEmpty>
                  {t(
                    "কোনো চলমান অর্ডার নেই — মার্কেটপ্লেস থেকে নতুন কেনাকাটা শুরু করুন।",
                    "No active orders — start shopping from the marketplace."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "demands" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("খোলা চাহিদা", "Open Demands")}
                  value={stats.openDemands}
                  valueClassName="text-amber-700 dark:text-amber-400"
                />
                <ModalStat
                  label={t("সরবরাহকারী দেখেছে", "Supplier Views")}
                  value={stats.openDemands > 0 ? stats.openDemands * 4 : 0}
                />
              </div>
              {stats.openDemands > 0 ? (
                <ModalRow
                  title={t("চাহিদা সক্রিয় আছে", "Your demands are live")}
                  subtitle={t(
                    "সরবরাহকারীরা আপনার চাহিদা দেখে উদ্ধৃতি পাঠাচ্ছেন",
                    "Suppliers can see them and send quotes"
                  )}
                  chip={
                    <ModalChip className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      {t("সক্রিয়", "Live")}
                    </ModalChip>
                  }
                />
              ) : (
                <ModalEmpty>
                  {t(
                    "নতুন চাহিদা তৈরি করলে বিক্রেতারা আপনার কাছে আসবেন।",
                    "Post a demand and sellers will come to you."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "payments" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("মোট খরচ", "Total Spent")}
                  value={fmtBdt(stats.totalSpentBdt)}
                  valueClassName="text-indigo-700 dark:text-indigo-400"
                />
                <ModalStat
                  label={t("গড় অর্ডার", "Avg Order")}
                  value={fmtBdt(avgOrderValue)}
                />
              </div>
              <ModalRow
                title={t("সমর্থিত পেমেন্ট", "Supported Payments")}
                subtitle={t("বিকাশ, নগদ, রকেট ও সরাসরি ব্যাংক", "bKash, Nagad, Rocket and bank transfer")}
                chip={
                  <ModalChip className="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {t("নিরাপদ", "Secure")}
                  </ModalChip>
                }
              />
            </div>
          )}

          {selected.id === "saved" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সংরক্ষিত", "Saved")}
                  value={stats.savedListings}
                  valueClassName="text-rose-700 dark:text-rose-400"
                />
                <ModalStat
                  label={t("সক্রিয় অর্ডার", "Active Orders")}
                  value={stats.activeOrders}
                />
              </div>
              {stats.savedListings > 0 ? (
                <ModalRow
                  title={t("আপনার পছন্দের তালিকা", "Your shortlist")}
                  subtitle={t(
                    "দাম কমলে সাথে সাথে জানতে পারবেন",
                    "You will spot price drops immediately"
                  )}
                  chip={
                    <ModalChip className="bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                      {stats.savedListings}
                    </ModalChip>
                  }
                />
              ) : (
                <ModalEmpty>
                  {t(
                    "পছন্দের পণ্যে হার্ট চাপলে এখানে জমা হবে।",
                    "Tap the heart on a product to save it here."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "history" && (
            <div className="space-y-3">
              <ModalRow
                title={t("সম্পন্ন অর্ডার", "Completed Orders")}
                subtitle={t(
                  "পুরোনো রসিদ ও ডেলিভারি রেকর্ড দেখুন",
                  "Review past receipts and delivery records"
                )}
                chip={
                  <ModalChip className="bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300">
                    {t("সংরক্ষিত", "Archived")}
                  </ModalChip>
                }
              />
              <ModalRow
                title={t("এক ক্লিকে পুনরায় কিনুন", "Re-order in one click")}
                subtitle={t(
                  "আগের অর্ডার থেকে সরাসরি আবার কিনতে পারবেন",
                  "Repeat any previous order without re-searching"
                )}
                chip={
                  <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {t("সুবিধা", "Easy")}
                  </ModalChip>
                }
              />
            </div>
          )}
        </ServiceInfoModal>
      )}
    </div>
  );
}
