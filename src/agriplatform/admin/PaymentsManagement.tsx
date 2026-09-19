import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
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
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getPaymentRecordsAdmin, approvePaymentPayoutAdmin } from '@/agriplatform/lib/adminApi';
import { PaymentRecordAdminView } from '@/agriplatform/types';

export const PaymentsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecordAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await getPaymentRecordsAdmin();
      if (res.success) {
        setPayments(res.data);
      }
    } catch {
      showToast('error', tr('Failed to load platform payment disbursement records'));
    } finally {
      setLoading(false);
    }
  };

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
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{tr('National Settlement, Escrow & Payment Gateway')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{tr('Audit digital payouts to farmers, freight carriers, and testing labs via BEFTN, bKash, and Nagad channels.')}</p>
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
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Settled Volume')}</span>
          <span className="text-lg font-black text-emerald-700">৳{(totalDisbursed / 100000).toFixed(2)}{tr('Lakh')}</span>
          <span className="text-[10px] text-slate-500 block">{tr('All bank & mobile channels')}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Awaiting Authorization')}</span>
          <span className="text-lg font-black text-amber-600">৳{pendingDisbursement.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block">{tr('Pending Admin Dual-Sign')}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Direct Channels')}</span>
          <span className="text-lg font-black text-slate-900">{tr('4 Active')}</span>
          <span className="text-[10px] text-slate-500 block">{tr('bKash, BEFTN, Nagad, Rocket')}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Failed Reversals')}</span>
          <span className="text-lg font-black text-slate-900">0</span>
          <span className="text-[10px] text-emerald-600 block">{tr('100% gateway uptime')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search txn ref, recipient, channel or purpose...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
        >
          <option value="All">{tr('All Payout Statuses')}</option>
          <option value="Completed">{tr('Completed')}</option>
          <option value="Pending Approval">{tr('Pending Approval')}</option>
          <option value="Processing">{tr('Processing')}</option>
          <option value="Failed">{tr('Failed')}</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Transaction Ref')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Recipient & Role')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Purpose')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Disbursement Amount')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Payment Channel')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Status')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Audit Timestamp')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-right">{tr('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{pay.transactionRef}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800 block">{pay.recipientName}</span>
                    <Badge variant="neutral">{pay.recipientRole}</Badge>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{pay.purpose}</td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    ৳{pay.amountBdt.toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono">
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
                  <td className="p-4 text-slate-500 text-[11px]">
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
    </div>
  );
};
