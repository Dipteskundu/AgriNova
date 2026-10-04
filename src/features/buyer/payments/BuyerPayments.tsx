"use client";

import React, { useEffect, useState } from "react";
import { Icon, AlertTriangle, CreditCard, type IconName } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getBuyerPayments,
  type BuyerPayment,
} from "@/lib/marketplaceApi";

/** The record-level status union, inlined on `BuyerPayment`. */
type PaymentRecordStatus = BuyerPayment["status"];

const STATUS_LABEL: Record<PaymentRecordStatus, { label: string; variant: BadgeVariant }> = {
  completed: { label: "Completed", variant: "success" },
  pending: { label: "In Escrow", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "neutral" },
};

/** Fallbacks are only icons that actually exist in `components/icons.tsx`. */
const METHOD_ICON: Record<string, IconName> = {
  bKash: "Phone",
  Nagad: "Phone",
  Rocket: "Phone",
  Card: "CreditCard",
  "Bank Transfer": "Landmark",
};

/** ৳ with thousands separators — `toLocaleString` keeps ৳0.50-ish fractions sane. */
const money = (n: number) => `৳${n.toLocaleString()}`;

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};

/**
 * Buyer payment history — `GET /api/payments`.
 *
 * The endpoint is owner-scoped AND pinned to `direction: "purchase"`, so this
 * can never surface the outbound payout ledger (farmers, logistics vendors).
 * Anything listed here is money this account sent, held in escrow until the
 * order settles.
 */
export function BuyerPayments() {
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<BuyerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    getBuyerPayments().then((res) => {
      if (res.success) setPayments(res.data);
      else setError(res.message || "Could not load payments.");
      setLoading(false);
    });
  }, [user, router]);

  const completed = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + p.amountBdt, 0);
  const inEscrow = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amountBdt, 0);
  const refunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((s, p) => s + p.amountBdt, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">Payments</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Funds stay in escrow until delivery is confirmed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
        {[
          { label: "Settled", value: completed, cls: "text-emerald-600 dark:text-emerald-400" },
          { label: "Held in escrow", value: inEscrow, cls: "text-amber-600 dark:text-amber-400" },
          { label: "Refunded", value: refunded, cls: "text-slate-500 dark:text-[#a0a0a0]" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#0a0a0a]"
          >
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`mt-1 text-lg font-black ${s.cls}`}>{money(s.value)}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#1a1a1a]"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Could not load payments" description={error} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Payments appear here as soon as you place an order."
          action={
            <a href="/products" className="text-sm font-semibold text-blue-600 hover:underline">
              Browse Produce →
            </a>
          }
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const meta = STATUS_LABEL[p.status] ?? STATUS_LABEL.pending;
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#222] dark:bg-[#0a0a0a]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-[#1a1a1a] dark:text-[#a0a0a0]">
                  <Icon name={METHOD_ICON[p.method] ?? "CreditCard"} size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
                        {p.produceName || "Order payment"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {p.transactionRef}
                        {p.orderCode ? ` · ${p.orderCode}` : ""} · {p.method}
                      </p>
                    </div>
                    <Badge variant={meta.variant} size="sm">
                      {meta.label}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">{shortDate(p.paidAt)}</span>
                    <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                      {money(p.amountBdt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
