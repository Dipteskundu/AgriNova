import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Receipt,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/shared/Badge';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getProfitabilityMetrics } from '@/agriplatform/lib/farmerApi';
import { ProfitabilityMetrics } from '@/agriplatform/types';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';

export const Profitability: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProfitabilityMetrics | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getProfitabilityMetrics();
        if (res.success) {
          setMetrics(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load profitability telemetry'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading || !metrics) {
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">
          {language === 'bn' ? 'খামারের লাভ-ক্ষতি ও আর্থিক হিসাব' : 'Farm Profitability & Financial Returns'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'bn'
            ? 'ফসল বিক্রির আয় এবং বীজ, সার, কীটনাশক ও শ্রম ব্যয়ের তুলনাভিত্তিক নিট মুনাফার বিশ্লেষণ।'
            : 'Real-time agro-economic margin calculation comparing harvest valuation against cumulative input ledger.'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'bn' ? 'মোট খামার আয়' : 'Gross Farm Revenue'}
          value={`৳${metrics.totalRevenueBdt.toLocaleString()}`}
          change={language === 'bn' ? '+১৮.৫% পূর্ববর্তী মৌসুমের চেয়ে বৃদ্ধি' : '+18.5% vs Prior Season'}
          trend="up"
          subtitle={language === 'bn' ? 'ফসল বিক্রয় ও বর্তমান মজুদ মূল্য' : 'Harvest valuations & sales'}
          icon={DollarSign}
          colorScheme="emerald"
        />
        <MetricCard
          title={language === 'bn' ? 'মোট পরিচালন ব্যয়' : 'Total Operating Costs'}
          value={`৳${metrics.totalExpensesBdt.toLocaleString()}`}
          change={language === 'bn' ? 'সার ও শ্রম খরচের পরিমাণ বেশি' : 'Fertilizer & Labor Heavy'}
          trend="neutral"
          subtitle={language === 'bn' ? 'বীজ, সার, সেচ ও মজুরি খরচ' : 'All input disbursements'}
          icon={Receipt}
          colorScheme="amber"
        />
        <MetricCard
          title={language === 'bn' ? 'নিট মুনাফা' : 'Net Farm Profit'}
          value={`৳${metrics.netProfitBdt.toLocaleString()}`}
          change={language === 'bn' ? '+২৪.২% নিট লাভ বৃদ্ধি' : '+24.2% Net Gain'}
          trend="up"
          subtitle={language === 'bn' ? 'সব খরচ বাদে প্রকৃত আয়' : 'Net earnings retained'}
          icon={TrendingUp}
          colorScheme="blue"
        />
        <MetricCard
          title={language === 'bn' ? 'মুনাফার হার (মার্জিন)' : 'Net Profit Margin'}
          value={`${metrics.profitMarginPercent}%`}
          change={language === 'bn' ? 'সন্তোষজনক বিনিয়োগের মুনাফা' : 'Healthy Agronomic ROI'}
          trend="up"
          subtitle={language === 'bn' ? 'বিনিয়োগের বিপরীতে লাভ' : 'Return on capital deployed'}
          icon={PieChart}
          colorScheme="indigo"
        />
      </div>

      {/* Crop By Crop Breakdown & Cost Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop By Crop Revenue & Margin */}
        <Card>
          <CardHeader
            title={language === 'bn' ? 'ফসলভিত্তিক লাভ-ক্ষতি' : 'Crop-Wise Profitability Breakdown'}
            subtitle={language === 'bn' ? 'প্রতিটি ফসলের মোট বিক্রি, উৎপাদন খরচ ও অর্জিত মুনাফা' : 'Comparing Gross Revenue, Production Cost, and Net Margin by Batch'}
          />

          <div className="space-y-4 text-xs">
            {metrics.revenueByCrop.map((crop) => {
              const margin = ((crop.profit / crop.revenue) * 100).toFixed(1);
              return (
                <div key={crop.cropName} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{tr(crop.cropName)}</h4>
                    <Badge variant={crop.profit > 0 ? 'success' : 'danger'}>
                      {margin}% {language === 'bn' ? 'মুনাফা' : 'Margin'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {language === 'bn' ? 'আয়' : 'Revenue'}
                      </span>
                      <span className="font-bold text-emerald-700">৳{crop.revenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {language === 'bn' ? 'খরচ' : 'Expenditure'}
                      </span>
                      <span className="font-semibold text-rose-600">৳{crop.expense.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {language === 'bn' ? 'নিট লাভ' : 'Net Profit'}
                      </span>
                      <span className="font-extrabold text-slate-900">৳{crop.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Cost Breakdown by Category */}
        <Card>
          <CardHeader
            title={language === 'bn' ? 'খাত অনুযায়ী খরচের বণ্টন' : 'Expense Allocation by Input Domain'}
            subtitle={language === 'bn' ? 'বীজ, সার, সেচ, শ্রম ইত্যাদিতে খরচের শতাংশ' : 'Percentage share of capital across agronomic inputs'}
          />

          <div className="space-y-4 text-xs">
            {metrics.costBreakdownByCategory.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {tr(cat.category)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-600 font-bold">
                      ৳{cat.amount.toLocaleString()}
                    </span>
                    <span className="text-slate-400">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Financial Cashflow */}
      <Card>
        <CardHeader
          title={language === 'bn' ? 'মাসভিত্তিক নগদ প্রবাহ (ক্যাশফ্লো)' : 'Monthly Agricultural Cash Flow Horizon'}
          subtitle={language === 'bn' ? 'প্রতি মাসের আয় বনাম খরচের তুলনামূলক প্রবাহ' : 'Monthly cash disbursements vs harvest liquidation'}
        />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          {metrics.monthlyFinancials.map((m) => (
            <div key={m.month} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="font-bold text-slate-700 block mb-1">{tr(m.month)}</span>
              <div className="space-y-0.5">
                <span className="text-[11px] text-emerald-700 font-bold block">
                  +৳{(m.revenue / 1000).toFixed(0)}{tr('k')}</span>
                <span className="text-[11px] text-rose-600 font-semibold block">
                  -৳{(m.expense / 1000).toFixed(0)}{tr('k')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
