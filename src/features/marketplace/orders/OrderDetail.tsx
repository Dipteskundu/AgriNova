"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Icon, ShieldCheck } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getOrderById,
  type BuyerOrder,
  type PaymentStatus,
} from "@/lib/marketplaceApi";
import { DisputeForm } from "./DisputeForm";
import {
  ESCROW_CONFIG,
  STATUS_CONFIG,
  canActOnOrder,
  useConfirmReceipt,
} from "./escrow";

/** Stored lowercase; said properly in both scripts rather than capitalised. */
const PAYMENT_LABEL: Record<PaymentStatus, { label: string; labelBn: string }> = {
  pending: { label: "Pending", labelBn: "বাকি আছে" },
  paid: { label: "Paid", labelBn: "পরিশোধিত" },
  refunded: { label: "Refunded", labelBn: "ফেরত দেওয়া হয়েছে" },
};

/**
 * Timeline steps are stored on the order in English, so the ones we recognise
 * are looked up here and anything the server grows later is passed through
 * verbatim — a stranger's label beats an empty cell.
 */
const STEP_LABEL: Record<string, { bn: string; en: string }> = {
  "Order placed": { bn: "অর্ডার দেওয়া হয়েছে", en: "Order placed" },
  "Quality check": { bn: "কোয়ালিটি চেক", en: "Quality check" },
  Shipped: { bn: "পাঠানো হয়েছে", en: "Shipped" },
  Delivered: { bn: "ডেলিভার হয়েছে", en: "Delivered" },
  Cancelled: { bn: "বাতিল করা হয়েছে", en: "Cancelled" },
  "Dispute opened": { bn: "বিরোধ খোলা হয়েছে", en: "Dispute opened" },
  "Payment released": { bn: "পেমেন্ট মুক্ত করা হয়েছে", en: "Payment released" },
  "Receipt confirmed": { bn: "রসিদ নিশ্চিত হয়েছে", en: "Receipt confirmed" },
};

function translateStep(label: string, t: (bn: string, en: string) => string) {
  const meta = STEP_LABEL[label];
  return meta ? t(meta.bn, meta.en) : label;
}

