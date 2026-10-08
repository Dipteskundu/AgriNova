import React, { useState, useEffect } from 'react';
import { tr, trPhrase } from "@/lib/localize";
import { bnNum, fmtDateBn } from "@/lib/format";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getQualityReportsAdmin } from '@/lib/adminApi';
import { QualityReportAdminView } from '@/types';

export const QualityManagement: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const t = (bn: string, en: string) => (language === 'bn' ? bn : en);
  const num = (v: string | number) => (language === 'bn' ? bnNum(v) : String(v));

  const verdictLabel = (v: string) =>
    v === 'Passed'
      ? t('উত্তীর্ণ', 'Passed')
      : v === 'Conditional Pass'
        ? t('শর্তসাপেক্ষে উত্তীর্ণ', 'Conditional Pass')
        : v === 'Rejected'
          ? t('প্রত্যাখ্যাত', 'Rejected')
          : v;

  const gradeLabel = (g: string) =>
    g === 'Grade A'
      ? tr('Grade A')
      : g === 'Grade B'
        ? tr('Grade B')
        : g === 'Grade C'
          ? tr('Grade C')
          : g === 'Rejected'
            ? tr('Rejected')
            : trPhrase(g);
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
        showToast('error', tr('Failed to load laboratory quality inspection certificates'));
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('Post-Harvest Grain & Produce Quality Assurance')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('DAE certified laboratory testing records: Moisture threshold compliance, foreign matter, and aflatoxin safety.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => showToast('success', tr('Lab Quality Batch Reports exported as PDF'))}
          >{tr('Export Lab Certificates')}</Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Lots Tested')}</span>
          <span className="text-xl font-black text-slate-900 dark:text-[#f0f0f0]">{num(reports.length)}{tr('Lots')}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Regional moisture labs')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Grade A Passed')}</span>
          <span className="text-xl font-black text-emerald-700">{num(passedCount)}</span>
          <span className="text-[10px] text-emerald-600 block">{tr('Moisture <14.0%')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Conditional Pass')}</span>
          <span className="text-xl font-black text-amber-600">{num(conditionalCount)}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Re-drying recommended')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Rejected Lots')}</span>
          <span className="text-xl font-black text-red-600">{num(rejectedCount)}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Blight or excessive moisture')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search batch code, farmer, lab, or certificate...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-900 dark:text-[#f0f0f0]"
          />
        </div>

        <select
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0]"
        >
          <option value="All">{tr('All Compliance Verdicts')}</option>
          <option value="Passed">{tr('Passed (Grade A/B)')}</option>
          <option value="Conditional Pass">{tr('Conditional Pass')}</option>
          <option value="Rejected">{tr('Rejected')}</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((rpt) => (
          <Card key={rpt.id} className="hover:border-slate-300 dark:border-[#333333] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">{trPhrase(rpt.produceType)}</h3>
                    <Badge
                      variant={
                        rpt.complianceVerdict === 'Passed'
                          ? 'success'
                          : rpt.complianceVerdict === 'Rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {gradeLabel(rpt.assignedGrade)}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{tr('Batch:')}{rpt.batchCode}</span>
                </div>
                <Badge variant="neutral">{verdictLabel(rpt.complianceVerdict)}</Badge>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl my-2 space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 dark:text-[#a0a0a0] mb-1">
                    <span>{tr('Moisture Content:')}</span>
                    <strong
                      className={
                        rpt.moistureContentPercent <= rpt.moistureStandardThreshold
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }
                    >
                      {num(rpt.moistureContentPercent)}{tr('% (Max')}{num(rpt.moistureStandardThreshold)}%)
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

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-[#a0a0a0]">
                  <div>
                    <span className="text-slate-400 block">{tr('Foreign Matter')}</span>
                    <strong>{num(rpt.foreignMatterPercent)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{tr('Aflatoxin (Safety)')}</span>
                    <strong className={rpt.aflatoxinPpm > 10 ? 'text-red-600' : 'text-emerald-700'}>
                      {num(rpt.aflatoxinPpm)}{tr('ppm')}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-0.5 text-xs text-slate-600 dark:text-[#a0a0a0]">
                <p>{tr('Farmer:')}<strong className="text-slate-800 dark:text-[#e0e0e0]">{rpt.farmerName}</strong>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0]">{tr('Lab:')}{trPhrase(rpt.testingLabLocation)}</p>
                <p className="text-[11px] text-slate-400 font-mono">{tr('Cert:')}{rpt.certificateNumber}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
              <span className="text-[11px] text-slate-400">{fmtDateBn(rpt.inspectionDate)}</span>
              <Button
                size="sm"
                variant="outline"
                icon={Eye}
                onClick={() => setSelectedReport(rpt)}
              >{tr('Inspect Cert')}</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={`${t('কোয়ালিটি সার্টিফিকেট', 'Quality Certificate')} - ${selectedReport.certificateNumber}`}
          subtitle={`${t('ব্যাচ', 'Batch')} ${selectedReport.batchCode} • ${trPhrase(selectedReport.produceType)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Assigned Grade:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{gradeLabel(selectedReport.assignedGrade)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Compliance Verdict:')}</span>
                <span className="font-bold text-emerald-700">{verdictLabel(selectedReport.complianceVerdict)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Moisture Content:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{num(selectedReport.moistureContentPercent)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Foreign Matter & Chaff:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{num(selectedReport.foreignMatterPercent)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Aflatoxin Mycotoxin Level:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{num(selectedReport.aflatoxinPpm)}{tr('ppm (Safe <20 ppm)')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Certifying Lab:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{trPhrase(selectedReport.testingLabLocation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Inspector in Charge:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{selectedReport.inspectorName}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>{tr('Close')}</Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => {
                  showToast(
                    'success',
                    language === 'bn'
                      ? `সনদ ${selectedReport.certificateNumber} ডাউনলোড হয়েছে`
                      : `Certificate ${selectedReport.certificateNumber} downloaded`
                  );
                  setSelectedReport(null);
                }}
              >{tr('Download PDF')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
