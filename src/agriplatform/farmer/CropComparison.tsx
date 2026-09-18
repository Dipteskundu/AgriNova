import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Droplets,
  Coins,
  Clock,
  TrendingUp,
  ShieldAlert,
  Users,
  Check,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getCropComparisonProfiles } from '@/agriplatform/lib/farmerApi';
import { CropComparisonProfile } from '@/agriplatform/types';

export const CropComparison: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<CropComparisonProfile[]>([]);
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getCropComparisonProfiles();
        if (res.success) {
          setProfiles(res.data);
          // Preselect first 3
          setSelectedCropIds(res.data.slice(0, 3).map((c) => c.id));
        }
      } catch {
        showToast('error', 'Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const toggleSelectCrop = (id: string) => {
    if (selectedCropIds.includes(id)) {
      if (selectedCropIds.length <= 2) {
        showToast('warning', 'Please keep at least 2 crops selected for meaningful comparison');
        return;
      }
      setSelectedCropIds(selectedCropIds.filter((cid) => cid !== id));
    } else {
      if (selectedCropIds.length >= 4) {
        showToast('warning', 'You can compare up to 4 crops simultaneously');
        return;
      }
      setSelectedCropIds([...selectedCropIds, id]);
    }
  };

  const comparedCrops = profiles.filter((c) => selectedCropIds.includes(c.id));

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
      {/* Selector Ribbon */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Side-by-Side Crop Comparison Matrix</h2>
            <p className="text-xs text-slate-500">
              Evaluate economic profitability, water footprint, labor demand, and risk profiles.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {selectedCropIds.length} Selected (Max 4)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {profiles.map((crop) => {
            const isSelected = selectedCropIds.includes(crop.id);
            return (
              <button
                key={crop.id}
                onClick={() => toggleSelectCrop(crop.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                <span>
                  {crop.cropName} ({crop.variety})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 font-bold text-slate-600 uppercase tracking-wider w-56">
                  Agronomic Parameter
                </th>
                {comparedCrops.map((crop) => (
                  <th key={crop.id} className="p-4 text-slate-900 min-w-[200px] border-l border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{crop.cropName}</span>
                      <Badge variant="success">{crop.season}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">{crop.variety}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: Water Requirement */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Water Need (Liters / kg)
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-bold text-slate-900">
                      {crop.waterRequirementLitersPerKg.toLocaleString()} L
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {crop.waterRequirementLitersPerKg > 2000
                        ? 'High flood water requirement'
                        : 'Water conserving'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Row 2: Total Input Cost */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Total Input Cost / Acre
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-bold text-slate-900">৳{crop.totalInputCostPerAcre.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Seed cost: ৳{crop.seedCostPerAcre}</p>
                  </td>
                ))}
              </tr>

              {/* Row 3: Yield per Acre */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Expected Yield / Acre
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-bold text-emerald-700">{crop.yieldKgPerAcre.toLocaleString()} kg</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Market rate: ৳{crop.marketPricePerKg}/kg</p>
                  </td>
                ))}
              </tr>

              {/* Row 4: Net Margin % */}
              <tr className="hover:bg-slate-50/50 bg-emerald-50/20">
                <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  Net Profit Margin %
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-extrabold text-base text-emerald-800">
                      {crop.netMarginPercent}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 5: Maturity Duration */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Maturity Duration (Days)
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-semibold text-slate-800">{crop.maturityDays} Days</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {crop.maturityDays <= 90 ? 'Short window booster' : 'Standard seasonal cycle'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Row 6: Pest Vulnerability */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Pest & Disease Vulnerability
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <Badge
                      variant={
                        crop.pestVulnerability === 'Low'
                          ? 'success'
                          : crop.pestVulnerability === 'Moderate'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {crop.pestVulnerability}
                    </Badge>
                  </td>
                ))}
              </tr>

              {/* Row 7: Labor Intensity */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  Labor Intensity
                </td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-semibold text-slate-800">{crop.laborIntensityDays} Man-Days</span>
                  </td>
                ))}
              </tr>

              {/* Row 8: Shelf Life */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700">Storage Shelf Life</td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    <span className="font-semibold text-slate-800">{crop.shelfLifeDays} Days</span>
                  </td>
                ))}
              </tr>

              {/* Row 9: Govt Subsidy Eligibility */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-700">Govt Subsidy Eligible</td>
                {comparedCrops.map((crop) => (
                  <td key={crop.id} className="p-4 border-l border-slate-200">
                    {crop.governmentSubsidiesEligible ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Eligible for Fertilizer Subsidies
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
