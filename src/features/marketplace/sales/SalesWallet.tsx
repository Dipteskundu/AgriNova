"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, DollarSign, Plus, Store } from "@/components/icons";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { tr } from "@/lib/localize";
import { getSalesOrders, type BuyerOrder } from "@/lib/marketplaceApi";
import {
  getWallet,
  requestWithdrawal,
  type WalletEntryView,
  type WalletSummary,
} from "@/lib/walletApi";

/**
 * Escrow vocabulary, shared with the buyer's order card so a badge means the
 * same thing on both sides of the transaction.
 */
const ESCROW_BADGE: Record<BuyerOrder["escrowStatus"], BadgeVariant> = {
  "Held in Escrow": "warning",
  "Released to Farmer": "success",
  Refunded: "neutral",
  Disputed: "danger",
};

/**
 * Ledger status. `Available` is a credit that has landed and can be withdrawn;
 * `Completed` is a withdrawal that has actually left, so it reads neutral
 * rather than green — the money is gone from the wallet, not a win.
 */
const LEDGER_BADGE: Record<WalletEntryView["status"], BadgeVariant> = {
  Available: "success",
  "Pending Approval": "warning",
  Completed: "neutral",
  Rejected: "danger",
};

const CHANNELS = ["bKash", "Nagad", "Rocket", "Bank (BEFTN)"] as const;

const money = (n: number) => `৳${(Number(n) || 0).toLocaleString()}`;

/**
 * Sales & Wallet — `/dashboard/sales`.
 *
 * Two halves of one question: *what did I sell* (the orders, from
 * `GET /orders/sales`) and *what is that worth to me right now* (the ledger,
 * from `GET /wallet`). They are fetched together but rendered independently —
 * a wallet outage should not hide the sales list, and vice versa.
 *
 * A seller cannot open `/dashboard/orders/:id` (order documents are scoped to
 * the buyer who placed them), so every figure a seller needs is shown here
 * rather than behind a link.
 */
