"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getBuyerOrders, type BuyerOrder, type OrderStatus } from "@/lib/marketplaceApi";

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "info" | "warning" | "success" | "neutral" | "danger" }> = {
  placed:        { label: "Placed",         variant: "info" },
  confirmed:     { label: "Confirmed",      variant: "info" },
  quality_check: { label: "Quality Check",  variant: "warning" },
  shipped:       { label: "Shipped",        variant: "warning" },
  delivered:     { label: "Delivered",      variant: "success" },
  cancelled:     { label: "Cancelled",      variant: "danger" },
};

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
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    getBuyerOrders().then(res => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, [user, router]);

  const scope =
    view === "active" ? ACTIVE_STATUSES : view === "history" ? HISTORY_STATUSES : null;
  const visible = scope ? orders.filter(o => scope.includes(o.status)) : orders;

  const tabs: Array<OrderStatus | "all"> = scope
    ? ["all", ...scope]
    : ["all", ...ACTIVE_STATUSES, ...HISTORY_STATUSES];

  const filtered = filter === "all" ? visible : visible.filter(o => o.status === filter);

  const title = view === "history" ? "Order History" : "My Orders";
  const emptyCopy = view === "history"
    ? "No completed orders yet — finished orders will be collected here."
    : "You haven't placed any orders yet.";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{visible.length} of {orders.length} orders</p>
        </div>
        <Link href="/products" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <Icon name="Plus" size={13} /> New Order
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
            {s === "all" ? "All" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={emptyCopy}
          action={
            <Link href="/products" className="text-sm font-semibold text-blue-600 hover:underline">
              Browse Produce →
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex gap-4 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-4 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all group"
            >
              <img src={order.listing.imageUrl} alt={order.listing.cropName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">{order.listing.cropName}</p>
                    <p className="text-xs text-slate-400">{order.listing.variety} · {order.quantityKg} kg</p>
                  </div>
                  <Badge variant={STATUS_CONFIG[order.status].variant}>
                    {STATUS_CONFIG[order.status].label}
                  </Badge>
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
          ))}
        </div>
      )}
    </div>
  );
}
