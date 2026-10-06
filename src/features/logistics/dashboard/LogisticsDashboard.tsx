"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  PackageCheck,
  Gauge,
  Coins,
  Warehouse,
  FileText,
  Bell,
  CheckCircle2,
  XCircle,
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
  getLogisticsDashboardStats,
  getActiveDeliveries,
  getDeliveryHistory,
  getFleetVehicles,
  getLogisticsEarnings,
  getLogisticsNotifications,
  type LogisticsDashboardStats,
} from "@/lib/logisticsApi";
import {
  DeliveryAssignment,
  FleetVehicle,
  LogisticsEarning,
} from "@/types";
import { fmtBdt, fmtDate } from "@/lib/format";

interface LogisticsDashboardProps {
  onNavigate: (module: string) => void;
}

const EMPTY_STATS: LogisticsDashboardStats = {
  activeDeliveriesCount: 0,
  onTimeRatePercent: 0,
  deliveriesThisWeek: 0,
  totalEarningsBdt: 0,
};

/** Shipment status → chip classes (mirrors the inspector's status helper). */
const deliveryChip = (status: DeliveryAssignment["status"]) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "in_transit":
    case "picked_up":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    case "failed":
      return "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }
};

const fleetChip = (status: FleetVehicle["currentStatus"]) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "on_route":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    case "maintenance":
      return "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300";
    default:
      return "bg-slate-200 text-slate-600 dark:bg-[#1a1a1a] dark:text-[#a0a0a0]";
  }
};

/**
 * Overview for the logistics role (`operations` portal).
 *
 * Until this file existed, logistics saw the same four-emoji stub as the
 * inspector, with no data at all. The KPI row now reads the ready-but-never-
 * called `getLogisticsDashboardStats()`, and the modals pull the underlying
 * delivery/fleet/earning lists so "View Info" shows real consignments.
 */
