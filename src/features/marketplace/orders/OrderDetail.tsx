"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getOrderById, type BuyerOrder, type OrderStatus } from "@/lib/marketplaceApi";

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "info" | "warning" | "success" | "neutral" | "danger" }> = {
  placed:        { label: "Placed",         variant: "info" },
  confirmed:     { label: "Confirmed",      variant: "info" },
  quality_check: { label: "Quality Check",  variant: "warning" },
  shipped:       { label: "Shipped",        variant: "warning" },
  delivered:     { label: "Delivered",      variant: "success" },
  cancelled:     { label: "Cancelled",      variant: "danger" },
};

export function OrderDetail({ id }: { id: string }) {
  const { showToast } = useToast();
  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id).then(res => {
      if (res.success) setOrder(res.data);
      setLoading(false);
    });
  }, [id]);

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
        <p className="text-slate-500">Order not found.</p>
        <Link href="/dashboard/orders" className="mt-4 inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
          <Icon name="ArrowLeft" size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/dashboard/orders" className="hover:text-blue-600">My Orders</Link>
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
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
              <span className="text-slate-400">Order Code</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-[#e0e0e0]">{order.orderCode}</span>
              <span className="text-slate-400">Quantity</span>
              <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{order.quantityKg} kg</span>
              <span className="text-slate-400">Total</span>
              <span className="font-black text-blue-700 dark:text-blue-400">৳{order.totalAmountBdt.toLocaleString()}</span>
              <span className="text-slate-400">Payment</span>
              <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-emerald-600" : order.paymentStatus === "refunded" ? "text-amber-600" : "text-slate-600 dark:text-[#a0a0a0]"}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tracking timeline */}
      <Card className="mb-4">
        <h2 className="font-semibold text-slate-900 dark:text-[#f0f0f0] mb-4 text-sm">Order Tracking</h2>
        <div className="relative">
          {order.trackingSteps.map((step, idx) => (
            <div key={idx} className="flex gap-3 pb-4 last:pb-0">
              {/* Line */}
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
                  {step.label}
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
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-3">Farmer</h3>
          <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{order.farmerName}</p>
          <a href={`tel:${order.farmerPhone}`} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 hover:underline">
            <Icon name="Phone" size={12} /> {order.farmerPhone}
          </a>
        </Card>
        <Card>
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#888] uppercase tracking-wide mb-3">Delivery</h3>
          <p className="text-xs text-slate-700 dark:text-[#e0e0e0]">{order.deliveryAddress}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Icon name="Calendar" size={12} />
            Est. {order.estimatedDelivery}
          </p>
        </Card>
      </div>

      <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
        <Icon name="ArrowLeft" size={15} /> Back to Orders
      </Link>
    </div>
  );
}
