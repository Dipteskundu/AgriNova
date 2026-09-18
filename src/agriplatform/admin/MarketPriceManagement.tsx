import React, { useState, useEffect } from 'react';
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
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getMarketCommodityPrices, updateCommodityPrice } from '@/agriplatform/lib/adminApi';
import { MarketCommodityPrice } from '@/agriplatform/types';

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
        showToast('error', 'Failed to load wholesale market indices');
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
        showToast('success', 'Commodity modal price updated on public board');
      }
    } catch {
      showToast('error', 'Failed to update commodity rate');
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900">National Wholesale Commodity Price Benchmarking</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administered floor prices, wholesale modal averages, and trading volume across primary district mokams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">DAM Feed: Synchronized Today</span>
        </div>
      </div>

      {/* Commodity Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prices.map((p) => (
          <Card key={p.id} className="hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{p.commodityName}</h3>
                <span className="text-xs text-slate-500">Cultivar: {p.variety}</span>
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
                {p.priceTrend.toUpperCase()} TREND
              </Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl my-3 flex items-center justify-between">
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
                      className="w-24 px-2 py-1 text-sm bg-white border border-emerald-500 rounded font-bold text-slate-900"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSavePrice(p.id)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900">
                      ৳{p.wholesaleModalPriceBdt.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ kg</span>
                  </div>
                )}
              </div>

              {editingId !== p.id && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit2}
                  onClick={() => handleStartEdit(p)}
                >
                  Adjust Rate
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mb-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Wholesale Range</span>
                <span className="font-semibold text-slate-800">
                  ৳{p.wholesaleMinPriceBdt} - ৳{p.wholesaleMaxPriceBdt}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Retail Price</span>
                <span className="font-semibold text-slate-800">৳{p.retailPriceBdt} / kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Traded Volume</span>
                <span className="font-semibold text-emerald-700">{p.volumeTradedMetricTons} MT</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Mokam: <strong>{p.marketLocation}</strong> ({p.division})</span>
              <span>Updated: {p.recordedDate}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
