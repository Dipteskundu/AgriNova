import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Sprout,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Activity,
  CheckCircle2,
  FileCheck,
  Send,
  Database,
  Layers,
  Store,
  ShoppingCart,
  CreditCard,
  Truck,
  BookOpen,
  FileBarChart,
  Scale,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getAdminDashboardSummary, getPendingFarmVerifications } from '@/agriplatform/lib/adminApi';
import { AdminDashboardSummary, FarmVerificationRequest } from '@/agriplatform/types';
import { AdminModuleKey } from '@/agriplatform/layout/AppLayout';

interface AdminDashboardProps {
  onNavigate: (module: AdminModuleKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<FarmVerificationRequest[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [summaryRes, verifRes] = await Promise.all([
          getAdminDashboardSummary(),
          getPendingFarmVerifications(),
        ]);
        if (summaryRes.success && verifRes.success) {
          setSummary(summaryRes.data);
          setPendingVerifications(verifRes.data);
        }
      } catch {
        showToast('error', 'Failed to load central admin telemetry');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading || !summary) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { kpis, regionalFarmerDistribution, recentAuditLogs } = summary;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            Central Agronomy & Platform Governance Network
          </div>
          <h2 className="text-xl font-black tracking-tight">Executive Agricultural Oversight Portal</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Supervising regional land registries, DAE extension courses, real-time commodity trading, and agro-met advisories across Bangladesh.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('weather_broadcast')}
            icon={Send}
          >
            Emergency Weather Alert
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('farm_verification')}
            icon={FileCheck}
          >
            Audit Verifications ({pendingVerifications.length})
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Farmers"
          value={kpis.totalRegisteredFarmers.toLocaleString()}
          change="+320 this month"
          trend="up"
          subtitle="Active farmer accounts"
          icon={Users}
          colorScheme="emerald"
        />
        <MetricCard
          title="Monitored Acreage"
          value={`${kpis.monitoredAcreage.toLocaleString()} Acres`}
          change="GIS mapped & verified"
          trend="neutral"
          subtitle="6,140 commercial plots"
          icon={Sprout}
          colorScheme="blue"
        />
        <MetricCard
          title="Projected Yield"
          value={`${(kpis.projectedAnnualYieldTons / 1000).toFixed(0)}k Tons`}
          change="+12% above national average"
          trend="up"
          subtitle="Boro, Potato & Mustard"
          icon={TrendingUp}
          colorScheme="indigo"
        />
        <MetricCard
          title="Pending Verifications"
          value={summary.totalPendingVerifications}
          change="Cadastral Porcha deeds"
          trend="neutral"
          subtitle="Awaiting officer audit"
          icon={ShieldCheck}
          colorScheme="amber"
        />
      </div>

      {/* Regional Distribution & Pending Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Distribution */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Regional Agro-Ecological Distribution"
              subtitle="Registered agrarian landholdings and verified farmer density by division"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate('platform_analytics')}>
                  Detailed Analytics
                </Button>
              }
            />

            <div className="space-y-3">
              {regionalFarmerDistribution.map((region) => (
                <div
                  key={region.region}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-900">{region.region}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {region.farmerCount.toLocaleString()} Farmers ({region.acreage.toLocaleString()} Acres)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (region.acreage / 15000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Verification Quick Queue */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Pending Land Approvals"
              subtitle="Recent deed & GPS submissions"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate('farm_verification')}>
                  View All ({pendingVerifications.length})
                </Button>
              }
            />

            <div className="space-y-3">
              {pendingVerifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-bold text-slate-900">{item.farmName}</h4>
                    <Badge variant="warning">{item.status}</Badge>
                  </div>
                  <p className="text-slate-600 font-medium">Owner: {item.farmerName}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {item.upazila}, {item.district} • {item.totalAcreage} Acres
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">{item.cadastralPlotNumbers}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('farm_verification')}
                      className="text-emerald-700 hover:text-emerald-800 p-0 h-auto"
                    >
                      Audit Record →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 10 Core Admin Operational Modules Quick Command Matrix */}
      <Card>
        <CardHeader
          title="Admin Operational Command Matrix (10 Core Modules)"
          subtitle="Direct executive access to all platform oversight, marketplace, and logistics subsystems"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-1">
          <button
            onClick={() => onNavigate('user_management')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">1. User Mgmt</span>
            <span className="text-[10px] text-slate-500">Farmers, Officers, Labs</span>
          </button>

          <button
            onClick={() => onNavigate('marketplace')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">2. Marketplace</span>
            <span className="text-[10px] text-slate-500">Listing Approvals</span>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">3. Orders</span>
            <span className="text-[10px] text-slate-500">Contracts & Escrow</span>
          </button>

          <button
            onClick={() => onNavigate('payments')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">4. Payments</span>
            <span className="text-[10px] text-slate-500">BEFTN & bKash Payouts</span>
          </button>

          <button
            onClick={() => onNavigate('quality')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">5. Quality Mgmt</span>
            <span className="text-[10px] text-slate-500">Lab Moisture & Grades</span>
          </button>

          <button
            onClick={() => onNavigate('logistics')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">6. Logistics</span>
            <span className="text-[10px] text-slate-500">Cold Chain & GPS Fleet</span>
          </button>

          <button
            onClick={() => onNavigate('training_management')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">7. Training</span>
            <span className="text-[10px] text-slate-500">DAE Course Workshops</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileBarChart className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">8. Reports</span>
            <span className="text-[10px] text-slate-500">Macro Agro Intelligence</span>
          </button>

          <button
            onClick={() => onNavigate('disputes')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">9. Disputes</span>
            <span className="text-[10px] text-slate-500">Escrow Arbitration</span>
          </button>

          <button
            onClick={() => onNavigate('farm_verification')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-900 block">10. Land Audit</span>
            <span className="text-[10px] text-slate-500">Cadastral Deeds</span>
          </button>
        </div>
      </Card>

      {/* Recent System Audit Logs Activity */}
      <Card>
        <CardHeader
          title="Recent System & Security Audit Ledger"
          subtitle="Immutable event logs of administrative approvals, credential changes, and system broadcasts"
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('system_audit')}>
              Full Audit Ledger
            </Button>
          }
        />

        <div className="divide-y divide-slate-100 text-xs">
          {recentAuditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.status === 'success'
                      ? 'bg-emerald-600'
                      : log.status === 'failure'
                      ? 'bg-rose-600'
                      : 'bg-amber-600'
                  }`}
                />
                <div>
                  <span className="font-bold text-slate-900">{log.actionType}</span>
                  <span className="text-slate-500 ml-2">by {log.actorName} ({log.actorRole})</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-slate-400 text-[11px] block">{log.timestamp}</span>
                <span className="font-mono text-[10px] text-slate-400">IP: {log.ipAddress}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
