import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  PackageCheck,
  Plus,
  Scale,
  Warehouse,
  Coins,
  CheckCircle2,
  TrendingUp,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getHarvestRecords, getCropBatches, createHarvestRecord } from '@/lib/farmerApi';
import { HarvestRecord, CropBatch } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export const HarvestManagement: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    cropBatchId: '',
    harvestDate: new Date().toISOString().split('T')[0],
    quantityKg: 4200,
    moisturePercentage: 13.5,
    qualityGrade: 'Grade A' as HarvestRecord['qualityGrade'],
    storageLocation: 'Sherpur Grain Silo B3',
    storageCondition: 'Silo' as HarvestRecord['storageCondition'],
    marketReadiness: 'Ready for Sale' as HarvestRecord['marketReadiness'],
    estimatedValuationBdt: 142800,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [recordsRes, batchesRes] = await Promise.all([
          getHarvestRecords(),
          getCropBatches(),
        ]);
        if (recordsRes.success && batchesRes.success) {
          setHarvestRecords(recordsRes.data);
          setCropBatches(batchesRes.data);
          if (batchesRes.data.length > 0) {
            setNewLot((prev) => ({ ...prev, cropBatchId: batchesRes.data[0].id }));
          }
        }
      } catch {
        showToast('error', tr('Failed to load harvest records'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const batch = cropBatches.find((b) => b.id === newLot.cropBatchId);
    try {
      const res = await createHarvestRecord({
        cropBatchId: newLot.cropBatchId,
        cropName: batch?.cropName || 'BRRI Dhan-28 (Boro Rice)',
        variety: batch?.variety || 'High Yielding',
        fieldName: batch?.fieldName || 'Plot A1',
        harvestDate: newLot.harvestDate,
        quantityKg: Number(newLot.quantityKg),
        moisturePercentage: Number(newLot.moisturePercentage),
        qualityGrade: newLot.qualityGrade,
        storageLocation: newLot.storageLocation,
        storageCondition: newLot.storageCondition,
        marketReadiness: newLot.marketReadiness,
        estimatedValuationBdt: Number(newLot.estimatedValuationBdt),
      });
      if (res.success) {
        setHarvestRecords([res.data, ...harvestRecords]);
        setIsAddModalOpen(false);
        showToast('success', tr('Harvest lot recorded in warehouse registry'));
      }
    } catch {
      showToast('error', tr('Failed to record harvest lot'));
    }
  };

  const totalKg = harvestRecords.reduce((acc, h) => acc + h.quantityKg, 0);
  const totalValuation = harvestRecords.reduce((acc, h) => acc + h.estimatedValuationBdt, 0);

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">
            {language === 'bn' ? 'ফসল তোলা ও গুদামজাতকরণ রেকর্ড' : 'Harvest Records & Warehouse Storage'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">
            {language === 'bn' ? 'মোট তোলাকৃত ফসল: ' : 'Total Harvested: '}
            <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">
              {(totalKg / 1000).toFixed(1)} {language === 'bn' ? 'মেট্রিক টন' : 'Metric Tons'}
            </span>{tr('•')}{language === 'bn' ? 'আনুমানিক বাজারমূল্য: ' : 'Estimated Valuation: '}
            <span className="font-bold text-emerald-700">৳{totalValuation.toLocaleString()}</span>.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          {language === 'bn' ? '+ নতুন ফসল তোলার হিসাব যোগ করুন' : 'Record New Harvest Lot'}
        </Button>
      </div>

      {/* Harvest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {harvestRecords.map((lot) => (
          <Card key={lot.id} className="flex flex-col justify-between hover:border-slate-300 dark:border-[#333333] transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">{tr(lot.cropName)}</h3>
                    <p className="text-[11px] text-slate-400">{tr(lot.variety)}{tr('•')}{tr(lot.fieldName)}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    lot.qualityGrade === 'Grade A'
                      ? 'success'
                      : lot.qualityGrade === 'Grade B'
                      ? 'info'
                      : 'neutral'
                  }
                >
                  {language === 'bn'
                    ? lot.qualityGrade === 'Grade A' ? 'গ্রেড ক (সেরা মান)'
                      : lot.qualityGrade === 'Grade B' ? 'গ্রেড খ (সাধারণ মান)'
                      : lot.qualityGrade === 'Grade C' ? 'গ্রেড গ'
                      : 'বাতিল'
                    : lot.qualityGrade}
                </Badge>
              </div>

              {/* Yield & Moisture Highlights */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-100 text-xs mt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {language === 'bn' ? 'মোট ফলন' : 'Net Yield'}
                  </span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-[#f0f0f0]">
                    {lot.quantityKg.toLocaleString()} {language === 'bn' ? 'কেজি' : 'kg'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({(lot.quantityKg / 40).toFixed(0)} {language === 'bn' ? 'মণ' : 'Maunds'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {language === 'bn' ? 'আর্দ্রতার মাত্রা' : 'Moisture Level'}
                  </span>
                  <span className="font-bold text-blue-700">{lot.moisturePercentage}%</span>
                  <span className="text-[10px] text-slate-400 block">
                    {lot.moisturePercentage <= 14
                      ? (language === 'bn' ? 'সংরক্ষণ উপযোগী' : 'Safe storage')
                      : (language === 'bn' ? 'শুকানো প্রয়োজন' : 'Needs drying')}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-[#a0a0a0] flex items-center gap-1.5">
                    <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                    {language === 'bn' ? 'সংরক্ষণাগার / সাইট' : 'Storage Site'}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-[#e0e0e0] truncate max-w-[150px]">{tr(lot.storageLocation)}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <span className="text-slate-500 dark:text-[#a0a0a0]">{language === 'bn' ? 'বাজারজাতকরণের অবস্থা' : 'Market Readiness'}</span>
                  <Badge
                    variant={
                      lot.marketReadiness === 'Sold'
                        ? 'success'
                        : lot.marketReadiness === 'Ready for Sale'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {language === 'bn'
                      ? lot.marketReadiness === 'Sold' ? 'বিক্রিত'
                        : lot.marketReadiness === 'Ready for Sale' ? 'বিক্রির জন্য প্রস্তুত'
                        : 'গুদামজাত'
                      : lot.marketReadiness}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500 dark:text-[#a0a0a0] font-semibold">{language === 'bn' ? 'আনুমানিক মূল্য' : 'Estimated Valuation'}</span>
                  <span className="font-extrabold text-emerald-700 text-sm">৳{lot.estimatedValuationBdt.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{language === 'bn' ? 'কর্তন তারিখ: ' : 'Harvested: '}{lot.harvestDate}</span>
              <span className="font-mono">{language === 'bn' ? 'ব্যাচ কোড: ' : 'Code: '}{lot.batchCode}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Harvest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'bn' ? 'ফসল তোলার নতুন হিসাব লিপিবদ্ধ করুন' : 'Record Harvest Batch & Post-Harvest Lot'}
        subtitle={language === 'bn' ? 'ফলনের পরিমাণ, আর্দ্রতা ও গুদামের তথ্য প্রদান করুন' : 'Specify harvest quantity, moisture content, and warehouse assignment'}
        maxWidth="lg"
      >
        <form onSubmit={handleRecordHarvest} className="space-y-4">
          <FormSelect
            id="cropBatchId"
            label={language === 'bn' ? 'ফসল ও জমির প্লট নির্বাচন করুন' : 'Harvested Crop Batch'}
            value={newLot.cropBatchId}
            onChange={(e) => setNewLot({ ...newLot, cropBatchId: e.target.value })}
            options={cropBatches.map((b) => ({
              value: b.id,
              label: `${tr(b.cropName)} (${tr(b.variety)}) - ${tr(b.fieldName)}`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="quantityKg"
              label={language === 'bn' ? 'মোট ফলন (কেজি)' : 'Net Quantity (kg)'}
              type="number"
              value={newLot.quantityKg}
              onChange={(e) => setNewLot({ ...newLot, quantityKg: Number(e.target.value) })}
              required
            />
            <FormInput
              id="moisturePercentage"
              label={language === 'bn' ? 'আর্দ্রতার পরিমাণ (%)' : 'Moisture Content (%)'}
              type="number"
              step="0.1"
              value={newLot.moisturePercentage}
              onChange={(e) =>
                setNewLot({ ...newLot, moisturePercentage: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSelect
              id="qualityGrade"
              label={language === 'bn' ? 'মানের গ্রেড' : 'Quality Grade'}
              value={newLot.qualityGrade}
              onChange={(e) =>
                setNewLot({
                  ...newLot,
                  qualityGrade: e.target.value as HarvestRecord['qualityGrade'],
                })
              }
              options={[
                { value: 'Grade A', label: language === 'bn' ? 'গ্রেড ক (উচ্চ মান সম্পন্ন)' : 'Grade A (Export / Prime)' },
                { value: 'Grade B', label: language === 'bn' ? 'গ্রেড খ (সাধারণ মান)' : 'Grade B (Standard Market)' },
                { value: 'Grade C', label: language === 'bn' ? 'গ্রেড গ (প্রক্রিয়াকরণ উপযোগী)' : 'Grade C (Secondary Processing)' },
                { value: 'Rejected', label: language === 'bn' ? 'বাতিল' : 'Rejected' },
              ]}
            />
            <FormSelect
              id="storageCondition"
              label={language === 'bn' ? 'গুদামের ধরন' : 'Storage Facility'}
              value={newLot.storageCondition}
              onChange={(e) =>
                setNewLot({
                  ...newLot,
                  storageCondition: e.target.value as HarvestRecord['storageCondition'],
                })
              }
              options={[
                { value: 'Silo', label: language === 'bn' ? 'বায়ুচলাচলযুক্ত শস্য সাইলো' : 'Aerated Grain Silo' },
                { value: 'Cold Storage', label: language === 'bn' ? 'হিমাগার (কোল্ড স্টোরেজ)' : 'Cold Storage Facility' },
                { value: 'Ambient Warehouse', label: language === 'bn' ? 'সাধারণ খাদ্য গুদাম' : 'Standard Warehouse' },
                { value: 'Farm Shed', label: language === 'bn' ? 'খামারের নিজস্ব ছাউনি' : 'Farm Shed Storage' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="storageLocation"
              label={language === 'bn' ? 'গুদামের নাম / অবস্থান' : 'Storage Location / Warehouse'}
              value={newLot.storageLocation}
              onChange={(e) => setNewLot({ ...newLot, storageLocation: e.target.value })}
              required
            />
            <FormInput
              id="estimatedValuationBdt"
              label={language === 'bn' ? 'আনুমানিক বাজারমূল্য (টাকা)' : 'Estimated Market Value (BDT)'}
              type="number"
              value={newLot.estimatedValuationBdt}
              onChange={(e) =>
                setNewLot({ ...newLot, estimatedValuationBdt: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Harvest Lot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
