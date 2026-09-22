import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Layers,
  Calendar,
  DollarSign,
  ShieldAlert,
  ChevronRight,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getMasterCrops, createMasterCrop } from '@/lib/adminApi';
import { MasterCrop } from '@/types';

export const CropCatalog: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<MasterCrop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCrop, setNewCrop] = useState({
    cropName: '',
    scientificName: '',
    category: 'Cereal' as MasterCrop['category'],
    recommendedSeason: 'Rabi (Winter)',
    optimalSoilPhRange: '6.0 - 7.0',
    minRainfallMm: 600,
    maxRainfallMm: 1200,
    averageMaturityDays: 120,
    standardYieldKgPerAcre: 2200,
    benchmarkPriceBdtPerKg: 30,
    approvedVarieties: 'BRRI Dhan-28, BRRI Dhan-29',
    pestVulnerabilities: 'Stem Borer, Blast',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getMasterCrops();
        if (res.success) {
          setCrops(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load master crop registry'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createMasterCrop({
        cropName: newCrop.cropName,
        scientificName: newCrop.scientificName,
        category: newCrop.category,
        recommendedSeason: newCrop.recommendedSeason,
        optimalSoilPhRange: newCrop.optimalSoilPhRange,
        minRainfallMm: Number(newCrop.minRainfallMm),
        maxRainfallMm: Number(newCrop.maxRainfallMm),
        averageMaturityDays: Number(newCrop.averageMaturityDays),
        standardYieldKgPerAcre: Number(newCrop.standardYieldKgPerAcre),
        benchmarkPriceBdtPerKg: Number(newCrop.benchmarkPriceBdtPerKg),
        approvedVarieties: newCrop.approvedVarieties.split(',').map((v) => v.trim()),
        pestVulnerabilities: newCrop.pestVulnerabilities.split(',').map((p) => p.trim()),
      });

      if (res.success) {
        setCrops([res.data, ...crops]);
        setIsModalOpen(false);
        showToast('success', tr('New crop taxon added to national registry'));
      }
    } catch {
      showToast('error', tr('Failed to add crop to registry'));
    }
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || crop.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('National Master Crop & Cultivar Catalog')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Standardized agronomic benchmarks, seasonal calendars, and pest resistance indices for Bangladesh.')}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >{tr('Add Master Crop')}</Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search by crop or scientific name...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-900 dark:text-[#f0f0f0]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0]"
        >
          <option value="All">{tr('All Categories')}</option>
          <option value="Cereal">{tr('Cereal')}</option>
          <option value="Pulse">{tr('Pulse')}</option>
          <option value="Oilseed">{tr('Oilseed')}</option>
          <option value="Vegetable">{tr('Vegetable')}</option>
          <option value="Fruit">{tr('Fruit')}</option>
          <option value="Cash Crop">{tr('Cash Crop')}</option>
        </select>
      </div>

      {/* Crops List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <Card key={crop.id} className="flex flex-col justify-between hover:border-slate-300 dark:border-[#333333] transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="success">{crop.category}</Badge>
                <span className="text-[11px] font-mono text-slate-400">{crop.id}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-[#f0f0f0]">{crop.cropName}</h3>
              <p className="text-xs italic text-slate-500 dark:text-[#a0a0a0] mb-3">{crop.scientificName}</p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">{tr('Standard Yield')}</span>
                  <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{crop.standardYieldKgPerAcre.toLocaleString()}{tr('kg/ac')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">{tr('Maturity Days')}</span>
                  <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{crop.averageMaturityDays}{tr('Days')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">{tr('Optimal Soil pH')}</span>
                  <span className="font-medium text-slate-700 dark:text-[#999999]">{crop.optimalSoilPhRange}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">{tr('Benchmark Price')}</span>
                  <span className="font-bold text-emerald-700">৳{crop.benchmarkPriceBdtPerKg}{tr('/kg')}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Approved Cultivars')}</span>
                  <span className="text-slate-700 dark:text-[#999999]">{crop.approvedVarieties.join(', ')}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Pest Vulnerabilities')}</span>
                  <span className="text-rose-600 font-medium">{crop.pestVulnerabilities.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#a0a0a0]">
              <span>{tr('Season:')}<strong>{crop.recommendedSeason}</strong></span>
              <span>{crop.minRainfallMm}{tr('–')}{crop.maxRainfallMm}{tr('mm rain')}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tr('Register Master Crop Variety')}
        subtitle={tr('DAE official agronomic taxon baseline')}
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="cropName"
              label={tr('Crop Name')}
              placeholder={tr('e.g. Maize (Corn)')}
              value={newCrop.cropName}
              onChange={(e) => setNewCrop({ ...newCrop, cropName: e.target.value })}
              required
            />
            <FormInput
              id="scientificName"
              label={tr('Botanical / Scientific Name')}
              placeholder={tr('e.g. Zea mays')}
              value={newCrop.scientificName}
              onChange={(e) => setNewCrop({ ...newCrop, scientificName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSelect
              id="category"
              label={tr('Agronomic Category')}
              value={newCrop.category}
              onChange={(e) =>
                setNewCrop({ ...newCrop, category: e.target.value as MasterCrop['category'] })
              }
              options={[
                { value: 'Cereal', label: tr('Cereal') },
                { value: 'Pulse', label: tr('Pulse') },
                { value: 'Oilseed', label: tr('Oilseed') },
                { value: 'Vegetable', label: tr('Vegetable') },
                { value: 'Fruit', label: tr('Fruit') },
                { value: 'Cash Crop', label: tr('Cash Crop') },
              ]}
            />
            <FormInput
              id="recommendedSeason"
              label={tr('Recommended Season')}
              placeholder={tr('e.g. Rabi (Winter)')}
              value={newCrop.recommendedSeason}
              onChange={(e) => setNewCrop({ ...newCrop, recommendedSeason: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput
              id="standardYield"
              label={tr('Yield (Kg / Acre)')}
              type="number"
              value={newCrop.standardYieldKgPerAcre}
              onChange={(e) =>
                setNewCrop({ ...newCrop, standardYieldKgPerAcre: Number(e.target.value) })
              }
              required
            />
            <FormInput
              id="maturity"
              label={tr('Maturity (Days)')}
              type="number"
              value={newCrop.averageMaturityDays}
              onChange={(e) =>
                setNewCrop({ ...newCrop, averageMaturityDays: Number(e.target.value) })
              }
              required
            />
            <FormInput
              id="price"
              label="Benchmark ৳/Kg"
              type="number"
              value={newCrop.benchmarkPriceBdtPerKg}
              onChange={(e) =>
                setNewCrop({ ...newCrop, benchmarkPriceBdtPerKg: Number(e.target.value) })
              }
              required
            />
          </div>

          <FormInput
            id="varieties"
            label={tr('Approved Varieties (comma-separated)')}
            value={newCrop.approvedVarieties}
            onChange={(e) => setNewCrop({ ...newCrop, approvedVarieties: e.target.value })}
            required
          />

          <FormInput
            id="pests"
            label={tr('Pest Vulnerabilities (comma-separated)')}
            value={newCrop.pestVulnerabilities}
            onChange={(e) => setNewCrop({ ...newCrop, pestVulnerabilities: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >{tr('Cancel')}</Button>
            <Button type="submit" variant="primary" size="sm">{tr('Save to Catalog')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
