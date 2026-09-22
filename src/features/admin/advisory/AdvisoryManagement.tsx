import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  Bell,
  AlertTriangle,
  Plus,
  Send,
  Calendar,
  MapPin,
  CheckCircle2,
  Trash2,
  Filter,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/ui/FormInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getAdminAdvisories, publishAdvisory } from '@/lib/adminApi';
import { AgronomicAdvisory } from '@/types';

export const AdvisoryManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [advisories, setAdvisories] = useState<AgronomicAdvisory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [newAdvisory, setNewAdvisory] = useState({
    title: '',
    targetCrops: 'Boro Rice, Aman Rice',
    targetDistricts: 'Bogura, Naogaon',
    severity: 'high' as AgronomicAdvisory['severity'],
    category: 'Pest Alert' as AgronomicAdvisory['category'],
    validUntil: '2026-04-15',
    advisoryText: '',
    recommendedTreatments: 'Apply recommended bio-pesticide or approved fungicide',
    issuingAuthority: 'Department of Agricultural Extension (DAE)',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAdminAdvisories();
        if (res.success) {
          setAdvisories(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load agronomic advisories'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await publishAdvisory({
        title: newAdvisory.title,
        targetCrops: newAdvisory.targetCrops.split(',').map((c) => c.trim()),
        targetDistricts: newAdvisory.targetDistricts.split(',').map((d) => d.trim()),
        severity: newAdvisory.severity,
        category: newAdvisory.category,
        validUntil: newAdvisory.validUntil,
        advisoryText: newAdvisory.advisoryText,
        recommendedTreatments: newAdvisory.recommendedTreatments
          .split('\n')
          .filter(Boolean),
        issuingAuthority: newAdvisory.issuingAuthority,
      });

      if (res.success) {
        setAdvisories([res.data, ...advisories]);
        setIsModalOpen(false);
        setNewAdvisory({
          title: '',
          targetCrops: 'Boro Rice, Aman Rice',
          targetDistricts: 'Bogura, Naogaon',
          severity: 'high',
          category: 'Pest Alert',
          validUntil: '2026-04-15',
          advisoryText: '',
          recommendedTreatments: 'Apply recommended bio-pesticide or approved fungicide',
          issuingAuthority: 'Department of Agricultural Extension (DAE)',
        });
        showToast('success', tr('Advisory published to farmer networks & SMS gateway'));
      }
    } catch {
      showToast('error', tr('Failed to broadcast advisory'));
    }
  };

  const filtered =
    filterSeverity === 'All'
      ? advisories
      : advisories.filter((a) => a.severity === filterSeverity);

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('Agronomic Advisory & Pest Warning Control')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Broadcast emergency blight notices, fertilization timing, and water management bulletins.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0] focus:outline-none"
          >
            <option value="All">{tr('All Severities')}</option>
            <option value="urgent">{tr('Urgent')}</option>
            <option value="high">{tr('High')}</option>
            <option value="medium">{tr('Medium')}</option>
            <option value="low">{tr('Low')}</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >{tr('Publish New Advisory')}</Button>
        </div>
      </div>

      {/* Advisories Grid */}
      <div className="space-y-4">
        {filtered.map((adv) => (
          <Card key={adv.id} className="hover:border-slate-300 dark:border-[#333333] transition-all">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    adv.severity === 'urgent'
                      ? 'danger'
                      : adv.severity === 'high'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {adv.severity.toUpperCase()}{tr('RISK')}</Badge>
                <Badge variant="neutral">{adv.category}</Badge>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">{tr('ID:')}{adv.id}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-[#f0f0f0]">{adv.title}</h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-[#a0a0a0] mt-1 mb-3">
              <span>{tr('Target Crops:')}<strong className="text-slate-700 dark:text-[#999999]">{adv.targetCrops.join(', ')}</strong></span>
              <span>{tr('Districts:')}<strong className="text-slate-700 dark:text-[#999999]">{adv.targetDistricts.join(', ')}</strong></span>
              <span>{tr('Valid Until:')}<strong className="text-slate-700 dark:text-[#999999]">{adv.validUntil}</strong></span>
            </div>

            <p className="text-xs text-slate-700 dark:text-[#999999] leading-relaxed bg-slate-50 dark:bg-[#111111]/60 p-3 rounded-lg border border-slate-100">
              {adv.advisoryText}
            </p>

            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0a0] uppercase block mb-1">{tr('Actionable Field Protocol')}</span>
              <ul className="space-y-1">
                {adv.recommendedTreatments.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-[#999999] flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">{tr('•')}</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{tr('Issuing Body:')}{adv.issuingAuthority}</span>
              <span>{tr('Issued:')}{adv.issueDate}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tr('Compose Agronomic Bulletin')}
        subtitle={tr('Will be pushed to all farmers growing target crops in selected districts')}
        maxWidth="lg"
      >
        <form onSubmit={handlePublish} className="space-y-3">
          <FormInput
            id="title"
            label={tr('Advisory Title')}
            placeholder={tr('e.g. Rice Blast Fungicide Alert')}
            value={newAdvisory.title}
            onChange={(e) => setNewAdvisory({ ...newAdvisory, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSelect
              id="severity"
              label={tr('Severity')}
              value={newAdvisory.severity}
              onChange={(e) =>
                setNewAdvisory({
                  ...newAdvisory,
                  severity: e.target.value as AgronomicAdvisory['severity'],
                })
              }
              options={[
                { value: 'urgent', label: tr('Urgent (Emergency Action)') },
                { value: 'high', label: tr('High (Outbreak Likely)') },
                { value: 'medium', label: tr('Medium (Precautionary)') },
                { value: 'low', label: tr('Low (Advisory Info)') },
              ]}
            />

            <FormSelect
              id="category"
              label={tr('Advisory Category')}
              value={newAdvisory.category}
              onChange={(e) =>
                setNewAdvisory({
                  ...newAdvisory,
                  category: e.target.value as AgronomicAdvisory['category'],
                })
              }
              options={[
                { value: 'Pest Alert', label: tr('Pest Alert') },
                { value: 'Weather Advisory', label: tr('Weather Advisory') },
                { value: 'Nutrient Management', label: tr('Nutrient Management') },
                { value: 'Irrigation Timing', label: tr('Irrigation Timing') },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="targetCrops"
              label={tr('Target Crops (comma-separated)')}
              value={newAdvisory.targetCrops}
              onChange={(e) => setNewAdvisory({ ...newAdvisory, targetCrops: e.target.value })}
              required
            />
            <FormInput
              id="targetDistricts"
              label={tr('Target Districts (comma-separated)')}
              value={newAdvisory.targetDistricts}
              onChange={(e) => setNewAdvisory({ ...newAdvisory, targetDistricts: e.target.value })}
              required
            />
          </div>

          <FormTextarea
            id="advisoryText"
            label={tr('Agronomic Advisory Details')}
            placeholder={tr('Describe climatic conditions, pest vectors, and early symptoms...')}
            value={newAdvisory.advisoryText}
            onChange={(e) => setNewAdvisory({ ...newAdvisory, advisoryText: e.target.value })}
            required
            rows={3}
          />

          <FormTextarea
            id="recommendedTreatments"
            label={tr('Recommended Field Treatments (one per line)')}
            placeholder={tr('Spray azoxystrobin @ 1ml/L Drain standing water...')}
            value={newAdvisory.recommendedTreatments}
            onChange={(e) =>
              setNewAdvisory({ ...newAdvisory, recommendedTreatments: e.target.value })
            }
            required
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >{tr('Cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" icon={Send}>{tr('Publish & Broadcast')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
