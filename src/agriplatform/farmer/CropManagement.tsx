import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Calendar,
  Layers,
  HeartPulse,
  Clock,
  Sparkles,
  ClipboardList,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getCropBatches, getFields, createCropBatch } from '@/agriplatform/lib/farmerApi';
import { CropBatch, Field } from '@/agriplatform/types';
import { FarmerModuleKey } from '@/agriplatform/layout/AppLayout';

interface CropManagementProps {
  onNavigate?: (module: FarmerModuleKey) => void;
}

export const CropManagement: React.FC<CropManagementProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    fieldId: '',
    cropName: '',
    variety: '',
    category: 'Cereal' as CropBatch['category'],
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    growthStage: 'Germination' as CropBatch['growthStage'],
    targetYieldKg: 4000,
    healthRating: 'Excellent' as CropBatch['healthRating'],
    seedSource: 'BADC Certified Seed Agency',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [batchesRes, fieldsRes] = await Promise.all([getCropBatches(), getFields()]);
        if (batchesRes.success && fieldsRes.success) {
          setCropBatches(batchesRes.data);
          setFields(fieldsRes.data);
          if (fieldsRes.data.length > 0) {
            setNewBatch((prev) => ({ ...prev, fieldId: fieldsRes.data[0].id }));
          }
        }
      } catch {
        showToast('error', 'Failed to load crop batches');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const field = fields.find((f) => f.id === newBatch.fieldId);
    try {
      const res = await createCropBatch({
        fieldId: newBatch.fieldId,
        fieldName: field?.name || 'Green Valley Plot',
        cropName: newBatch.cropName,
        variety: newBatch.variety,
        category: newBatch.category,
        sowingDate: newBatch.sowingDate,
        expectedHarvestDate: newBatch.expectedHarvestDate || '2026-12-30',
        growthStage: newBatch.growthStage,
        targetYieldKg: Number(newBatch.targetYieldKg),
        healthRating: newBatch.healthRating,
        seedSource: newBatch.seedSource,
      });
      if (res.success) {
        setCropBatches([res.data, ...cropBatches]);
        setIsAddModalOpen(false);
        showToast('success', 'Crop batch sown & registered');
      }
    } catch {
      showToast('error', 'Failed to register crop batch');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 p-5">
              <Skeleton className="h-6 w-1/3 mb-3" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Active Crop Batches & Phenological Stages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time vegetative progress, target yields, and scheduled field actions across plots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('logs')}>
              Crop Logs Feed
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Sow New Crop Batch
          </Button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cropBatches.map((crop) => (
          <Card key={crop.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{crop.cropName}</h3>
                    <p className="text-xs text-slate-500">{crop.variety} • {crop.category}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    crop.healthRating === 'Excellent'
                      ? 'success'
                      : crop.healthRating === 'Good'
                      ? 'info'
                      : 'warning'
                  }
                >
                  <HeartPulse className="w-3.5 h-3.5 mr-1" />
                  {crop.healthRating}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Allocated Plot:</span>
                  <span className="font-semibold text-slate-800">{crop.fieldName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Seed Provenance:</span>
                  <span className="text-slate-700">{crop.seedSource}</span>
                </div>
              </div>

              {/* Lifecycle Stage Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Stage: <span className="text-emerald-700">{crop.growthStage}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {crop.growthProgressPercent}% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${crop.growthProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Timeline & Yield */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Sowing Date</span>
                  <span className="font-semibold text-slate-700">{crop.sowingDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Expected Harvest</span>
                  <span className="font-semibold text-slate-700">{crop.expectedHarvestDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Target Harvest</span>
                  <span className="font-bold text-emerald-700">{crop.targetYieldKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Last Activity</span>
                  <span className="text-slate-700 font-medium truncate block">{crop.lastAction}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Batch Code: {crop.id}</span>
              {onNavigate && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={ClipboardList}
                  onClick={() => onNavigate('logs')}
                >
                  Log Operation
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Sow Batch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Sow & Register New Crop Batch"
        subtitle="Bind seed variety to an active field plot"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <FormSelect
            id="fieldId"
            label="Field Plot"
            value={newBatch.fieldId}
            onChange={(e) => setNewBatch({ ...newBatch, fieldId: e.target.value })}
            options={fields.map((f) => ({ value: f.id, label: `${f.name} (${f.sizeAcres} Acres)` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="cropName"
              label="Crop Name"
              placeholder="e.g. Boro Rice"
              value={newBatch.cropName}
              onChange={(e) => setNewBatch({ ...newBatch, cropName: e.target.value })}
              required
            />
            <FormInput
              id="variety"
              label="Variety / Hybrid Code"
              placeholder="e.g. BRRI Dhan-89"
              value={newBatch.variety}
              onChange={(e) => setNewBatch({ ...newBatch, variety: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="category"
              label="Crop Category"
              value={newBatch.category}
              onChange={(e) => setNewBatch({ ...newBatch, category: e.target.value as CropBatch['category'] })}
              options={[
                { value: 'Cereal', label: 'Cereal Grain' },
                { value: 'Pulse', label: 'Pulse / Legume' },
                { value: 'Oilseed', label: 'Oilseed' },
                { value: 'Vegetable', label: 'Vegetable' },
                { value: 'Fruit', label: 'Fruit' },
                { value: 'Cash Crop', label: 'Cash Crop' },
              ]}
            />
            <FormInput
              id="targetYield"
              label="Target Expected Yield (kg)"
              type="number"
              value={newBatch.targetYieldKg}
              onChange={(e) => setNewBatch({ ...newBatch, targetYieldKg: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="sowingDate"
              label="Sowing Date"
              type="date"
              value={newBatch.sowingDate}
              onChange={(e) => setNewBatch({ ...newBatch, sowingDate: e.target.value })}
              required
            />
            <FormInput
              id="harvestDate"
              label="Expected Harvest Window"
              type="date"
              value={newBatch.expectedHarvestDate}
              onChange={(e) => setNewBatch({ ...newBatch, expectedHarvestDate: e.target.value })}
              required
            />
          </div>

          <FormInput
            id="seedSource"
            label="Seed Source & Lot Certification"
            placeholder="e.g. BADC Certified Seed Center"
            value={newBatch.seedSource}
            onChange={(e) => setNewBatch({ ...newBatch, seedSource: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Sown Batch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
