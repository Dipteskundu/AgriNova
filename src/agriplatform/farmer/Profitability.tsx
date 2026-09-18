import React, { useState, useEffect } from 'react';
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

export const Profitability: React.FC = () => {
  const { showToast } = useToast();
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
        showToast('error', 'Failed to load profitability telemetry');
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
        <h2 className="text-lg font-bold text-slate-900">Farm Profitability & Financial Returns</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time agro-economic margin calculation comparing harvest valuation against cumulative input ledger.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gross Farm Revenue"
          value={`৳${metrics.totalRevenueBdt.toLocaleString()}`}
          change="+18.5% vs Prior Season"
          trend="up"
          subtitle="Harvest valuations & sales"
          icon={DollarSign}
          colorScheme="emerald"
        />
        <MetricCard
          title="Total Operating Costs"
          value={`৳${metrics.totalExpensesBdt.toLocaleString()}`}
          change="Fertilizer & Labor Heavy"
          trend="neutral"
          subtitle="All input disbursements"
          icon={Receipt}
          colorScheme="amber"
        />
        <MetricCard
          title="Net Farm Profit"
          value={`৳${metrics.netProfitBdt.toLocaleString()}`}
          change="+24.2% Net Gain"
          trend="up"
          subtitle="Net earnings retained"
          icon={TrendingUp}
          colorScheme="blue"
        />
        <MetricCard
          title="Net Profit Margin"
          value={`${metrics.profitMarginPercent}%`}
          change="Healthy Agronomic ROI"
          trend="up"
          subtitle="Return on capital deployed"
          icon={PieChart}
          colorScheme="indigo"
        />
      </div>

      {/* Crop By Crop Breakdown & Cost Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop By Crop Revenue & Margin */}
        <Card>
          <CardHeader
            title="Crop-Wise Profitability Breakdown"
            subtitle="Comparing Gross Revenue, Production Cost, and Net Margin by Batch"
          />

          <div className="space-y-4 text-xs">
            {metrics.revenueByCrop.map((crop) => {
              const margin = ((crop.profit / crop.revenue) * 100).toFixed(1);
              return (
                <div key={crop.cropName} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{crop.cropName}</h4>
                    <Badge variant={crop.profit > 0 ? 'success' : 'danger'}>
                      {margin}% Margin
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Revenue</span>
                      <span className="font-bold text-emerald-700">৳{crop.revenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Expenditure</span>
                      <span className="font-semibold text-rose-600">৳{crop.expense.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Net Profit</span>
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
            title="Expense Allocation by Input Domain"
            subtitle="Percentage share of capital across agronomic inputs"
          />

          <div className="space-y-4 text-xs">
            {metrics.costBreakdownByCategory.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{cat.category}</span>
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
          title="Monthly Agricultural Cash Flow Horizon"
          subtitle="Monthly cash disbursements vs harvest liquidation"
        />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          {metrics.monthlyFinancials.map((m) => (
            <div key={m.month} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="font-bold text-slate-700 block mb-1">{m.month}</span>
              <div className="space-y-0.5">
                <span className="text-[11px] text-emerald-700 font-bold block">
                  +৳{(m.revenue / 1000).toFixed(0)}k
                </span>
                <span className="text-[11px] text-rose-600 font-semibold block">
                  -৳{(m.expense / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
