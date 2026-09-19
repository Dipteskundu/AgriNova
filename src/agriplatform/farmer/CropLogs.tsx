import React, { useState, useEffect, useMemo } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  ClipboardList,
  Plus,
  Filter,
  DollarSign,
  CloudSun,
  UserCheck,
  Calendar,
  Layers,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getCropLogs, getCropBatches, addCropLog } from '@/agriplatform/lib/farmerApi';
import { CropLog, CropBatch } from '@/agriplatform/types';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';

export const CropLogs: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<CropLog[]>([]);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    cropBatchId: '',
    activityType: 'Fertilizer Application' as CropLog['activityType'],
    details: '',
    inputUsed: '',
    dosageQuantity: '',
    costIncurred: 0,
    operatorName: 'Mohiuddin Khan',
    weatherConditionAtApplication: 'Clear skies, 29°C',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [logsRes, batchesRes] = await Promise.all([getCropLogs(), getCropBatches()]);
        if (logsRes.success && batchesRes.success) {
          setLogs(logsRes.data);
          setCropBatches(batchesRes.data);
          if (batchesRes.data.length > 0) {
            setNewLog((prev) => ({ ...prev, cropBatchId: batchesRes.data[0].id }));
          }
        }
      } catch {
        showToast('error', tr('Failed to load crop activity logs'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const filteredLogs = useMemo(() => {
    if (selectedTypeFilter === 'All') return logs;
    return logs.filter((l) => l.activityType === selectedTypeFilter);
  }, [logs, selectedTypeFilter]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const batch = cropBatches.find((b) => b.id === newLog.cropBatchId);
    try {
      const res = await addCropLog({
        cropBatchId: newLog.cropBatchId,
        cropName: batch?.cropName || 'Field Crop',
        fieldName: batch?.fieldName || 'Plot A1',
        activityType: newLog.activityType,
        details: newLog.details,
        inputUsed: newLog.inputUsed || undefined,
        dosageQuantity: newLog.dosageQuantity || undefined,
        costIncurred: Number(newLog.costIncurred),
        operatorName: newLog.operatorName,
        weatherConditionAtApplication: newLog.weatherConditionAtApplication,
      });
      if (res.success) {
        setLogs([res.data, ...logs]);
        setIsAddModalOpen(false);
        setNewLog({
          cropBatchId: cropBatches[0]?.id || '',
          activityType: 'Fertilizer Application',
          details: '',
          inputUsed: '',
          dosageQuantity: '',
          costIncurred: 0,
          operatorName: 'Mohiuddin Khan',
          weatherConditionAtApplication: 'Clear skies, 29°C',
        });
        showToast('success', tr('Crop activity log saved to permanent audit ledger'));
      }
    } catch {
      showToast('error', tr('Failed to save activity log'));
    }
  };

  const totalCost = filteredLogs.reduce((acc, l) => acc + l.costIncurred, 0);

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
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'bn' ? 'কাজের ডায়েরি ও ফিল্ড লগ' : 'Crop Activity Diary & Field Logs'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? `মোট ${logs.length} টি কাজের হিসাব সংরক্ষিত। মোট ব্যয়: `
              : `Total ${logs.length} activities logged. Total Expenses: `}
            <span className="font-bold text-emerald-700">৳{totalCost.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">
              {language === 'bn' ? `সব ধরনের কাজ (${logs.length})` : `All Activities (${logs.length})`}
            </option>
            <option value="Fertilizer Application">
              {language === 'bn' ? 'সার প্রয়োগ' : 'Fertilizer Application'}
            </option>
            <option value="Pest & Disease Spray">
              {language === 'bn' ? 'কীটনাশক স্প্রে' : 'Pest & Disease Spray'}
            </option>
            <option value="Weeding">
              {language === 'bn' ? 'আগাছা দমন' : 'Weeding & Hoeing'}
            </option>
            <option value="Irrigation">
              {language === 'bn' ? 'সেচ পরিচালনা' : 'Irrigation'}
            </option>
            <option value="Soil Scouting">
              {language === 'bn' ? 'মাটি ও মাঠ পরিদর্শন' : 'Soil Scouting'}
            </option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            {language === 'bn' ? '+ নতুন কাজ লিখুন' : '+ Log Activity'}
          </Button>
        </div>
      </div>

      {/* Log Feed Items */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <ClipboardList className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{log.activityType}</h3>
                    <Badge variant="neutral">{log.date}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {log.cropName}{tr('•')}<span className="text-slate-700">{log.fieldName}</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-sm font-bold text-emerald-700">
                  {log.costIncurred > 0 ? `৳${log.costIncurred.toLocaleString()}` : (language === 'bn' ? 'বিনা খরচে' : 'Cost-free')}
                </span>
                <p className="text-[10px] text-slate-400">{language === 'bn' ? 'খরচ হয়েছে' : 'Expense Incurred'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 mt-3 leading-relaxed">{log.details}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {language === 'bn' ? 'ব্যবহৃত উপকরণ: ' : 'Input: '}
                  <strong className="text-slate-700">{log.inputUsed || (language === 'bn' ? 'নেই' : 'None')}</strong>
                  {log.dosageQuantity ? ` (${log.dosageQuantity})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {language === 'bn' ? 'পরিচালক: ' : 'Operator: '}
                  <strong className="text-slate-700">{log.operatorName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{log.weatherConditionAtApplication}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Log Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'bn' ? 'নতুন কাজের তথ্য সংরক্ষণ করুন' : 'Record Field Activity Log'}
        subtitle={language === 'bn' ? 'সার প্রয়োগ, স্প্রে, সেচ বা আগাছা দমনের হিসাব লিখে রাখুন' : 'Log fertilizer application, spraying, weeding or irrigation'}
        maxWidth="lg"
      >
        <form onSubmit={handleAddLog} className="space-y-4">
          <FormSelect
            id="batchSelect"
            label={language === 'bn' ? 'ফসল ও জমির প্লট নির্বাচন করুন' : 'Target Crop Batch & Field Plot'}
            value={newLog.cropBatchId}
            onChange={(e) => setNewLog({ ...newLog, cropBatchId: e.target.value })}
            options={cropBatches.map((b) => ({
              value: b.id,
              label: `${b.cropName} (${b.variety}) - ${b.fieldName}`,
            }))}
          />

          <FormSelect
            id="activityType"
            label={language === 'bn' ? 'কাজের ধরণ' : 'Activity Classification'}
            value={newLog.activityType}
            onChange={(e) =>
              setNewLog({ ...newLog, activityType: e.target.value as CropLog['activityType'] })
            }
            options={[
              { value: 'Fertilizer Application', label: language === 'bn' ? 'সার প্রয়োগ' : 'Fertilizer Application' },
              { value: 'Pest & Disease Spray', label: language === 'bn' ? 'কীটনাশক স্প্রে' : 'Pest & Disease Spray' },
              { value: 'Weeding', label: language === 'bn' ? 'আগাছা দমন' : 'Weeding & Intercultural Hoeing' },
              { value: 'Irrigation', label: language === 'bn' ? 'সেচ পরিচালনা' : 'Irrigation Run' },
              { value: 'Soil Scouting', label: language === 'bn' ? 'মাটি ও মাঠ পরিদর্শন' : 'Soil Scouting & Root Check' },
              { value: 'Growth Observation', label: language === 'bn' ? 'ফসল বৃদ্ধি পর্যবেক্ষণ' : 'Growth Observation & Phenology' },
            ]}
          />

          <FormTextarea
            id="details"
            label={language === 'bn' ? 'কাজের বিস্তারিত বিবরণ ও মন্তব্য' : 'Activity Details & Agronomic Notes'}
            placeholder={language === 'bn' ? 'কাজের ধরণ, পর্যবেক্ষণ বা মাত্রা লিখুন...' : 'Describe method, symptoms observed, or dosage rationale...'}
            value={newLog.details}
            onChange={(e) => setNewLog({ ...newLog, details: e.target.value })}
            required
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="inputUsed"
              label={language === 'bn' ? 'ব্যবহৃত সার / কীটনাশক' : 'Input Material / Chemical'}
              placeholder={language === 'bn' ? 'যেমন: টিএসপি সার / নিম নির্যাস' : 'e.g. MOP Fertilizer / Neem extract'}
              value={newLog.inputUsed}
              onChange={(e) => setNewLog({ ...newLog, inputUsed: e.target.value })}
            />
            <FormInput
              id="dosageQuantity"
              label={language === 'bn' ? 'প্রয়োগের পরিমাণ / মাত্রা' : 'Dosage / Application Rate'}
              placeholder={language === 'bn' ? 'যেমন: ২৫ কেজি/বিঘা' : 'e.g. 35 kg/acre'}
              value={newLog.dosageQuantity}
              onChange={(e) => setNewLog({ ...newLog, dosageQuantity: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="costIncurred"
              label={language === 'bn' ? 'মোট খরচ (টাকা)' : 'Direct Cost Incurred (BDT)'}
              type="number"
              value={newLog.costIncurred}
              onChange={(e) => setNewLog({ ...newLog, costIncurred: Number(e.target.value) })}
            />
            <FormInput
              id="operatorName"
              label={language === 'bn' ? 'কাজের দায়িত্বপ্রাপ্ত ব্যক্তি' : 'Applied By / Field Operator'}
              value={newLog.operatorName}
              onChange={(e) => setNewLog({ ...newLog, operatorName: e.target.value })}
              required
            />
          </div>

          <FormInput
            id="weatherCondition"
            label={language === 'bn' ? 'প্রয়োগকালীন আবহাওয়া' : 'Weather Condition at Application Time'}
            placeholder={language === 'bn' ? 'যেমন: রোদযুক্ত সকাল, ২৮° সেলসিয়াস' : 'e.g. Sunny morning, 28°C, low wind'}
            value={newLog.weatherConditionAtApplication}
            onChange={(e) =>
              setNewLog({ ...newLog, weatherConditionAtApplication: e.target.value })
            }
          />

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
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save to Crop Log'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
