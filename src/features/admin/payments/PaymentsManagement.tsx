import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Download,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getPaymentRecordsAdmin, approvePaymentPayoutAdmin } from '@/lib/adminApi';
import { getWithdrawalRequestsAdmin, settleWithdrawalAdmin, WalletEntryView } from '@/lib/walletApi';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaymentRecordAdminView } from '@/types';

export const PaymentsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecordAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Wallet withdrawals live in their own table below, on purpose: a payment
  // is what the buyer spent and a wallet debit is what a seller wants paid
  // out. Approving the second moves a balance; approving the first only
  // stamps a payout record, so the two buttons must never be the same one.
  const [withdrawals, setWithdrawals] = useState<WalletEntryView[]>([]);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const handleSettle = async (id: string, action: 'approve' | 'reject') => {
    try {
      setSettlingId(id);
      const res = await settleWithdrawalAdmin(id, action);
      if (res.success && res.data) {
        const settled = res.data;
        setWithdrawals((prev) => prev.map((w) => (w.id === id ? settled : w)));
        showToast(
          'success',
          action === 'approve'
            ? tr('Withdrawal approved and debited from the seller balance')
            : tr('Withdrawal rejected and returned to the seller balance')
        );
      } else {
        showToast('error', res.message || tr('Failed to settle withdrawal request'));
      }
    } catch {
      showToast('error', tr('Failed to settle withdrawal request'));
    } finally {
      setSettlingId(null);
    }
  };

  // Queue order: anything still needing a decision first, then newest.
  const queued = [...withdrawals].sort((a, b) => {
    const aPending = a.status === 'Pending Approval' ? 0 : 1;
    const bPending = b.status === 'Pending Approval' ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return b.date.localeCompare(a.date);
  });

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      const res = await approvePaymentPayoutAdmin(id, 'Tariqul Islam Chowdhury (Admin HQ)');
      if (res.success) {
        setPayments((prev) => prev.map((p) => (p.id === id ? res.data : p)));
        showToast('success', `Payment ${res.data.transactionRef} approved and disbursed`);
      }
    } catch {
      showToast('error', tr('Failed to authorize payout disbursement'));
    } finally {
      setApprovingId(null);
    }
  };

  // Boot is nested in the effect rather than a component-scope callback: the
  // hooks lint treats an outer function that writes state as a synchronous
  // state write from the effect (`react-hooks/set-state-in-effect`).
  // `loading` starts true, so the skeleton needs no `setLoading(true)` here.
  useEffect(() => {
    async function load() {
      try {
        const res = await getPaymentRecordsAdmin();
        if (res.success) setPayments(res.data);
      } catch {
        showToast('error', tr('Failed to load platform payment disbursement records'));
      } finally {
        setLoading(false);
      }

      const withdrawalsRes = await getWithdrawalRequestsAdmin();
      if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentChannel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.payoutStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDisbursed = payments
    .filter((p) => p.payoutStatus === 'Completed')
    .reduce((acc, p) => acc + p.amountBdt, 0);

  const pendingDisbursement = payments
    .filter((p) => p.payoutStatus === 'Pending Approval')
    .reduce((acc, p) => acc + p.amountBdt, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222] p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('National Settlement, Escrow & Payment Gateway')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Audit digital payouts to farmers, freight carriers, and testing labs via BEFTN, bKash, and Nagad channels.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => showToast('info', tr('Payment settlement batch exported to CSV'))}
          >{tr('Export Ledger')}</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Settled Volume')}</span>
          <span className="text-lg font-black text-emerald-700">৳{(totalDisbursed / 100000).toFixed(2)}{tr('Lakh')}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('All bank & mobile channels')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Awaiting Authorization')}</span>
          <span className="text-lg font-black text-amber-600">৳{pendingDisbursement.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Pending Admin Dual-Sign')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Direct Channels')}</span>
          <span className="text-lg font-black text-slate-900 dark:text-[#f0f0f0]">{tr('4 Active')}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('bKash, BEFTN, Nagad, Rocket')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Failed Reversals')}</span>
          <span className="text-lg font-black text-slate-900 dark:text-[#f0f0f0]">0</span>
          <span className="text-[10px] text-emerald-600 block">{tr('100% gateway uptime')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search txn ref, recipient, channel or purpose...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-900 dark:text-[#f0f0f0]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0]"
        >
          <option value="All">{tr('All Payout Statuses')}</option>
          <option value="Completed">{tr('Completed')}</option>
          <option value="Pending Approval">{tr('Pending Approval')}</option>
          <option value="Processing">{tr('Processing')}</option>
          <option value="Failed">{tr('Failed')}</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60/80">
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Transaction Ref')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Recipient & Role')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Purpose')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Disbursement Amount')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Payment Channel')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Status')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Audit Timestamp')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase text-right">{tr('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 dark:bg-[#111111]/60/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-[#f0f0f0]">{pay.transactionRef}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800 dark:text-[#e0e0e0] block">{pay.recipientName}</span>
                    <Badge variant="neutral">{pay.recipientRole}</Badge>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-[#999999] font-medium">{pay.purpose}</td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    ৳{pay.amountBdt.toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-[#999999]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1a1a] text-[11px] font-mono">
                      {pay.paymentChannel}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        pay.payoutStatus === 'Completed'
                          ? 'success'
                          : pay.payoutStatus === 'Pending Approval'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {pay.payoutStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-[#a0a0a0] text-[11px]">
                    <div>{pay.initiatedAt}</div>
                    {pay.approvedBy && (
                      <div className="text-[10px] text-slate-400 font-mono">{tr('By:')}{pay.approvedBy}</div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {pay.payoutStatus === 'Pending Approval' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Check}
                        disabled={approvingId === pay.id}
                        onClick={() => handleApprove(pay.id)}
                      >
                        {approvingId === pay.id ? 'Authorizing...' : 'Authorize'}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold">{tr('Settled ✓')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Wallet Withdrawal Requests ─────────────────────────────── */}
      <div>
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
              {tr('Wallet Withdrawal Requests')}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] mt-0.5">
              {tr(
                'Escrow a seller is asking to cash out. Approving moves the money out of their balance; rejecting returns it.'
              )}
            </p>
          </div>
          {withdrawals.some((w) => w.status === 'Pending Approval') && (
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-300">
              {
                withdrawals.filter((w) => w.status === 'Pending Approval')
                  .length
              }{' '}
              {tr('awaiting decision')}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs overflow-hidden">
          {queued.length === 0 ? (
            <EmptyState
              icon={ArrowUpRight}
              title={tr('No withdrawal requests')}
              description={tr(
                'A seller requests a withdrawal from /dashboard/sales once escrow has credited their wallet.'
              )}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[44rem]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60/80">
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {tr('Seller')}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {tr('Channel')}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {tr('Requested')}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {tr('Requested On')}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">
                      {tr('Status')}
                    </th>
                    <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase text-right">
                      {tr('Action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queued.map((wd) => (
                    <tr
                      key={wd.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 dark:text-[#e0e0e0] block">
                          {wd.ownerName || tr('Unknown seller')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {wd.ownerEmail}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1a1a] text-[11px] font-mono">
                          {wd.label.split('—').pop()?.trim() || tr('bKash')}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-700 text-sm whitespace-nowrap">
                        ৳{wd.amountBdt.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-[#a0a0a0] text-[11px] whitespace-nowrap">
                        {wd.date}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            wd.status === 'Pending Approval'
                              ? 'warning'
                              : wd.status === 'Completed'
                              ? 'neutral'
                              : 'danger'
                          }
                        >
                          {wd.status.toUpperCase()}
                        </Badge>
                        {wd.approvedBy && (
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {tr('By:')}
                            {wd.approvedBy}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {wd.status === 'Pending Approval' ? (
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Check}
                              disabled={settlingId === wd.id}
                              onClick={() => handleSettle(wd.id, 'approve')}
                            >
                              {settlingId === wd.id
                                ? tr('Settling...')
                                : tr('Approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={AlertCircle}
                              disabled={settlingId === wd.id}
                              onClick={() => handleSettle(wd.id, 'reject')}
                            >
                              {tr('Reject')}
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={`text-[11px] font-semibold ${
                              wd.status === 'Completed'
                                ? 'text-slate-500 dark:text-[#a0a0a0]'
                                : 'text-rose-600'
                            }`}
                          >
                            {wd.status === 'Completed'
                              ? tr('Paid out ✓')
                              : tr('Returned to balance')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
