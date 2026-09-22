import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  Scale,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  Gavel,
  ShieldAlert,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormTextarea } from '@/components/ui/FormInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getDisputesAdmin, resolveDisputeAdmin } from '@/lib/adminApi';
import { DisputeCaseAdminView } from '@/types';

export const DisputesManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<DisputeCaseAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState<DisputeCaseAdminView | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const res = await getDisputesAdmin();
      if (res.success) {
        setDisputes(res.data);
      }
    } catch {
      showToast('error', tr('Failed to load arbitration dispute cases'));
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (newStatus: DisputeCaseAdminView['caseStatus']) => {
    if (!selectedCase) return;
    try {
      setResolving(true);
      const res = await resolveDisputeAdmin(
        selectedCase.id,
        newStatus,
        resolutionNotes || `Arbitration completed by Central Admin Committee: ${newStatus}`
      );
      if (res.success) {
        setDisputes((prev) => prev.map((d) => (d.id === selectedCase.id ? res.data : d)));
        showToast('success', `Case ${selectedCase.caseNumber} resolved as: ${newStatus}`);
        setSelectedCase(null);
        setResolutionNotes('');
      }
    } catch {
      showToast('error', tr('Failed to submit arbitration verdict'));
    } finally {
      setResolving(false);
    }
  };

  const filtered = disputes.filter((d) => {
    const matchesSearch =
      d.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.plaintiff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.defendant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.relatedOrderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.disputeReason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.caseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCases = disputes.filter(
    (d) => d.caseStatus.includes('Open') || d.caseStatus.includes('Mediation')
  ).length;

  const totalAtStake = disputes.reduce((acc, d) => acc + d.disputedAmountBdt, 0);

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('Wholesale Trade Grievance & Escrow Arbitration')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Resolve buyer-farmer contract conflicts: Quality downgrades, moisture variance, transit spoilage, and payout disputes.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-[#a0a0a0]">{tr('Active Hearings:')}<strong className="text-red-600">{activeCases}{tr('pending')}</strong></span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Disputes Logged')}</span>
          <span className="text-xl font-black text-slate-900 dark:text-[#f0f0f0]">{disputes.length}{tr('Cases')}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Season 2026')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('In Active Mediation')}</span>
          <span className="text-xl font-black text-amber-600">{activeCases}{tr('Cases')}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Escrow paused')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Funds in Arbitration')}</span>
          <span className="text-xl font-black text-slate-900 dark:text-[#f0f0f0]">৳{totalAtStake.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Protected by digital escrow')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Resolution Rate')}</span>
          <span className="text-xl font-black text-emerald-700">92.4%</span>
          <span className="text-[10px] text-emerald-600 block">{tr('Within 48 hours SLA')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search case no, plaintiff, order or reason...')}
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
          <option value="All">{tr('All Arbitration Statuses')}</option>
          <option value="Open - Under Review">{tr('Open - Under Review')}</option>
          <option value="Mediation In Progress">{tr('Mediation In Progress')}</option>
          <option value="Resolved - Farmer Compensated">{tr('Resolved - Farmer Compensated')}</option>
          <option value="Resolved - Buyer Refunded">{tr('Resolved - Buyer Refunded')}</option>
          <option value="Dismissed">{tr('Dismissed')}</option>
        </select>
      </div>

      {/* Disputes Cards */}
      <div className="space-y-4">
        {filtered.map((d) => (
          <Card key={d.id} className="hover:border-slate-300 dark:border-[#333333] transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-[#f0f0f0] font-mono">{d.caseNumber}</span>
                  <Badge
                    variant={
                      d.caseStatus.includes('Resolved')
                        ? 'success'
                        : d.caseStatus.includes('Mediation') || d.caseStatus.includes('Open')
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {d.caseStatus}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{tr('Order:')}{d.relatedOrderCode}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">{tr('Complainant (Plaintiff):')}</span>{' '}
                    <strong className="text-slate-800 dark:text-[#e0e0e0]">{d.plaintiff.name}</strong> ({d.plaintiff.role})
                  </div>
                  <span className="text-slate-300">{tr('vs')}</span>
                  <div>
                    <span className="text-slate-400">{tr('Respondent (Defendant):')}</span>{' '}
                    <strong className="text-slate-800 dark:text-[#e0e0e0]">{d.defendant.name}</strong> ({d.defendant.role})
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600 dark:text-[#a0a0a0]">
                  <span className="font-medium text-slate-800 dark:text-[#e0e0e0]">{tr('Reason:')}<span className="text-red-700 font-bold">{d.disputeReason}</span>
                  </span>
                  <span>{tr('Disputed Escrow Fund:')}{' '}
                    <strong className="text-slate-900 dark:text-[#f0f0f0] font-mono">৳{d.disputedAmountBdt.toLocaleString()}{tr('BDT')}</strong>
                  </span>
                  <span>{tr('Evidences Attached:')}<strong>{d.evidenceAttachmentsCount}{tr('files')}</strong></span>
                  <span>{tr('Opened:')}{d.openedAt}</span>
                </div>

                {d.resolutionNotes && (
                  <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 rounded-lg text-xs text-slate-600 dark:text-[#a0a0a0] border border-slate-100">
                    <span className="font-bold text-slate-700 dark:text-[#999999] block text-[10px] uppercase">{tr('Tribunal Findings & Resolution:')}</span>
                    {d.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={d.caseStatus.includes('Resolved') ? 'outline' : 'primary'}
                  icon={Gavel}
                  onClick={() => {
                    setSelectedCase(d);
                    setResolutionNotes(d.resolutionNotes || '');
                  }}
                >
                  {d.caseStatus.includes('Resolved') ? 'Review Verdict' : 'Arbitrate Case'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Arbitration Modal */}
      {selectedCase && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCase(null)}
          title={`Arbitrate Case - ${selectedCase.caseNumber}`}
          subtitle={`Disputed Amount: ৳${selectedCase.disputedAmountBdt.toLocaleString()} BDT • Order ${selectedCase.relatedOrderCode}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Allegation:')}</span>
                <span className="font-bold text-red-700">{selectedCase.disputeReason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Plaintiff:')}</span>
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{selectedCase.plaintiff.name} ({selectedCase.plaintiff.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Defendant:')}</span>
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{selectedCase.defendant.name} ({selectedCase.defendant.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Status:')}</span>
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{selectedCase.caseStatus}</span>
              </div>
            </div>

            <FormTextarea
              id="tribunalNotes"
              label={tr('Arbitration Assessment & Escrow Order')}
              placeholder={tr('Record lab moisture re-check, weigher scale slips, or transport IoT logs and specify release verdict...')}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedCase(null)}>{tr('Cancel')}</Button>
              <Button
                variant="danger"
                size="sm"
                disabled={resolving}
                onClick={() => handleResolve('Resolved - Buyer Refunded')}
              >{tr('Refund Escrow to Buyer')}</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={resolving}
                onClick={() => handleResolve('Resolved - Farmer Compensated')}
              >{tr('Release Escrow to Farmer')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