export function OrderDetail({ id }: { id: string }) {
  const { language } = useLanguage();
  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDispute, setShowDispute] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  useEffect(() => {
    getOrderById(id).then(res => {
      if (res.success) setOrder(res.data);
      setLoading(false);
    });
  }, [id]);

  const receipt = useConfirmReceipt(setOrder);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-[#1a1a1a] rounded w-1/3" />
        <div className="h-32 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl" />
        <div className="h-48 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">{t("অর্ডার পাওয়া যায়নি।", "Order not found.")}</p>
        <Link href="/dashboard/orders" className="mt-4 inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
          <Icon name="ArrowLeft" size={14} /> {t("অর্ডারে ফিরে যান", "Back to Orders")}
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];
  const escrow = ESCROW_CONFIG[order.escrowStatus] || ESCROW_CONFIG["Held in Escrow"];
  const canAct = canActOnOrder(order);
  const confirming = receipt.busyId === order.id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/dashboard/orders" className="hover:text-blue-600">{t("আমার অর্ডার", "My Orders")}</Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium font-mono">{order.orderCode}</span>
      </nav>

      {/* Header card */}
      <Card className="mb-4">
        <div className="flex gap-4">
          <img src={order.listing.imageUrl} alt={order.listing.cropName} className="w-20 h-20 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-bold text-slate-900 dark:text-[#f0f0f0]">{order.listing.cropName}</h1>
                <p className="text-xs text-slate-400">{order.listing.variety} · {order.listing.qualityGrade}</p>
              </div>
              <Badge variant={cfg.variant}>{t(cfg.labelBn, cfg.label)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
              <span className="text-slate-400">{t("অর্ডার কোড", "Order Code")}</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-[#e0e0e0]">{order.orderCode}</span>
              <span className="text-slate-400">{t("পরিমাণ", "Quantity")}</span>
              <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{order.quantityKg} kg</span>
              <span className="text-slate-400">{t("মোট", "Total")}</span>
              <span className="font-black text-blue-700 dark:text-blue-400">৳{order.totalAmountBdt.toLocaleString()}</span>
              <span className="text-slate-400">{t("পেমেন্ট", "Payment")}</span>
              <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-emerald-600" : order.paymentStatus === "refunded" ? "text-amber-600" : "text-slate-600 dark:text-[#a0a0a0]"}`}>
                {t(PAYMENT_LABEL[order.paymentStatus].labelBn, PAYMENT_LABEL[order.paymentStatus].label)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Escrow — where the money is, and the only actions a buyer can take */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-2">{t("এসক্রো", "Escrow")}</h3>
            <p className="text-lg font-black text-slate-900 dark:text-[#f0f0f0]">৳{order.totalAmountBdt.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-1 max-w-md">{t(escrow.copyBn, escrow.copy)}</p>
            {order.escrowStatus === "Held in Escrow" && (
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                <Icon name="Clock" size={12} />
                {order.escrowReleaseAt
                  ? t(
                      `আপনি নিশ্চিত না করলে ${order.escrowReleaseAt} তারিখে স্বয়ংক্রিয়ভাবে মুক্ত হবে।`,
                      `Releases automatically on ${order.escrowReleaseAt} if you do not confirm.`
                    )
                  : t("ডেলিভারির ৭ দিন পর স্বয়ংক্রিয়ভাবে মুক্ত হয়।", "Auto-releases 7 days after delivery.")}
              </p>
            )}
          </div>
          <Badge variant={escrow.variant}>{t(escrow.labelBn, escrow.label)}</Badge>
        </div>

        {canAct && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#2a2a2a] flex flex-wrap gap-2">
            <Button
              variant="primary"
              icon={ShieldCheck}
              loading={confirming}
              disabled={receipt.busyId !== null}
              onClick={() => receipt.confirm(order.id)}
            >
              {t("রসিদ নিশ্চিত করে পেমেন্ট মুক্ত করুন", "Confirm receipt & release payment")}
            </Button>
            <Button
              variant="outline"
              icon={AlertTriangle}
              disabled={receipt.busyId !== null}
              onClick={() => setShowDispute((open) => !open)}
            >
              {t("সমস্যার খবর দিন", "Report a problem")}
            </Button>
          </div>
        )}

        {canAct && showDispute && (
          <DisputeForm
            orderId={order.id}
            onOpened={setOrder}
            onCancel={() => setShowDispute(false)}
            disabled={receipt.busyId !== null}
            className="mt-4 pt-4 border-t border-slate-100 dark:border-[#2a2a2a] space-y-3"
          />
        )}
      </Card>

      {/* Tracking */}
      <Card className="mb-4">
        <h2 className="font-semibold text-slate-900 dark:text-[#f0f0f0] mb-4 text-sm">
          {t("অর্ডার ট্র্যাকিং", "Order Tracking")}
        </h2>
        <div className="relative">
          {order.trackingSteps.map((step, idx) => (
            <div key={idx} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-[#2a2a2a] text-slate-400"}`}>
                  {step.done ? <Icon name="Check" size={12} /> : <span className="w-2 h-2 rounded-full bg-current" />}
                </div>
                {idx < order.trackingSteps.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${step.done ? "bg-blue-300 dark:bg-blue-800" : "bg-slate-200 dark:bg-[#2a2a2a]"}`} />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-semibold ${step.done ? "text-slate-900 dark:text-[#f0f0f0]" : "text-slate-400"}`}>
                  {translateStep(step.label, t)}
                </p>
                <p className="text-xs text-slate-400">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Farmer + Delivery info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-3">{t("কৃষক", "Farmer")}</h3>
          <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{order.farmerName}</p>
          <a href={`tel:${order.farmerPhone}`} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 hover:underline">
            <Icon name="Phone" size={12} /> {order.farmerPhone}
          </a>
        </Card>
        <Card>
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-3">{t("ডেলিভারি", "Delivery")}</h3>
          <p className="text-xs text-slate-700 dark:text-[#e0e0e0]">{order.deliveryAddress}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Icon name="Calendar" size={12} />
            {t("সম্ভাব্য", "Est.")} {order.estimatedDelivery}
          </p>
        </Card>
      </div>

      <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
        <Icon name="ArrowLeft" size={15} /> {t("অর্ডারে ফিরে যান", "Back to Orders")}
      </Link>
    </div>
  );
}
