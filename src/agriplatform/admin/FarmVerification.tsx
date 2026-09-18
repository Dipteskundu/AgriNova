import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  FileText,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getFarmVerificationRequests, reviewFarmVerification } from '@/agriplatform/lib/adminApi';
import { FarmVerificationRequest } from '@/agriplatform/types';

export const FarmVerification: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FarmVerificationRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedReq, setSelectedReq] = useState<FarmVerificationRequest | null>(null);
  const [officerNotes, setOfficerNotes] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getFarmVerificationRequests();
        if (res.success) {
          setRequests(res.data);
        }
      } catch {
        showToast('error', 'Failed to load farm verification requests');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleReview = async (status: 'verified' | 'rejected') => {
    if (!selectedReq) return;
    try {
      const res = await reviewFarmVerification(
        selectedReq.id,
        status,
        officerNotes || (status === 'verified' ? 'Approved by Upazila Agriculture Office' : 'Land deed details mismatched'),
        'Dr. Shamsul Huda (DAE)'
      );
      if (res.success) {
        setRequests((prev) => prev.map((r) => (r.id === selectedReq.id ? res.data : r)));
        setSelectedReq(null);
        setOfficerNotes('');
        showToast(
          status === 'verified' ? 'success' : 'info',
          `Land registration deed has been ${status}`
        );
      }
    } catch {
      showToast('error', 'Failed to update verification status');
    }
  };

  const filtered =
    filterStatus === 'All'
      ? requests
      : requests.filter((r) => r.status === filterStatus);

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
          <h2 className="text-lg font-bold text-slate-900">Farm Land Registry & Cadastral Verification</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit farmer land tenure records, Porcha deeds, and Union cadastral map plots for DAE certification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          >
            <option value="All">All Requests</option>
            <option value="pending">Pending Audit</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid of verification items */}
      <div className="space-y-4">
        {filtered.map((req) => (
          <Card key={req.id} className="hover:border-slate-300 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{req.farmName}</h3>
                  <Badge
                    variant={
                      req.status === 'verified'
                        ? 'success'
                        : req.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {req.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">ID: {req.id}</span>
                </div>

                <p className="text-xs text-slate-600">
                  Farmer: <strong className="text-slate-800">{req.farmerName}</strong> •{' '}
                  <span className="text-slate-500">{req.upazila}, {req.district}, {req.division}</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>Acreage: <strong className="text-emerald-700">{req.totalAcreage} Acres</strong></span>
                  <span>Khatian: <strong className="text-slate-700">{req.mouzaKhatianNumber}</strong></span>
                  <span>Plots: <strong className="text-slate-700">{req.cadastralPlotNumbers}</strong></span>
                  <span>Submitted: {req.submissionDate}</span>
                </div>

                {req.officerNotes && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">
                      Auditor Notes ({req.assignedOfficerName || 'Officer'})
                    </span>
                    {req.officerNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {req.evidenceDocuments?.length > 0 && (
                  <div className="text-xs text-slate-500 mr-2">
                    <span className="font-semibold text-slate-700">{req.evidenceDocuments.length} Deeds attached</span>
                  </div>
                )}

                {req.status === 'pending' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedReq(req)}
                  >
                    Audit Deeds & Review
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReq(req)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReq(null)}
          title={`Audit Land Deeds - ${selectedReq.farmName}`}
          subtitle={`Owner: ${selectedReq.farmerName} (${selectedReq.totalAcreage} Acres)`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Mouza & Khatian</span>
                <span className="font-bold text-slate-800">{selectedReq.mouzaKhatianNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Cadastral Plot Nos.</span>
                <span className="font-bold text-slate-800">{selectedReq.cadastralPlotNumbers}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Upazila & District</span>
                <span className="font-bold text-slate-800">
                  {selectedReq.upazila}, {selectedReq.district}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Submission Date</span>
                <span className="font-bold text-slate-800">{selectedReq.submissionDate}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
                Attached Evidence & Land Revenue Receipts
              </h4>
              <div className="space-y-2">
                {selectedReq.evidenceDocuments?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-slate-800">{doc.name}</span>
                      <Badge variant="neutral">{doc.type}</Badge>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold cursor-pointer">
                      Verify Checksum ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <FormTextarea
              id="officerNotes"
              label="Auditor Endorsement / Rejection Remarks"
              placeholder="Verify against the Land Revenue Portal (e-Namjari & Khatian registry)..."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedReq(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleReview('rejected')}
              >
                Reject Record
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleReview('verified')}
              >
                Approve & Certify
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
