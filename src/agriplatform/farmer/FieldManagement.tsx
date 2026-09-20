import React, { useState, useEffect, useMemo } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  Grid3X3,
  Plus,
  Droplets,
  Activity,
  Calendar,
  Sparkles,
  Gauge,
  CheckCircle2,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getFields, getFarms, createField } from '@/agriplatform/lib/farmerApi';
import { Field, Farm } from '@/agriplatform/types';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';

export const FieldManagement: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newField, setNewField] = useState({
    farmId: '',
    name: '',
    sizeAcres: 2.5,
    currentCrop: '',
    soilPh: 6.5,
    nitrogenLevelKgPerHa: 130,
    phosphorusLevelKgPerHa: 22,
    potassiumLevelKgPerHa: 110,
    moisturePercentage: 30,
    ndviScore: 0.75,
    irrigationStatus: 'Optimal' as Field['irrigationStatus'],
    status: 'cultivated' as Field['status'],
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [fieldsRes, farmsRes] = await Promise.all([getFields(), getFarms()]);
        if (fieldsRes.success && farmsRes.success) {
          setFields(fieldsRes.data);
          setFarms(farmsRes.data);
          if (farmsRes.data.length > 0) {
            setNewField((prev) => ({ ...prev, farmId: farmsRes.data[0].id }));
          }
        }
      } catch {
        showToast('error', tr('Failed to load fields'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const filteredFields = useMemo(() => {
    if (selectedFarmFilter === 'All') return fields;
    return fields.filter((f) => f.farmId === selectedFarmFilter);
  }, [fields, selectedFarmFilter]);

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    const farm = farms.find((f) => f.id === newField.farmId);
    try {
      const res = await createField({
        farmId: newField.farmId,
        farmName: farm?.name || 'Green Valley Agro',
        name: newField.name,
        sizeAcres: Number(newField.sizeAcres),
        currentCrop: newField.currentCrop || undefined,
        soilPh: Number(newField.soilPh),
        nitrogenLevelKgPerHa: Number(newField.nitrogenLevelKgPerHa),
        phosphorusLevelKgPerHa: Number(newField.phosphorusLevelKgPerHa),
        potassiumLevelKgPerHa: Number(newField.potassiumLevelKgPerHa),
        moisturePercentage: Number(newField.moisturePercentage),
        ndviScore: Number(newField.ndviScore),
        irrigationStatus: newField.irrigationStatus,
        status: newField.status,
      });
      if (res.success) {
        setFields([res.data, ...fields]);
        setIsAddModalOpen(false);
        showToast('success', tr('Field plot created successfully'));
      }
    } catch {
      showToast('error', tr('Failed to create field'));
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
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'bn' ? 'জমির প্লট ও মাটির পুষ্টি উপাদান' : 'Field & Plot Telemetry'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? `মোট ${fields.length} টি প্লটের মাটির পিএইচ (pH), আর্দ্রতা ও নাইট্রোজেন-ফসফরাস-পটাশিয়াম মাত্রা।`
              : `Monitoring ${fields.length} individual crop plots, real-time soil NPK, pH, moisture, and NDVI health.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFarmFilter}
            onChange={(e) => setSelectedFarmFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">{language === 'bn' ? `সকল খামার (${fields.length} প্লট)` : `All Farms (${fields.length} plots)`}</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {tr(farm.name)}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            {language === 'bn' ? '+ নতুন প্লট যোগ করুন' : 'Add Field Plot'}
          </Button>
        </div>
      </div>

      {/* Plots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFields.map((field) => (
          <Card key={field.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <Grid3X3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tr(field.name)}</h3>
                    <p className="text-[11px] text-slate-400">{tr(field.farmName)}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    field.status === 'cultivated'
                      ? 'success'
                      : field.status === 'prepared'
                      ? 'info'
                      : 'warning'
                  }
                >
                  {language === 'bn'
                    ? field.status === 'cultivated' ? 'চাষকৃত'
                      : field.status === 'prepared' ? 'প্রস্তুতকৃত'
                      : 'পতিত জমি'
                    : field.status}
                </Badge>
              </div>

              {/* Crop & Acreage */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'বর্তমান ফসল' : 'Current Crop'}
                  </span>
                  <p className="font-semibold text-slate-800">
                    {field.currentCrop ? tr(field.currentCrop) : (language === 'bn' ? 'পরিকল্পনাধীন / খালি জমি' : 'Fallow / Soil Resting')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'জমির পরিমাণ' : 'Plot Size'}
                  </span>
                  <p className="font-bold text-emerald-700">
                    {field.sizeAcres} {language === 'bn' ? 'একর' : 'Acres'}
                  </p>
                </div>
              </div>

              {/* Soil Telemetry & NPK Matrix */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'মাটির পিএইচ (pH)' : 'Soil pH'}</span>
                  <span className="font-semibold text-slate-800">
                    {field.soilPh} ({language === 'bn' ? 'আদর্শ সহনীয়' : 'Neutral Optimal'})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'মাটির আর্দ্রতা' : 'Moisture Content'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${field.moisturePercentage}%` }}
                      />
                    </div>
                    <span className="font-semibold text-blue-700">{field.moisturePercentage}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'bn' ? 'ফসলের সতেজতা (NDVI)' : 'NDVI Green Biomass'}
                  </span>
                  <span className="font-mono font-bold text-emerald-700">{field.ndviScore}{tr('/ 1.0')}</span>
                </div>

                {/* NPK Pills */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                    {language === 'bn' ? 'বিদ্যমান পুষ্টি উপাদান (কেজি/হেক্টর)' : 'Available Nutrients (kg/ha)'}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                    <div className="p-1 rounded bg-slate-100 font-medium">
                      N {language === 'bn' ? '(নাইট্রোজেন)' : '(Nitrogen)'}{tr(':')}<span className="font-bold text-slate-800">{field.nitrogenLevelKgPerHa}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-100 font-medium">
                      P {language === 'bn' ? '(ফসফরাস)' : '(Phosphorus)'}{tr(':')}<span className="font-bold text-slate-800">{field.phosphorusLevelKgPerHa}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-100 font-medium">
                      K {language === 'bn' ? '(পটাশিয়াম)' : '(Potassium)'}{tr(':')}<span className="font-bold text-slate-800">{field.potassiumLevelKgPerHa}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">
                {language === 'bn' ? 'পরীক্ষার তারিখ: ' : 'Tested: '}{field.lastSoilTested}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  field.irrigationStatus === 'Optimal'
                    ? 'bg-blue-50 text-blue-700'
                    : field.irrigationStatus === 'Needed'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Droplets className="w-3 h-3" />
                {language === 'bn'
                  ? field.irrigationStatus === 'Optimal' ? 'সেচ পর্যাপ্ত'
                    : field.irrigationStatus === 'Needed' ? 'সেচ প্রয়োজন'
                    : field.irrigationStatus === 'Scheduled' ? 'সেচ নির্ধারিত'
                    : 'অতিরিক্ত আর্দ্র'
                  : field.irrigationStatus}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Field Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'bn' ? 'নতুন জমির প্লট যোগ করুন' : 'Add New Field Plot'}
        subtitle={language === 'bn' ? 'মাটির উপাদান, জমির পরিমাণ ও ফসলের তথ্য দিন' : 'Specify soil chemistry, current crop, and acreage'}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateField} className="space-y-4">
          <FormSelect
            id="parentFarm"
            label={language === 'bn' ? 'খামার নির্বাচন করুন' : 'Parent Farm Estate'}
            value={newField.farmId}
            onChange={(e) => setNewField({ ...newField, farmId: e.target.value })}
            options={farms.map((f) => ({ value: f.id, label: `${tr(f.name)} (${tr(f.location)})` }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="plotName"
              label={language === 'bn' ? 'প্লটের নাম বা নম্বর' : 'Field Plot Name / Number'}
              placeholder={language === 'bn' ? 'যেমন: উত্তর মাঠ প্লট-৩' : 'e.g. Plot A4 - South Basin'}
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              required
            />
            <FormInput
              id="sizeAcres"
              label={language === 'bn' ? 'জমির পরিমাণ (একর)' : 'Plot Size (Acres)'}
              type="number"
              step="0.1"
              value={newField.sizeAcres}
              onChange={(e) => setNewField({ ...newField, sizeAcres: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="currentCrop"
              label={language === 'bn' ? 'বর্তমান রোপিত ফসল' : 'Current Planted Crop (Optional)'}
              placeholder={language === 'bn' ? 'যেমন: ব্রি ধান-২৮' : 'e.g. BRRI Dhan-28'}
              value={newField.currentCrop}
              onChange={(e) => setNewField({ ...newField, currentCrop: e.target.value })}
            />
            <FormInput
              id="soilPh"
              label={language === 'bn' ? 'মাটির পিএইচ (pH)' : 'Soil pH Level'}
              type="number"
              step="0.1"
              value={newField.soilPh}
              onChange={(e) => setNewField({ ...newField, soilPh: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'bn' ? 'মাটির পুষ্টি উপাদান (কেজি / হেক্টর)' : 'Soil Nutrients (kg / ha)'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <FormInput
                id="nitrogen"
                label={language === 'bn' ? 'নাইট্রোজেন (N)' : 'Nitrogen (N)'}
                type="number"
                value={newField.nitrogenLevelKgPerHa}
                onChange={(e) => setNewField({ ...newField, nitrogenLevelKgPerHa: Number(e.target.value) })}
                required
              />
              <FormInput
                id="phosphorus"
                label={language === 'bn' ? 'ফসফরাস (P)' : 'Phosphorus (P)'}
                type="number"
                value={newField.phosphorusLevelKgPerHa}
                onChange={(e) => setNewField({ ...newField, phosphorusLevelKgPerHa: Number(e.target.value) })}
                required
              />
              <FormInput
                id="potassium"
                label={language === 'bn' ? 'পটাশিয়াম (K)' : 'Potassium (K)'}
                type="number"
                value={newField.potassiumLevelKgPerHa}
                onChange={(e) => setNewField({ ...newField, potassiumLevelKgPerHa: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="moisture"
              label={language === 'bn' ? 'আর্দ্রতা (%)' : 'Moisture Level (%)'}
              type="number"
              value={newField.moisturePercentage}
              onChange={(e) => setNewField({ ...newField, moisturePercentage: Number(e.target.value) })}
              required
            />
            <FormSelect
              id="irrigationStatus"
              label={language === 'bn' ? 'সেচের অবস্থা' : 'Irrigation Status'}
              value={newField.irrigationStatus}
              onChange={(e) => setNewField({ ...newField, irrigationStatus: e.target.value as Field['irrigationStatus'] })}
              options={[
                { value: 'Optimal', label: language === 'bn' ? 'সেচ পর্যাপ্ত' : 'Optimal' },
                { value: 'Needed', label: language === 'bn' ? 'সেচ প্রয়োজন' : 'Needed' },
                { value: 'Scheduled', label: language === 'bn' ? 'সেচ নির্ধারিত' : 'Scheduled' },
                { value: 'Over-watered', label: language === 'bn' ? 'অতিরিক্ত আর্দ্র' : 'Over-watered' },
              ]}
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
              {language === 'bn' ? 'প্লট সংরক্ষণ করুন' : 'Save Plot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
