"use client";

import React, { useEffect, useState } from "react";
import {
  PackageOpen,
  Store,
  ShoppingCart,
  Warehouse,
  ClipboardList,
  CreditCard,
  Coins,
  Sprout,
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
import {
  getSupplierDashboardStats,
  getSupplierProducts,
  type SupplierDashboardStats,
  type SupplierProduct,
} from "@/lib/supplierApi";
import { getMyProduceListings } from "@/lib/marketplaceApi";
import { ProduceListing } from "@/types";
import { fmtBdt } from "@/lib/format";
import { tr, trPhrase } from "@/lib/localize";
import { useAuth } from "@/contexts/AuthContext";

/** Category labels the shared dictionary does not cover. */
const CATEGORY_LABEL: Record<string, [string, string]> = {
  Tools: ["কৃষি সরঞ্জাম", "Tools"],
  Equipment: ["যন্ত্রপাতি", "Equipment"],
  Packaging: ["প্যাকেজিং", "Packaging"],
};

const categoryLabel = (value: string, t: (bn: string, en: string) => string) => {
  const local = CATEGORY_LABEL[value];
  return local ? t(local[0], local[1]) : tr(value);
};

interface SupplierDashboardProps {
  onNavigate: (module: string) => void;
}

const EMPTY: SupplierDashboardStats = {
  activeInputsCount: 0,
  activeProduceListingsCount: 0,
  openOrdersCount: 0,
  inventoryValueBdt: 0,
};

/**
 * Overview for the supplier role (`main` portal).
 *
 * Previously this was structurally identical to `BuyerDashboard` — four bare
 * KPI boxes and four emoji shortcuts — with a JSDoc noting the duplication was
 * deliberate. Both now share the kit, so the file keeps only what is actually
 * supplier-specific: the stats, the listings, and the modal bodies.
 */
export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  onNavigate,
}) => {
  const t = useT();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SupplierDashboardStats>(EMPTY);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [selected, setSelected] = useState<ServiceCardItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, productsRes, listingsRes] = await Promise.all([
          getSupplierDashboardStats().catch(() => null),
          getSupplierProducts().catch(() => null),
          getMyProduceListings().catch(() => null),
        ]);

        if (cancelled) return;
        if (statsRes?.success && statsRes.data) setStats(statsRes.data);
        if (productsRes?.success) setProducts(productsRes.data);
        if (listingsRes?.success) setListings(listingsRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProducts = products.filter((p) => p.isAvailable);
  const outOfStock = activeProducts.filter((p) => p.stockQuantity <= 0);
  const pendingListings = listings.filter((l) => !l.isVerified);

  const serviceCards: ServiceCardItem[] = [
    {
      id: "inventory",
      moduleKey: "inventory",
      icon: Warehouse,
      titleBn: "ইনপুট মজুত",
      titleEn: "Manage Inputs",
      badgeBn: `${stats.activeInputsCount}টি সক্রিয়`,
      badgeEn: `${stats.activeInputsCount} Active`,
      descBn: "সার, বীজ ও কীটনাশকের স্টক, দাম ও তালিকাভুক্তি",
      descEn: "Stock, pricing and availability of seeds and fertilizers",
      tone: "emerald",
    },
    {
      id: "my_listings",
      moduleKey: "my_listings",
      icon: Store,
      titleBn: "পণ্য তালিকা",
      titleEn: "My Listings",
      badgeBn: `${stats.activeProduceListingsCount}টি অনুমোদিত`,
      badgeEn: `${stats.activeProduceListingsCount} Approved`,
      descBn: "প্রকাশিত ফসলের তালিকা, দাম ও অনুমোদনের অবস্থা",
      descEn: "Published crops, prices and approval status",
      tone: "blue",
    },
    {
      id: "inputs",
      moduleKey: "inputs",
      icon: Sprout,
      titleBn: "ইনপুট মার্কেট",
      titleEn: "Browse Inputs",
      badgeBn: "কেনার জন্য",
      badgeEn: "To Buy",
      descBn: "অন্য সরবরাহকারীদের কাছ থেকে ক্রয় ও তুলনা",
      descEn: "Compare and buy inputs from other suppliers",
      tone: "amber",
    },
    {
      id: "products",
      moduleKey: "products",
      icon: ShoppingCart,
      titleBn: "পণ্য মার্কেট",
      titleEn: "Browse Products",
      badgeBn: "মূল্য তুলনা",
      badgeEn: "Compare",
      descBn: "সরবরাহকৃত পণ্যের বাজারদর ও প্রতিযোগিতা দেখুন",
      descEn: "See market rates for the produce you supply",
      tone: "cyan",
    },
    {
      id: "orders",
      moduleKey: "my_orders",
      icon: ClipboardList,
      titleBn: "খোলা অর্ডার",
      titleEn: "Open Orders",
      badgeBn: `${stats.openOrdersCount}টি বাকি`,
      badgeEn: `${stats.openOrdersCount} Open`,
      descBn: "চলমান অর্ডার, ডেলিভারি ও পেমেন্টের অবস্থা",
      descEn: "Track order status, delivery and payment",
      tone: "indigo",
    },
    {
      id: "payments",
      moduleKey: "payments",
      icon: CreditCard,
      titleBn: "পেমেন্ট",
      titleEn: "Payments",
      badgeBn: `${fmtBdt(stats.inventoryValueBdt)} মূল্য`,
      badgeEn: `${fmtBdt(stats.inventoryValueBdt)} Stock`,
      descBn: "আয়, প্রদত্ত টাকা ও বকেয়ার হিসাব",
      descEn: "Revenue received and payments still due",
      tone: "rose",
    },
  ];

  if (loading) {
    return <DashboardSkeleton variant="metrics" />;
  }

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <DashboardHero
        title={t("সরবরাহকারী ড্যাশবোর্ড", "Supplier Dashboard")}
        subtitle={t(
          "আপনার কৃষি ইনপুট, তালিকা ও খোলা অর্ডার এক নজরে।",
          "Your farm inputs, listings and open orders at a glance."
        )}
        meta={
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{user?.name ?? t("করিম ট্রেডার্স", "Karim Traders")}</span>
            <span className="text-slate-300 dark:text-[#444]">•</span>
            <span>{t("সরবরাহকারী অ্যাকাউন্ট", "Supplier Account")}</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => onNavigate("my_listings")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>{t("নতুন তালিকা", "New Listing")}</span>
          </button>
        }
      />

      {/* KPI row */}
      <DashboardStatGrid
        tiles={[
          {
            id: "active-inputs",
            title: t("সক্রিয় ইনপুট", "Active Inputs"),
            value: stats.activeInputsCount,
            change: outOfStock.length > 0 ? `${outOfStock.length} ${t("স্টক শেষ", "out of stock")}` : t("সব আছে", "All stocked"),
            trend: outOfStock.length > 0 ? "down" : "up",
            subtitle: t("তালিকাভুক্ত ও ক্রয়যোগ্য", "Listed and purchasable"),
            icon: PackageOpen,
            colorScheme: "emerald",
            onClick: () => onNavigate("inventory"),
          },
          {
            id: "active-listings",
            title: t("সক্রিয় তালিকা", "Active Produce Listings"),
            value: stats.activeProduceListingsCount,
            change: pendingListings.length > 0 ? `${pendingListings.length} ${t("অনুমোদনে", "pending")}` : t("অনুমোদিত", "Approved"),
            trend: "neutral",
            subtitle: t("বাজারে প্রকাশিত", "Published to market"),
            icon: Store,
            colorScheme: "blue",
            onClick: () => onNavigate("my_listings"),
          },
          {
            id: "open-orders",
            title: t("খোলা অর্ডার", "Open Orders"),
            value: stats.openOrdersCount,
            change: stats.openOrdersCount > 0 ? t("চলছে", "In progress") : t("নিশ্চিন্ত", "All clear"),
            trend: stats.openOrdersCount > 0 ? "neutral" : "up",
            subtitle: t("ডেলিভারি ও পেমেন্ট বাকি", "Delivery and payment pending"),
            icon: ClipboardList,
            colorScheme: "amber",
            onClick: () => onNavigate("my_orders"),
          },
          {
            id: "inventory-value",
            title: t("মজুত মূল্য (BDT)", "Inventory Value (BDT)"),
            value: fmtBdt(stats.inventoryValueBdt),
            change: t("তালিকামূল্যে", "At list price"),
            trend: "up",
            subtitle: t("হাতে থাকা স্টকের মূল্য", "Value of stock on hand"),
            icon: Coins,
            colorScheme: "indigo",
            onClick: () => onNavigate("inventory"),
          },
        ]}
      />

      {/* Service grid */}
      <ServiceGrid
        label={t("সরবরাহ সেবা (আইকনে ক্লিক করে তথ্য দেখুন)", "Supplier Services (Click Icon for Details)")}
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
          {selected.id === "inventory" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সক্রিয় ইনপুট", "Active Inputs")}
                  value={stats.activeInputsCount}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("মজুত মূল্য", "Stock Value")}
                  value={fmtBdt(stats.inventoryValueBdt)}
                />
              </div>
              {activeProducts.length > 0 ? (
                <div className="space-y-2">
                  {activeProducts.slice(0, 4).map((p) => (
                    <ModalRow
                      key={p.id}
                      title={trPhrase(p.productName)}
                      subtitle={`${categoryLabel(p.category, t)} · ${p.stockQuantity.toLocaleString()} ${tr(p.unit)} · ${fmtBdt(p.pricePerUnitBdt)}`}
                      chip={
                        <ModalChip
                          className={
                            p.stockQuantity > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300"
                          }
                        >
                          {p.stockQuantity > 0
                            ? t("স্টক আছে", "In Stock")
                            : t("শেষ", "Out of Stock")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "কোনো ইনপুট তালিকাভুক্ত হয়নি — প্রথমে একটি যোগ করুন।",
                    "No inputs listed yet — add your first one."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "my_listings" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("অনুমোদিত", "Approved")}
                  value={stats.activeProduceListingsCount}
                  valueClassName="text-blue-700 dark:text-blue-400"
                />
                <ModalStat
                  label={t("অনুমোদনের অপেক্ষায়", "Awaiting Approval")}
                  value={pendingListings.length}
                  valueClassName="text-amber-700 dark:text-amber-400"
                />
              </div>
              {listings.length > 0 ? (
                <div className="space-y-2">
                  {listings.slice(0, 4).map((l) => (
                    <ModalRow
                      key={l.id}
                      title={`${trPhrase(l.cropName)}${l.variety ? ` · ${trPhrase(l.variety)}` : ""}`}
                      subtitle={`${l.quantityKg.toLocaleString()} kg · ${fmtBdt(l.pricePerKgBdt)}/kg · ${trPhrase(l.district)}`}
                      chip={
                        <ModalChip
                          className={
                            l.isVerified
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                          }
                        >
                          {l.isVerified
                            ? t("যাচাইকৃত", "Verified")
                            : t("যাচাই বাকি", "Unverified")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "এখনো কোনো ফসল তালিকাভুক্ত করা হয়নি।",
                    "No produce listed yet."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "inputs" && (
            <div className="space-y-3">
              <ModalRow
                title={t("পাইকারি ক্রয়", "Wholesale Buying")}
                subtitle={t(
                  "অন্য সরবরাহকারীদের ইনপুট সরাসরি কিনুন",
                  "Buy inputs directly from other suppliers"
                )}
                chip={
                  <ModalChip className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    {t("খোলা", "Open")}
                  </ModalChip>
                }
              />
              <ModalRow
                title={t("দাম তুলনা", "Price Comparison")}
                subtitle={t(
                  "একই পণ্যের দাম তুলনা করে সাশ্রয় করুন",
                  "Compare rates on the same input before ordering"
                )}
                chip={
                  <ModalChip className="bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300">
                    {t("সাশ্রয়", "Save")}
                  </ModalChip>
                }
              />
            </div>
          )}

          {selected.id === "products" && (
            <div className="space-y-3">
              <ModalRow
                title={t("বাজারদর দেখুন", "Watch Market Rates")}
                subtitle={t(
                  "আপনার সরবরাহকৃত পণ্যের সম্ভাব্য দাম",
                  "Going rates for the produce you supply"
                )}
                chip={
                  <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {t("লাইভ", "Live")}
                  </ModalChip>
                }
              />
              <ModalStat
                label={t("সক্রিয় তালিকা", "Your Listings")}
                value={stats.activeProduceListingsCount}
                valueClassName="text-emerald-700 dark:text-emerald-400"
              />
            </div>
          )}

          {selected.id === "orders" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("খোলা অর্ডার", "Open Orders")}
                  value={stats.openOrdersCount}
                  valueClassName="text-amber-700 dark:text-amber-400"
                />
                <ModalStat
                  label={t("সক্রিয় ইনপুট", "Active Inputs")}
                  value={stats.activeInputsCount}
                />
              </div>
              {stats.openOrdersCount > 0 ? (
                <ModalRow
                  title={t("ডেলিভারি ও পেমেন্ট বাকি", "Delivery & payment pending")}
                  subtitle={t(
                    "অর্ডার পাতায় গিয়ে বর্তমান অবস্থা দেখুন",
                    "Open the orders page for live status"
                  )}
                  chip={
                    <ModalChip className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      {stats.openOrdersCount}
                    </ModalChip>
                  }
                />
              ) : (
                <ModalEmpty>
                  {t(
                    "কোনো খোলা অর্ডার নেই — সব সম্পন্ন হয়েছে।",
                    "No open orders — everything is complete."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "payments" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("মজুত মূল্য", "Inventory Value")}
                  value={fmtBdt(stats.inventoryValueBdt)}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("খোলা অর্ডার", "Open Orders")}
                  value={stats.openOrdersCount}
                />
              </div>
              <ModalRow
                title={t("পেমেন্ট মাধ্যম", "Payment Methods")}
                subtitle={t(
                  "বিকাশ, নগদ ও সরাসরি ব্যাংক ট্রান্সফার",
                  "bKash, Nagad and direct bank transfer"
                )}
                chip={
                  <ModalChip className="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {t("নিরাপদ", "Secure")}
                  </ModalChip>
                }
              />
            </div>
          )}
        </ServiceInfoModal>
      )}
    </div>
  );
};
