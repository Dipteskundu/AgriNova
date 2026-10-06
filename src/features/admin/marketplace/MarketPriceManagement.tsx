import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Edit2,
  Check,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Layers,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getMarketCommodityPrices, updateCommodityPrice } from '@/lib/adminApi';
import { MarketCommodityPrice } from '@/types';

export const MarketPriceManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketCommodityPrice[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getMarketCommodityPrices();
        if (res.success) {
          setPrices(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load wholesale market indices'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleStartEdit = (p: MarketCommodityPrice) => {
    setEditingId(p.id);
    setEditPrice(p.wholesaleModalPriceBdt);
  };

  const handleSavePrice = async (id: string) => {
    try {
      const res = await updateCommodityPrice(id, { wholesaleModalPriceBdt: editPrice });
      if (res.success) {
        setPrices((prev) => prev.map((p) => (p.id === id ? res.data : p)));
        setEditingId(null);
        showToast('success', tr('Commodity modal price updated on public board'));
      }
    } catch {
      showToast('error', tr('Failed to update commodity rate'));
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('National Wholesale Commodity Price Benchmarking')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Administered floor prices, wholesale modal averages, and trading volume across primary district mokams.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-[#a0a0a0]">{tr('DAM Feed: Synchronized Today')}</span>
        </div>
      </div>

      {/* Commodity Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prices.map((p) => (
          <Card key={p.id} className="hover:border-slate-300 dark:border-[#333333] transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f0f0f0]">{p.commodityName}</h3>
                <span className="text-xs text-slate-500 dark:text-[#a0a0a0]">{tr('Cultivar:')}{p.variety}</span>
              </div>
              <Badge
                variant={
                  p.priceTrend === 'up'
                    ? 'success'
                    : p.priceTrend === 'down'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {p.priceTrend.toUpperCase()}{tr('TREND')}</Badge>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Wholesale Modal Rate (৳/kg)
                </span>
                {editingId === p.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-sm bg-white dark:bg-[#0a0a0a] border border-emerald-500 rounded font-bold text-slate-900 dark:text-[#f0f0f0]"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSavePrice(p.id)}
                    >{tr('Save')}</Button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0]">
                      ৳{p.wholesaleModalPriceBdt.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">{tr('/ kg')}</span>
                  </div>
                )}
              </div>

              {editingId !== p.id && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit2}
                  onClick={() => handleStartEdit(p)}
                >{tr('Adjust Rate')}</Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-[#a0a0a0] mb-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">{tr('Wholesale Range')}</span>
                <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">
                  ৳{p.wholesaleMinPriceBdt} - ৳{p.wholesaleMaxPriceBdt}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">{tr('Retail Price')}</span>
                <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">৳{p.retailPriceBdt}{tr('/ kg')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">{tr('Traded Volume')}</span>
                <span className="font-semibold text-emerald-700">{p.volumeTradedMetricTons}{tr('MT')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#a0a0a0]">
              <span>{tr('Mokam:')}<strong>{p.marketLocation}</strong> ({p.division})</span>
              <span>{tr('Updated:')}{p.recordedDate}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
