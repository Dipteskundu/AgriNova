import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getSystemAuditLogs } from '@/lib/adminApi';
import { SystemAuditLog } from '@/types';

export const SystemAuditLogs: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getSystemAuditLogs();
        if (res.success) {
          setLogs(res.data);
        }
      } catch {
        showToast('error', tr('Failed to retrieve immutable security logs'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Timestamp,Actor,Role,Action,Entity,EntityID,IP,Status,Details']
        .concat(
          logs.map(
            (l) =>
              `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.actionType}","${l.targetEntity}","${l.entityId}","${l.ipAddress}","${l.status}","${l.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', tr('Security audit log exported as CSV'));
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr(log.details).toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('Immutable System & Security Audit Ledger')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Cryptographically sealed timeline of administrative approvals, credential changes, and broadcast events.')}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleExport}
        >{tr('Export Compliance Audit CSV')}</Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search by action, actor, IP or detail...')}
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
          <option value="All">{tr('All Statuses')}</option>
          <option value="success">{tr('Success')}</option>
          <option value="warning">{tr('Warning')}</option>
          <option value="failure">{tr('Failure')}</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60/80">
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Timestamp')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Actor & Role')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Action Type')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Target Entity')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('IP Address')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Status')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{tr('Event Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 dark:bg-[#111111]/60/60 transition-colors">
                  <td className="p-4 text-slate-500 dark:text-[#a0a0a0] whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-4 font-sans">
                    <span className="font-bold text-slate-900 dark:text-[#f0f0f0] block">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tr(log.actorRole)}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant="neutral">{tr(log.actionType)}</Badge>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-[#999999]">
                    <span>{tr(log.targetEntity)}</span>
                    <span className="text-slate-400 block text-[10px]">{log.entityId}</span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-[#a0a0a0]">{log.ipAddress}</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        log.status === 'success'
                          ? 'success'
                          : log.status === 'failure'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {tr(log.status === 'success' ? 'Success' : log.status === 'warning' ? 'Warning' : 'Failure')}
                    </Badge>
                  </td>
                  <td className="p-4 font-sans text-slate-600 dark:text-[#a0a0a0] max-w-xs">{tr(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
