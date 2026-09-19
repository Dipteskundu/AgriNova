import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  TrendingUp,
  PieChart,
  BarChart2,
  Users,
  Sprout,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/shared/Badge';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getAdminDashboardSummary } from '@/agriplatform/lib/adminApi';
import { AdminDashboardSummary } from '@/agriplatform/types';

export const PlatformAnalytics: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAdminDashboardSummary();
        if (res.success) {
          setSummary(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load platform analytics telemetry'));
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
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { kpis, regionalFarmerDistribution } = summary;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">{tr('National Agronomic Platform & Macro Analytics')}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{tr('Macro telemetry encompassing national crop yields, fertilizer optimization index, and regional soil chemistry.')}</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={tr('Total Farmers Enrolled')}
          value={kpis.totalRegisteredFarmers.toLocaleString()}
          change="+24% YoY"
          trend="up"
          subtitle={tr('Across 8 administrative divisions')}
          icon={Users}
          colorScheme="emerald"
        />
        <MetricCard
          title={tr('Monitored Cropland')}
          value={`${kpis.monitoredAcreage.toLocaleString()} Ac`}
          change="+12,400 Ac this cycle"
          trend="up"
          subtitle={tr('Precision satellite mapped')}
          icon={Sprout}
          colorScheme="blue"
        />
        <MetricCard
          title={tr('Crop Yield Index')}
          value={`${summary.averageCropYieldIndex}%`}
          change="+6.1% vs Q2 target"
          trend="up"
          subtitle={tr('Farms adhering to NPK dosage')}
          icon={TrendingUp}
          colorScheme="amber"
        />
        <MetricCard
          title={tr('Weekly Market Volume')}
          value={`${summary.totalWeeklyMarketVolumeTons.toLocaleString()} MT`}
          change="DAM Audited"
          trend="up"
          subtitle={tr('Through licensed mokams')}
          icon={Activity}
          colorScheme="indigo"
        />
      </div>

      {/* Analytics Visual Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* National Crop Distribution */}
        <Card>
          <CardHeader
            title={tr('National Crop Acreage Allocation')}
            subtitle={tr('Current season acreage breakdown by cereal, oilseed, and pulse')}
          />

          <div className="space-y-4 text-xs">
            {[
              { crop: 'Boro Rice (High-Yielding Varieties)', acres: '48,200 Acres', percent: 45, color: 'bg-emerald-600' },
              { crop: 'Hybrid Yellow Maize', acres: '23,500 Acres', percent: 22, color: 'bg-amber-500' },
              { crop: 'Mustard & Oilseeds (BARI Sarisha)', acres: '15,100 Acres', percent: 14, color: 'bg-blue-600' },
              { crop: 'Biofortified Zinc Wheat', acres: '11,800 Acres', percent: 11, color: 'bg-purple-600' },
              { crop: 'Horticulture (Potato, Banana, Vegetables)', acres: '8,600 Acres', percent: 8, color: 'bg-teal-600' },
            ].map((item) => (
              <div key={item.crop} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{item.crop}</span>
                  <span className="font-mono text-slate-700 font-bold">
                    {item.acres} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Regional Breakdown */}
        <Card>
          <CardHeader
            title={tr('Regional Productivity & Compliance')}
            subtitle={tr('Farmer density and verified land tenure across divisions')}
          />

          <div className="space-y-4 text-xs">
            {regionalFarmerDistribution.map((region) => (
              <div key={region.region} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">{region.region}</span>
                  <Badge variant="success">{tr('98.4% Active')}</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-600 mb-2">
                  <span>{tr('Enrolled Farmers:')}<strong>{region.farmerCount.toLocaleString()}</strong></span>
                  <span>{tr('Registered Land:')}<strong>{region.acreage.toLocaleString()}{tr('Acres')}</strong></span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (region.acreage / 15000) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