export function SalesWallet() {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [walletError, setWalletError] = useState("");
  const [walletLoading, setWalletLoading] = useState(true);

  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState<string>(CHANNELS[0]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  /**
   * One pass for both halves, nested inside the effect the way the farmer
   * dashboard already does it: a component-scope callback that writes state
   * trips `react-hooks/set-state-in-effect`, and splitting the fetches into
   * two callbacks buys nothing since they always travel together.
   *
   * `tr()` reads the app language at call time, so the failure fallbacks stay
   * translated without making `language` a dependency — which would refetch
   * (and flash the skeleton) on every language switch.
   */
  const [loadToken, setLoadToken] = useState(0);

  useEffect(() => {
    async function load() {
      setWalletLoading(true);
      setOrdersLoading(true);
      setWalletError("");
      setOrdersError("");

      const [walletRes, ordersRes] = await Promise.all([getWallet(), getSalesOrders()]);

      if (walletRes.success) setWallet(walletRes.data);
      else setWalletError(walletRes.message || tr('Could not load your wallet.'));
      if (ordersRes.success) setOrders(ordersRes.data);
      else setOrdersError(ordersRes.message || tr('Could not load your sales.'));

      setWalletLoading(false);
      setOrdersLoading(false);
    }
    load();
  }, [loadToken]);

  /** Either section's "try again" re-runs the shared pass. */
  const retry = () => setLoadToken((n) => n + 1);

  const available = wallet?.available ?? 0;

  const closeForm = () => {
    setFormOpen(false);
    setFormError("");
    setAmount("");
  };

  const handleWithdraw = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setFormError(t("শূন্যের চেয়ে বড় একটি পরিমাণ লিখুন", "Enter an amount greater than zero."));
      return;
    }
    if (value > available) {
      setFormError(
        t("পরিমাণ আপনার উপলব্ধ ব্যালেন্সের চেয়ে বেশি", "Amount exceeds your available balance.")
      );
      return;
    }

    setSaving(true);
    setFormError("");
    const res = await requestWithdrawal(value, channel);
    setSaving(false);

    if (res.success) {
      setWallet(res.data);
      closeForm();
      showToast(
        "success",
        t("অনুরোধ পাঠানো হয়েছে", "Withdrawal requested"),
        t("অ্যাডমিনের অনুমোদনের অপেক্ষায়", "Waiting for admin approval")
      );
    } else {
      setFormError(res.message || t("অনুরোধ পাঠানো যায়নি", "Could not send the request."));
    }
  };

  // ── loading ────────────────────────────────────────────────────
  if (walletLoading || ordersLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] p-5">
          <div className="h-6 w-40 bg-slate-200 dark:bg-[#1a1a1a] rounded animate-pulse mb-4" />
          <div className="h-16 w-full bg-slate-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">
            {t("বিক্রয় ও মানি ব্যাগ", "Sales & Wallet")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-1">
            {t(
              "আপনার বাজার বিক্রয়, এসক্রোর অবস্থা ও উত্তোলনযোগ্য ব্যালেন্স।",
              "Your marketplace sales, escrow status and withdrawable balance."
            )}
          </p>
        </div>
        <Link href="/dashboard/listings">
          <Button variant="primary" icon={Plus}>
            {t("নতুন তালিকা", "New Listing")}
          </Button>
        </Link>
      </div>

      {/* ── Wallet ───────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] shadow-xs overflow-hidden">
        <div className="p-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-[#1c1c1c]">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {t("উপলব্ধ ব্যালেন্স", "Available balance")}
            </span>
            <p className="text-3xl font-black text-slate-900 dark:text-[#f0f0f0] mt-1">
              {money(available)}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs">
              <span className="text-slate-500 dark:text-[#a0a0a0]">
                {t("অপেক্ষমাণ", "Pending")}{" "}
                <strong className="text-amber-600 dark:text-amber-400">
                  {money(wallet?.pending ?? 0)}
                </strong>
              </span>
              <span className="text-slate-500 dark:text-[#a0a0a0]">
                {t("মোট প্রাপ্ত", "Released to you")}{" "}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {money(wallet?.totalCredits ?? 0)}
                </strong>
              </span>
            </div>
          </div>

          {available > 0 ? (
            <Button
              variant="primary"
              icon={ArrowUpRight}
              onClick={() => (formOpen ? closeForm() : setFormOpen(true))}
            >
              {formOpen ? t("বাতিল", "Cancel") : t("টাকা তোলার অনুরোধ", "Request Withdrawal")}
            </Button>
          ) : (
            <span className="text-[11px] text-slate-400 max-w-[16rem] text-right">
              {t(
                "এসক্রো ছাড়ার পর টাকা এখানে জমা হবে।",
                "Money appears here once an order's escrow releases."
              )}
            </span>
          )}
        </div>

        {walletError && (
          <div className="px-5 py-3 text-xs text-rose-600 border-b border-slate-100 dark:border-[#1c1c1c] flex items-center justify-between gap-3">
            <span>{walletError}</span>
            <Button size="sm" variant="outline" onClick={retry}>
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={handleWithdraw}
            className="px-5 py-4 border-b border-slate-100 dark:border-[#1c1c1c] bg-slate-50 dark:bg-[#111111]/60 space-y-3"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="withdraw-amount"
                  className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#a0a0a0] mb-1"
                >
                  {t("পরিমাণ (BDT)", "Amount (BDT)")}
                </label>
                <input
                  id="withdraw-amount"
                  type="number"
                  min={1}
                  step={1}
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-44 rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] px-3 py-2 text-sm text-slate-800 dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="withdraw-channel"
                  className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#a0a0a0] mb-1"
                >
                  {t("পেমেন্ট চ্যানেল", "Payment channel")}
                </label>
                <select
                  id="withdraw-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] px-3 py-2 text-sm text-slate-800 dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" loading={saving} disabled={saving}>
                {t("অনুরোধ পাঠান", "Send request")}
              </Button>
            </div>

            {formError && <p className="text-xs text-rose-600">{formError}</p>}
            <p className="text-[11px] text-slate-400">
              {t("সর্বোচ্চ", "Up to")} {money(available)}{" "}
              {t(
                "উত্তোলন করা যাবে। অনুরোধ অ্যাডমিন অনুমোদনের পর পরিশোধিত হয়।",
                "can be withdrawn. Requests are paid out once an admin approves them."
              )}
            </p>
          </form>
        )}

        {/* Ledger */}
        <div className="p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#a0a0a0] mb-3">
            {t("লেনদেনের ইতিহাস", "Transaction history")}
          </h2>

          {!wallet || wallet.entries.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title={t("এখনো কোনো লেনদেন নেই", "No transactions yet")}
              description={t(
                "কোনো অর্ডারের এসক্রো ছাড়ার পর এখানে ক্রেডিট দেখা যাবে।",
                "A credit appears here whenever an order's escrow is released."
              )}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#222222]">
              <table className="w-full text-left text-xs border-collapse min-w-[38rem]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60">
                    <th className="p-3 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("তারিখ", "Date")}
                    </th>
                    <th className="p-3 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("বিবরণ", "Detail")}
                    </th>
                    <th className="p-3 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("পরিমাণ", "Amount")}
                    </th>
                    <th className="p-3 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("অবস্থা", "Status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1c1c1c]">
                  {wallet.entries.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 transition-colors"
                    >
                      <td className="p-3 text-slate-500 dark:text-[#a0a0a0] whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="p-3">
                        <span className="text-slate-800 dark:text-[#e0e0e0] block">
                          {row.label}
                        </span>
                        {row.orderCode && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {row.orderCode}
                          </span>
                        )}
                        {row.approvedBy && (
                          <span className="text-[10px] text-slate-400 block">
                            {t("অনুমোদনকারী", "By")}: {row.approvedBy}
                          </span>
                        )}
                      </td>
                      <td
                        className={`p-3 font-mono font-bold whitespace-nowrap ${
                          row.kind === "credit"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-700 dark:text-[#e0e0e0]"
                        }`}
                      >
                        {row.kind === "credit" ? "+" : "−"}
                        {money(row.amountBdt)}
                      </td>
                      <td className="p-3">
                        <Badge variant={LEDGER_BADGE[row.status]}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Sales orders ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#a0a0a0]">
            {t("বিক্রয়ের তালিকা", "Sales orders")} ({orders.length})
          </h2>
        </div>

        {ordersError ? (
          <EmptyState
            title={t("বিক্রয় লোড করা যায়নি", "Could not load your sales")}
            description={ordersError}
            action={
              <Button variant="outline" size="sm" onClick={retry}>
                {t("আবার চেষ্টা করুন", "Try again")}
              </Button>
            }
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Store}
            title={t("এখনো কোনো বিক্রয় হয়নি", "No sales yet")}
            description={t(
              "অনুমোদিত তালিকায় কেউ অর্ডার করলে এখানে দেখা যাবে।",
              "Orders against your approved listings will appear here."
            )}
            action={
              <Link href="/dashboard/listings">
                <Button variant="outline" size="sm" icon={Store}>
                  {t("আমার তালিকা", "My Listings")}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[46rem]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60">
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("অর্ডার", "Order")}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("পণ্য", "Produce")}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("ক্রেতা", "Buyer")}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("পরিমাণ", "Quantity")}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("মূল্য", "Amount")}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("এসক্রো", "Escrow")}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {t("তারিখ", "Placed")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1c1c1c]">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-[#f0f0f0] whitespace-nowrap">
                        {order.orderCode}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 dark:text-[#e0e0e0] block">
                          {order.listing.cropName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.listing.qualityGrade}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-[#999999]">
                        {order.buyerName || "—"}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-[#999999] whitespace-nowrap">
                        {order.quantityKg.toLocaleString()} {order.unit}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {money(order.totalAmountBdt)}
                      </td>
                      <td className="p-4">
                        <Badge variant={ESCROW_BADGE[order.escrowStatus]}>
                          {order.escrowStatus}
                        </Badge>
                        {order.escrowStatus === "Held in Escrow" && order.escrowReleaseAt && (
                          <span className="block text-[10px] text-slate-400 mt-1">
                            {t("ছাড়বে", "Releases")} {order.escrowReleaseAt}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-[#a0a0a0] whitespace-nowrap">
                        {order.placedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
