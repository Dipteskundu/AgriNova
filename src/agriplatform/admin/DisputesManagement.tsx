import React, { useState, useEffect } from 'react';
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
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getDisputesAdmin, resolveDisputeAdmin } from '@/agriplatform/lib/adminApi';
import { DisputeCaseAdminView } from '@/agriplatform/types';

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
      showToast('error', 'Failed to load arbitration dispute cases');
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
      showToast('error', 'Failed to submit arbitration verdict');
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
          <h2 className="text-lg font-bold text-slate-900">Wholesale Trade Grievance & Escrow Arbitration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve buyer-farmer contract conflicts: Quality downgrades, moisture variance, transit spoilage, and payout disputes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active Hearings: <strong className="text-red-600">{activeCases} pending</strong></span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Disputes Logged</span>
          <span className="text-xl font-black text-slate-900">{disputes.length} Cases</span>
          <span className="text-[10px] text-slate-500 block">Season 2026</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">In Active Mediation</span>
          <span className="text-xl font-black text-amber-600">{activeCases} Cases</span>
          <span className="text-[10px] text-slate-500 block">Escrow paused</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Funds in Arbitration</span>
          <span className="text-xl font-black text-slate-900">৳{totalAtStake.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block">Protected by digital escrow</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Resolution Rate</span>
          <span className="text-xl font-black text-emerald-700">92.4%</span>
          <span className="text-[10px] text-emerald-600 block">Within 48 hours SLA</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search case no, plaintiff, order or reason..."
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
          <option value="All">All Arbitration Statuses</option>
          <option value="Open - Under Review">Open - Under Review</option>
          <option value="Mediation In Progress">Mediation In Progress</option>
          <option value="Resolved - Farmer Compensated">Resolved - Farmer Compensated</option>
          <option value="Resolved - Buyer Refunded">Resolved - Buyer Refunded</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>

      {/* Disputes Cards */}
      <div className="space-y-4">
        {filtered.map((d) => (
          <Card key={d.id} className="hover:border-slate-300 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 font-mono">{d.caseNumber}</span>
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
                  <span className="text-xs text-slate-400 font-mono">Order: {d.relatedOrderCode}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Complainant (Plaintiff):</span>{' '}
                    <strong className="text-slate-800">{d.plaintiff.name}</strong> ({d.plaintiff.role})
                  </div>
                  <span className="text-slate-300">vs</span>
                  <div>
                    <span className="text-slate-400">Respondent (Defendant):</span>{' '}
                    <strong className="text-slate-800">{d.defendant.name}</strong> ({d.defendant.role})
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600">
                  <span className="font-medium text-slate-800">
                    Reason: <span className="text-red-700 font-bold">{d.disputeReason}</span>
                  </span>
                  <span>
                    Disputed Escrow Fund:{' '}
                    <strong className="text-slate-900 font-mono">৳{d.disputedAmountBdt.toLocaleString()} BDT</strong>
                  </span>
                  <span>Evidences Attached: <strong>{d.evidenceAttachmentsCount} files</strong></span>
                  <span>Opened: {d.openedAt}</span>
                </div>

                {d.resolutionNotes && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">
                      Tribunal Findings & Resolution:
                    </span>
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
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Allegation:</span>
                <span className="font-bold text-red-700">{selectedCase.disputeReason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plaintiff:</span>
                <span className="font-bold text-slate-800">{selectedCase.plaintiff.name} ({selectedCase.plaintiff.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Defendant:</span>
                <span className="font-bold text-slate-800">{selectedCase.defendant.name} ({selectedCase.defendant.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-800">{selectedCase.caseStatus}</span>
              </div>
            </div>

            <FormTextarea
              id="tribunalNotes"
              label="Arbitration Assessment & Escrow Order"
              placeholder="Record lab moisture re-check, weigher scale slips, or transport IoT logs and specify release verdict..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedCase(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={resolving}
                onClick={() => handleResolve('Resolved - Buyer Refunded')}
              >
                Refund Escrow to Buyer
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={resolving}
                onClick={() => handleResolve('Resolved - Farmer Compensated')}
              >
                Release Escrow to Farmer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
