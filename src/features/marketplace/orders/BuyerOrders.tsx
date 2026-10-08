"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, ShieldCheck } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { getLoginUrl } from "@/lib/api";
import { getBuyerOrders, type BuyerOrder, type OrderStatus } from "@/lib/marketplaceApi";
import { tr, trPhrase } from "@/lib/localize";
import { DisputeForm } from "./DisputeForm";
import {
  ESCROW_CONFIG,
  STATUS_CONFIG,
  canActOnOrder,
  useConfirmReceipt,
} from "./escrow";

/** Still moving through the pipeline. */
const ACTIVE_STATUSES: OrderStatus[] = ["placed", "confirmed", "quality_check", "shipped"];
/** Settled — either received or called off. */
const HISTORY_STATUSES: OrderStatus[] = ["delivered", "cancelled"];

interface BuyerOrdersProps {
  /**
   * "all"     — every order (the marketplace orders page)
   * "active"  — /dashboard/orders: in-flight orders only
   * "history" — /dashboard/order-history: delivered and cancelled
   *
   * The portal's nav lists Orders and Order History separately, so both must
   * draw from the same fetch rather than pretending they are different data.
   */
  view?: "all" | "active" | "history";
}

export function BuyerOrders({ view = "all" }: BuyerOrdersProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  /** Which row has its dispute form open — one at a time, not one per row. */
  const [reportingId, setReportingId] = useState<string | null>(null);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  useEffect(() => {
    if (!user) {
      router.push(getLoginUrl("/dashboard/orders"));
      return;
    }
    getBuyerOrders().then(res => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, [user, router]);

  /**
   * Confirming receipt happens here, in the list, rather than only on the
   * detail page: the button locks every other action while the call is in
   * flight (one row at a time, but a list-wide guard against a double submit),
   * and the row simply re-renders from the order the API returns — if the
   * escrow is no longer held the action bar disappears on its own.
   */
  const receipt = useConfirmReceipt((fresh) =>
    setOrders(prev => prev.map(o => (o.id === fresh.id ? fresh : o)))
  );

  const scope =
    view === "active" ? ACTIVE_STATUSES : view === "history" ? HISTORY_STATUSES : null;
  const visible = scope ? orders.filter(o => scope.includes(o.status)) : orders;

  const tabs: Array<OrderStatus | "all"> = scope
    ? ["all", ...scope]
    : ["all", ...ACTIVE_STATUSES, ...HISTORY_STATUSES];

  const filtered = filter === "all" ? visible : visible.filter(o => o.status === filter);

  const title = view === "history" ? t("অর্ডারের ইতিহাস", "Order History") : t("আমার অর্ডার", "My Orders");
  const emptyCopy = view === "history"
    ? t("এখনো কোনো সম্পন্ন অর্ডার নেই — শেষ হওয়া অর্ডার এখানে জমা হবে।", "No completed orders yet — finished orders will be collected here.")
    : t("আপনি এখনো কোনো অর্ডার দেননি।", "You haven't placed any orders yet.");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t(`${visible.length} / ${orders.length} অর্ডার`, `${visible.length} of ${orders.length} orders`)}
          </p>
        </div>
        <Link href="/products" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <Icon name="Plus" size={13} /> {t("নতুন অর্ডার", "New Order")}
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 [&::-webkit-scrollbar]:hidden">
        {tabs.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            }`}
          >
            {s === "all" ? t("সব", "All") : t(STATUS_CONFIG[s].labelBn, STATUS_CONFIG[s].label)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("কোনো অর্ডার পাওয়া যায়নি", "No orders found")}
          description={emptyCopy}
          action={
            <Link href="/products" className="text-sm font-semibold text-blue-600 hover:underline">
              {t("পণ্য ব্রাউজ করুন →", "Browse Produce →")}
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const escrow = ESCROW_CONFIG[order.escrowStatus] || ESCROW_CONFIG["Held in Escrow"];
            const canAct = canActOnOrder(order);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-4 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all group"
              >
                {/* The card itself stays one big link; the actions below sit
                    outside it so a button never has to nest inside an <a>. */}
                <Link href={`/dashboard/orders/${order.id}`} className="flex gap-4">
                  <img src={order.listing.imageUrl} alt={trPhrase(order.listing.cropName)} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">{trPhrase(order.listing.cropName)}</p>
                        <p className="text-xs text-slate-400">{trPhrase(order.listing.variety)} · {order.quantityKg} {t("কেজি", "kg")}</p>
                      </div>
                      {/* Two questions, two badges: where the goods are, and
                          where the money is. They move independently. */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant={cfg.variant}>{t(cfg.labelBn, cfg.label)}</Badge>
                        <Badge variant={escrow.variant} size="sm">{t(escrow.labelBn, escrow.label)}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="font-mono">{order.orderCode}</span>
                        <span>·</span>
                        <span>{new Date(order.placedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                        ৳{order.totalAmountBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-slate-300 dark:text-[#444] self-center shrink-0 group-hover:text-blue-500 transition-colors" />
                </Link>

                {canAct && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1a1a1a] flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mr-auto">
                      <Icon name="Clock" size={12} />
                      {t(
                        `৳${order.totalAmountBdt.toLocaleString()} এসক্রোতে জমা আছে`,
                        `৳${order.totalAmountBdt.toLocaleString()} is held in escrow`
                      )}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ShieldCheck}
                      loading={receipt.busyId === order.id}
                      disabled={receipt.busyId !== null}
                      onClick={() => receipt.confirm(order.id)}
                    >
                      {t("রসিদ নিশ্চিত করে পেমেন্ট মুক্ত করুন", "Confirm receipt & release payment")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={receipt.busyId !== null}
                      onClick={() => setReportingId(prev => (prev === order.id ? null : order.id))}
                    >
                      {t("সমস্যার খবর দিন", "Report a problem")}
                    </Button>
                  </div>
                )}

                {canAct && reportingId === order.id && (
                  <DisputeForm
                    orderId={order.id}
                    onOpened={(fresh) => {
                      setOrders(prev => prev.map(o => (o.id === fresh.id ? fresh : o)));
                      setReportingId(null);
                    }}
                    onCancel={() => setReportingId(null)}
                    disabled={receipt.busyId !== null}
                    className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1a1a1a]"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
