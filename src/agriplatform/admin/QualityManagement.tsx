import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Search,
  Filter,
  Eye,
  Microscope,
  Award,
  Download,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getQualityReportsAdmin } from '@/agriplatform/lib/adminApi';
import { QualityReportAdminView } from '@/agriplatform/types';

export const QualityManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<QualityReportAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState<QualityReportAdminView | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getQualityReportsAdmin();
        if (res.success) {
          setReports(res.data);
        }
      } catch {
        showToast('error', 'Failed to load laboratory quality inspection certificates');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.produceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = verdictFilter === 'All' || r.complianceVerdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  const passedCount = reports.filter((r) => r.complianceVerdict === 'Passed').length;
  const conditionalCount = reports.filter((r) => r.complianceVerdict === 'Conditional Pass').length;
  const rejectedCount = reports.filter((r) => r.complianceVerdict === 'Rejected').length;

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
          <h2 className="text-lg font-bold text-slate-900">Post-Harvest Grain & Produce Quality Assurance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            DAE certified laboratory testing records: Moisture threshold compliance, foreign matter, and aflatoxin safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => showToast('success', 'Lab Quality Batch Reports exported as PDF')}
          >
            Export Lab Certificates
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Lots Tested</span>
          <span className="text-xl font-black text-slate-900">{reports.length} Lots</span>
          <span className="text-[10px] text-slate-500 block">Regional moisture labs</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Grade A Passed</span>
          <span className="text-xl font-black text-emerald-700">{passedCount}</span>
          <span className="text-[10px] text-emerald-600 block">Moisture &lt;14.0%</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Conditional Pass</span>
          <span className="text-xl font-black text-amber-600">{conditionalCount}</span>
          <span className="text-[10px] text-slate-500 block">Re-drying recommended</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Rejected Lots</span>
          <span className="text-xl font-black text-red-600">{rejectedCount}</span>
          <span className="text-[10px] text-slate-500 block">Blight or excessive moisture</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batch code, farmer, lab, or certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <select
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
        >
          <option value="All">All Compliance Verdicts</option>
          <option value="Passed">Passed (Grade A/B)</option>
          <option value="Conditional Pass">Conditional Pass</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((rpt) => (
          <Card key={rpt.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{rpt.produceType}</h3>
                    <Badge
                      variant={
                        rpt.complianceVerdict === 'Passed'
                          ? 'success'
                          : rpt.complianceVerdict === 'Rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {rpt.assignedGrade}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Batch: {rpt.batchCode}</span>
                </div>
                <Badge variant="neutral">{rpt.complianceVerdict}</Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl my-2 space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Moisture Content:</span>
                    <strong
                      className={
                        rpt.moistureContentPercent <= rpt.moistureStandardThreshold
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }
                    >
                      {rpt.moistureContentPercent}% (Max {rpt.moistureStandardThreshold}%)
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rpt.moistureContentPercent <= rpt.moistureStandardThreshold
                          ? 'bg-emerald-600'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (rpt.moistureContentPercent / 25) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Foreign Matter</span>
                    <strong>{rpt.foreignMatterPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aflatoxin (Safety)</span>
                    <strong className={rpt.aflatoxinPpm > 10 ? 'text-red-600' : 'text-emerald-700'}>
                      {rpt.aflatoxinPpm} ppm
                    </strong>
                  </div>
                </div>
              </div>

              <div className="space-y-0.5 text-xs text-slate-600">
                <p>
                  Farmer: <strong className="text-slate-800">{rpt.farmerName}</strong>
                </p>
                <p className="text-[11px] text-slate-500">Lab: {rpt.testingLabLocation}</p>
                <p className="text-[11px] text-slate-400 font-mono">Cert: {rpt.certificateNumber}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
              <span className="text-[11px] text-slate-400">{rpt.inspectionDate}</span>
              <Button
                size="sm"
                variant="outline"
                icon={Eye}
                onClick={() => setSelectedReport(rpt)}
              >
                Inspect Cert
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={`Quality Certificate - ${selectedReport.certificateNumber}`}
          subtitle={`Batch ${selectedReport.batchCode} • ${selectedReport.produceType}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Grade:</span>
                <span className="font-bold text-slate-900">{selectedReport.assignedGrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compliance Verdict:</span>
                <span className="font-bold text-emerald-700">{selectedReport.complianceVerdict}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moisture Content:</span>
                <span className="font-bold text-slate-900">{selectedReport.moistureContentPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Foreign Matter & Chaff:</span>
                <span className="font-bold text-slate-900">{selectedReport.foreignMatterPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aflatoxin Mycotoxin Level:</span>
                <span className="font-bold text-slate-900">{selectedReport.aflatoxinPpm} ppm (Safe &lt;20 ppm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certifying Lab:</span>
                <span className="font-bold text-slate-900">{selectedReport.testingLabLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inspector in Charge:</span>
                <span className="font-bold text-slate-900">{selectedReport.inspectorName}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => {
                  showToast('success', `Certificate ${selectedReport.certificateNumber} downloaded`);
                  setSelectedReport(null);
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