export const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({
  onNavigate,
}) => {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LogisticsDashboardStats>(EMPTY_STATS);
  const [active, setActive] = useState<DeliveryAssignment[]>([]);
  const [history, setHistory] = useState<DeliveryAssignment[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [earnings, setEarnings] = useState<LogisticsEarning[]>([]);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; message: string; isRead: boolean; timestamp: string }>
  >([]);
  const [selected, setSelected] = useState<ServiceCardItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, activeRes, historyRes, fleetRes, earningsRes, notifRes] =
          await Promise.all([
            getLogisticsDashboardStats().catch(() => null),
            getActiveDeliveries().catch(() => null),
            getDeliveryHistory().catch(() => null),
            getFleetVehicles().catch(() => null),
            getLogisticsEarnings().catch(() => null),
            getLogisticsNotifications().catch(() => null),
          ]);

        if (cancelled) return;
        if (statsRes?.success) setStats(statsRes.data);
        if (activeRes?.success) setActive(activeRes.data);
        if (historyRes?.success) setHistory(historyRes.data);
        if (fleetRes?.success) setFleet(fleetRes.data);
        if (earningsRes?.success) setEarnings(earningsRes.data);
        if (notifRes?.success) setNotifications(notifRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const transit = active.filter(
    (d) => d.status === "in_transit" || d.status === "picked_up"
  );
  const assigned = active.filter((d) => d.status === "assigned");
  const availableVehicles = fleet.filter((v) => v.currentStatus === "available");
  const paidEarnings = earnings.filter((e) => e.paymentStatus === "paid");
  const pendingPayout = earnings
    .filter((e) => e.paymentStatus === "pending")
    .reduce((sum, e) => sum + e.feeAmountBdt, 0);
  const unread = notifications.filter((n) => !n.isRead);

  const serviceCards: ServiceCardItem[] = [
    {
      id: "deliveries",
      moduleKey: "deliveries",
      icon: Truck,
      titleBn: "ডেলিভারি ট্র্যাকিং",
      titleEn: "Delivery Tracking",
      badgeBn: `${stats.activeDeliveriesCount}টি চলমান`,
      badgeEn: `${stats.activeDeliveriesCount} Active`,
      descBn: "চলমান কনসাইনমেন্টের অবস্থা, পিকআপ ও ডেলিভারি সময়",
      descEn: "Live consignment status, pickups and ETA updates",
      tone: "amber",
    },
    {
      id: "history",
      moduleKey: "delivery_history",
      icon: FileText,
      titleBn: "ডেলিভারি ইতিহাস",
      titleEn: "Delivery History",
      badgeBn: `${history.length}টি সম্পন্ন`,
      badgeEn: `${history.length} Completed`,
      descBn: "সম্পন্ন ডেলিভারির তালিকা ও প্রাপ্ত রসিদ",
      descEn: "Completed shipments and their delivery records",
      tone: "blue",
    },
    {
      id: "fleet",
      moduleKey: "fleet",
      icon: Warehouse,
      titleBn: "ফ্লিট ব্যবস্থাপনা",
      titleEn: "Fleet Management",
      badgeBn: `${availableVehicles.length}টি খালি`,
      badgeEn: `${availableVehicles.length} Available`,
      descBn: "গাড়ির অবস্থা, চালক ও সার্ভিস তথ্য",
      descEn: "Vehicle availability, drivers and service dates",
      tone: "indigo",
    },
    {
      id: "earnings",
      moduleKey: "logistics_earnings",
      icon: Coins,
      titleBn: "আয় ও পেমেন্ট",
      titleEn: "Earnings & Payments",
      badgeBn: `${fmtBdt(stats.totalEarningsBdt)} প্রাপ্ত`,
      badgeEn: `${fmtBdt(stats.totalEarningsBdt)} Earned`,
      descBn: "মাসভিত্তিক আয়, বকেয়া ও প্রদত্ত ভাড়ার হিসাব",
      descEn: "Monthly income, pending payouts and paid freight fees",
      tone: "emeraldDeep",
    },
    {
      id: "notifications",
      moduleKey: "logistics_notifications",
      icon: Bell,
      titleBn: "বিজ্ঞপ্তি ও সতর্কতা",
      titleEn: "Alerts & Messages",
      badgeBn: `${unread.length}টি নতুন`,
      badgeEn: `${unread.length} New`,
      descBn: "নতুন অ্যাসাইনমেন্ট, পেমেন্ট ও সার্ভিস রিমাইন্ডার",
      descEn: "New assignments, payments and service reminders",
      tone: "rose",
    },
    {
      id: "performance",
      icon: Gauge,
      titleBn: "পারফরম্যান্স",
      titleEn: "On-Time Performance",
      badgeBn: `${stats.onTimeRatePercent}% সময়ানুবর্তী`,
      badgeEn: `${stats.onTimeRatePercent}% On Time`,
      descBn: "সময়মতো ডেলিভারির হার ও গড় দূরত্বের রেকর্ড",
      descEn: "Punctuality rate and average distance per consignment",
      tone: "teal",
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Mission header */}
      <DashboardHero
        title={t("লজিস্টিক্স ড্যাশবোর্ড", "Logistics Dashboard")}
        subtitle={t(
          "চলমান ডেলিভারি, ফ্লিট ও আয়ের সারসংক্ষেপ এক নজরে।",
          "Active deliveries, fleet availability and earnings at a glance."
        )}
        meta={
          <>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{t("পরিবহন ও সরবরাহ শৃঙ্খলা", "Transport & Supply Chain")}</span>
            <span className="text-slate-300 dark:text-[#444]">•</span>
            <span>{t("নেটওয়ার্ক সচল", "Network Online")}</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => onNavigate("deliveries")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t("চলমান ডেলিভারি", "Active Deliveries")}</span>
          </button>
        }
      />

      {/* Live KPIs */}
      <DashboardStatGrid
        tiles={[
          {
            id: "active",
            title: t("চলমান ডেলিভারি", "Active Deliveries"),
            value: stats.activeDeliveriesCount,
            change: `${transit.length} ${t("রাস্তায়", "on road")}`,
            trend: "neutral",
            subtitle: t("অ্যাসাইনড ও ট্রানজিটে", "Assigned & in transit"),
            icon: Truck,
            colorScheme: "amber",
            onClick: () => onNavigate("deliveries"),
          },
          {
            id: "on-time",
            title: t("সময়ানুবর্তিতার হার", "On-Time Rate"),
            value: `${stats.onTimeRatePercent}%`,
            change: stats.onTimeRatePercent >= 90 ? t("চমৎকার", "Excellent") : t("মোটামুটি", "Fair"),
            trend: stats.onTimeRatePercent >= 90 ? "up" : "neutral",
            subtitle: t("লক্ষ্য: ৯৫% বা বেশি", "Target: 95% or higher"),
            icon: Gauge,
            colorScheme: "emerald",
            onClick: () => onNavigate("delivery_history"),
          },
          {
            id: "week",
            title: t("এই সপ্তাহে", "Deliveries This Week"),
            value: stats.deliveriesThisWeek,
            change: t("সম্পন্ন", "Completed"),
            trend: "up",
            subtitle: t("সোমবার থেকে আজ পর্যন্ত", "Monday through today"),
            icon: PackageCheck,
            colorScheme: "indigo",
            onClick: () => onNavigate("delivery_history"),
          },
          {
            id: "earnings",
            title: t("মোট আয় (BDT)", "Total Earnings (BDT)"),
            value: fmtBdt(stats.totalEarningsBdt),
            change: `${paidEarnings.length} ${t("প্রদত্ত", "paid")}`,
            trend: "up",
            subtitle: t(
              `${fmtBdt(pendingPayout)} বকেয়া আছে`,
              `${fmtBdt(pendingPayout)} still pending`
            ),
            icon: Coins,
            colorScheme: "blue",
            onClick: () => onNavigate("logistics_earnings"),
          },
        ]}
      />

      {/* Service grid */}
      <ServiceGrid
        label={t("পরিবহণ সেবা (আইকনে ক্লিক করে তথ্য দেখুন)", "Logistics Services (Click Icon for Details)")}
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
          {selected.id === "deliveries" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("মোট চলমান", "Total Active")}
                  value={active.length}
                />
                <ModalStat
                  label={t("রাস্তায়", "On the Road")}
                  value={transit.length}
                  valueClassName="text-blue-700 dark:text-blue-400"
                />
              </div>
              {active.length > 0 ? (
                <div className="space-y-2">
                  {[...transit, ...assigned].slice(0, 4).map((d) => (
                    <ModalRow
                      key={d.id}
                      title={`${d.consignmentCode} · ${d.cargoDescription}`}
                      subtitle={`${d.pickupAddress} → ${d.deliveryAddress} · ETA ${fmtDate(d.estimatedDelivery)}`}
                      chip={
                        <ModalChip className={deliveryChip(d.status)}>
                          {d.status.replace("_", " ")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "এই মুহূর্তে কোনো চলমান ডেলিভারি নেই।",
                    "No active deliveries right now."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "history" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সম্পন্ন", "Completed")}
                  value={history.length}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("চলমান", "Still Active")}
                  value={active.length}
                />
              </div>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 4).map((d) => (
                    <ModalRow
                      key={d.id}
                      title={`${d.consignmentCode} · ${d.buyerName}`}
                      subtitle={`${fmtDate(d.actualDelivery ?? d.estimatedDelivery)} · ${d.cargoWeightKg} kg`}
                      chip={
                        <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("ডেলিভার্ড", "Delivered")}
                          </span>
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t("এখনো কোনো ডেলিভারি সম্পন্ন হয়নি।", "No deliveries completed yet.")}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "fleet" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("মোট গাড়ি", "Total Vehicles")}
                  value={fleet.length}
                />
                <ModalStat
                  label={t("খালি আছে", "Available")}
                  value={availableVehicles.length}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
              </div>
              {fleet.length > 0 ? (
                <div className="space-y-2">
                  {fleet.slice(0, 4).map((v) => (
                    <ModalRow
                      key={v.id}
                      title={`${v.vehicleNumber} · ${v.type}`}
                      subtitle={`${v.currentDriverName} · ${v.capacityKg.toLocaleString()} kg`}
                      chip={
                        <ModalChip className={fleetChip(v.currentStatus)}>
                          {v.currentStatus === "on_route"
                            ? t("রাস্তায়", "On Route")
                            : v.currentStatus === "available"
                              ? t("খালি", "Available")
                              : v.currentStatus === "maintenance"
                                ? t("সার্ভিসে", "Service")
                                : t("অলস", "Idle")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>{t("কোনো গাড়ি নেই।", "No vehicles registered.")}</ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "earnings" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("প্রাপ্ত মোট", "Total Received")}
                  value={fmtBdt(stats.totalEarningsBdt)}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("বকেয়া", "Pending Payout")}
                  value={fmtBdt(pendingPayout)}
                  valueClassName="text-amber-700 dark:text-amber-400"
                />
              </div>
              {earnings.length > 0 ? (
                <div className="space-y-2">
                  {earnings.slice(0, 4).map((e) => (
                    <ModalRow
                      key={e.id}
                      title={`${e.consignmentCode} · ${fmtBdt(e.feeAmountBdt)}`}
                      subtitle={`${fmtDate(e.deliveryDate)} · ${e.distanceKm} km`}
                      chip={
                        <ModalChip
                          className={
                            e.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                          }
                        >
                          {e.paymentStatus === "paid"
                            ? t("প্রদত্ত", "Paid")
                            : t("বকেয়া", "Pending")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>{t("কোনো আয়ের রেকর্ড নেই।", "No earnings recorded yet.")}</ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "notifications" && (
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      n.isRead
                        ? "bg-slate-50 dark:bg-[#111111]/60 border-slate-200 dark:border-[#222222]"
                        : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                    }`}
                  >
                    <span
                      className={`font-bold block ${
                        n.isRead
                          ? "text-slate-800 dark:text-[#e0e0e0]"
                          : "text-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {n.title}
                    </span>
                    <span
                      className={`text-[11px] ${
                        n.isRead
                          ? "text-slate-500 dark:text-[#a0a0a0]"
                          : "text-blue-800 dark:text-blue-200"
                      }`}
                    >
                      {n.message}
                    </span>
                  </div>
                ))
              ) : (
                <ModalEmpty>{t("কোনো নতুন বিজ্ঞপ্তি নেই।", "No new notifications.")}</ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "performance" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সময়ানুবর্তিতা", "Punctuality")}
                  value={`${stats.onTimeRatePercent}%`}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("এই সপ্তাহে", "This Week")}
                  value={stats.deliveriesThisWeek}
                />
              </div>
              <ModalRow
                title={t("সময়মতো ডেলিভারি", "On-time deliveries")}
                subtitle={t(
                  "বাকিগুলো বিলম্ব বা বাতিল হয়েছে",
                  "The remainder were delayed or failed"
                )}
                chip={
                  <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {stats.onTimeRatePercent}%
                  </ModalChip>
                }
              />
              {active.some((d) => d.status === "failed") && (
                <ModalRow
                  title={t("ব্যর্থ ডেলিভারি", "Failed Deliveries")}
                  subtitle={t(
                    "পুনঃনির্ধারণ প্রয়োজন হতে পারে",
                    "May need re-scheduling"
                  )}
                  chip={
                    <ModalChip className="bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {t("দ্রুত দেখুন", "Review")}
                      </span>
                    </ModalChip>
                  }
                />
              )}
            </div>
          )}
        </ServiceInfoModal>
      )}
    </div>
  );
};
