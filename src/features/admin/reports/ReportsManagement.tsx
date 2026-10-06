import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  FileBarChart,
  Download,
  Search,
  Filter,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  Globe,
  Eye,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getAgritechReportsAdmin } from '@/lib/adminApi';
import { AgritechReportAdminView } from '@/types';

export const ReportsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AgritechReportAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState<AgritechReportAdminView | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAgritechReportsAdmin();
        if (res.success) {
          setReports(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load executive agronomic reports'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleDownload = (rpt: AgritechReportAdminView) => {
    showToast('success', `Downloading "${rpt.title}" (${rpt.fileSizeMb} MB PDF)`);
  };

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summaryFindings.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('National Agritech Intelligence & Macro Reports')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Quarterly harvest yield forecasting, soil chemistry surveys, pesticide drift assessments, and subsidy audits.')}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Sparkles}
          onClick={() => showToast('info', tr('Compiling live data into automated Q3 DAE Ministry Briefing...'))}
        >{tr('Generate Custom Audit')}</Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search report titles, code or findings...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-900 dark:text-[#f0f0f0]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0]"
        >
          <option value="All">{tr('All Intelligence Categories')}</option>
          <option value="Yield Forecast">{tr('Yield Forecast')}</option>
          <option value="Soil Salinity & NPK">{tr('Soil Salinity & NPK')}</option>
          <option value="Pest & Blight Radar">{tr('Pest & Blight Radar')}</option>
          <option value="Subsidy Impact">{tr('Subsidy Impact')}</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rpt) => (
          <Card key={rpt.id} className="hover:border-slate-300 dark:border-[#333333] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="neutral">{rpt.category}</Badge>
                <Badge
                  variant={
                    rpt.confidentialityLevel === 'Public Agronomy'
                      ? 'success'
                      : rpt.confidentialityLevel === 'Ministry Restricted'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {rpt.confidentialityLevel}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-[#f0f0f0] mb-1">{rpt.title}</h3>
              <span className="text-[11px] font-mono text-slate-400 block mb-3">{tr('ID:')}{rpt.reportCode}{tr('• Period:')}{rpt.reportingPeriod}
              </span>

              <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl text-xs text-slate-600 dark:text-[#a0a0a0] mb-3 leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0] block text-[10px] uppercase mb-0.5">{tr('Executive Briefing:')}</span>
                {rpt.summaryFindings}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                {rpt.generatedDate}{tr('•')}{rpt.fileSizeMb}{tr('MB')}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Eye}
                  onClick={() => setSelectedReport(rpt)}
                >{tr('Preview')}</Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Download}
                  onClick={() => handleDownload(rpt)}
                >{tr('Download PDF')}</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.title}
          subtitle={`Report Code: ${selectedReport.reportCode} • ${selectedReport.reportingPeriod}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Security Classification:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{selectedReport.confidentialityLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Subject Category:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{selectedReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Publication Date:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{selectedReport.generatedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Document Size:')}</span>
                <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{selectedReport.fileSizeMb}{tr('MB (Indexed Vector PDF)')}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-[#f0f0f0] mb-1.5 uppercase text-[11px]">{tr('Core Agro-Statistical Insights')}</h4>
              <p className="text-slate-700 dark:text-[#999999] bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-slate-200 dark:border-[#222222] leading-relaxed">
                {selectedReport.summaryFindings}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>{tr('Close')}</Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => {
                  handleDownload(selectedReport);
                  setSelectedReport(null);
                }}
              >{tr('Export Full 28-Page Dossier')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
