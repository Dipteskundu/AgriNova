import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Card, CardHeader } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getAdminDashboardSummary } from '@/lib/adminApi';
import { AdminDashboardSummary } from '@/types';

export const PlatformAnalytics: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const t = (bn: string, en: string) => (language === 'bn' ? bn : en);
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
            <div key={i} className="h-28 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222] p-4">
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
      <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('National Agronomic Platform & Macro Analytics')}</h2>
        <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Macro telemetry encompassing national crop yields, fertilizer optimization index, and regional soil chemistry.')}</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={tr('Total Farmers Enrolled')}
          value={kpis.totalRegisteredFarmers.toLocaleString()}
          trend="up"
          subtitle={tr('Across 8 administrative divisions')}
          icon={Users}
          colorScheme="emerald"
        />
        <MetricCard
          title={tr('Monitored Cropland')}
          value={`${kpis.monitoredAcreage.toLocaleString()} Ac`}
          trend="up"
          subtitle={tr('Precision satellite mapped')}
          icon={Sprout}
          colorScheme="blue"
        />
        <MetricCard
          title={tr('Crop Yield Index')}
          value={`${summary.averageCropYieldIndex}%`}
          trend="up"
          subtitle={tr('Farms adhering to NPK dosage')}
          icon={TrendingUp}
          colorScheme="amber"
        />
        <MetricCard
          title={tr('Weekly Market Volume')}
          value={`${summary.totalWeeklyMarketVolumeTons.toLocaleString()} MT`}
          change={t('ডিএএম যাচাইকৃত', 'DAM Audited')}
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
              { crop: t('বোরো ধান (উচ্চ ফলন জাত)', 'Boro Rice (High-Yielding Varieties)'), acres: '48,200', percent: 45, color: 'bg-emerald-600' },
              { crop: t('হাইব্রিড হলুদ ভুট্টা', 'Hybrid Yellow Maize'), acres: '23,500', percent: 22, color: 'bg-amber-500' },
              { crop: t('সরিষা ও তেলবীজ (বারি সরিষা)', 'Mustard & Oilseeds (BARI Sarisha)'), acres: '15,100', percent: 14, color: 'bg-blue-600' },
              { crop: t('বায়োফোর্টিফায়েড জিংক গম', 'Biofortified Zinc Wheat'), acres: '11,800', percent: 11, color: 'bg-purple-600' },
              { crop: t('উদ্যানপালন (আলু, কলা, সবজি)', 'Horticulture (Potato, Banana, Vegetables)'), acres: '8,600', percent: 8, color: 'bg-teal-600' },
            ].map((item) => (
              <div key={item.crop} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{item.crop}</span>
                  <span className="font-mono text-slate-700 dark:text-[#999999] font-bold">
                    {item.acres} {tr('Acres')} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#1a1a1a] h-2.5 rounded-full overflow-hidden">
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
              <div key={region.region} className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{region.region}</span>
                  <Badge variant="success">{tr('98.4% Active')}</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-[#a0a0a0] mb-2">
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
