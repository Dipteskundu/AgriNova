import React, { useState, useEffect } from 'react';
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
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getAdminAdvisories, publishAdvisory } from '@/agriplatform/lib/adminApi';
import { AgronomicAdvisory } from '@/agriplatform/types';

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
        showToast('error', 'Failed to load agronomic advisories');
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
        showToast('success', 'Advisory published to farmer networks & SMS gateway');
      }
    } catch {
      showToast('error', 'Failed to broadcast advisory');
    }
  };

  const filtered =
    filterSeverity === 'All'
      ? advisories
      : advisories.filter((a) => a.severity === filterSeverity);

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
          <h2 className="text-lg font-bold text-slate-900">Agronomic Advisory & Pest Warning Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast emergency blight notices, fertilization timing, and water management bulletins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Publish New Advisory
          </Button>
        </div>
      </div>

      {/* Advisories Grid */}
      <div className="space-y-4">
        {filtered.map((adv) => (
          <Card key={adv.id} className="hover:border-slate-300 transition-all">
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
                  {adv.severity.toUpperCase()} RISK
                </Badge>
                <Badge variant="neutral">{adv.category}</Badge>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">ID: {adv.id}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{adv.title}</h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 mb-3">
              <span>Target Crops: <strong className="text-slate-700">{adv.targetCrops.join(', ')}</strong></span>
              <span>Districts: <strong className="text-slate-700">{adv.targetDistricts.join(', ')}</strong></span>
              <span>Valid Until: <strong className="text-slate-700">{adv.validUntil}</strong></span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {adv.advisoryText}
            </p>

            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Actionable Field Protocol
              </span>
              <ul className="space-y-1">
                {adv.recommendedTreatments.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Issuing Body: {adv.issuingAuthority}</span>
              <span>Issued: {adv.issueDate}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compose Agronomic Bulletin"
        subtitle="Will be pushed to all farmers growing target crops in selected districts"
        maxWidth="lg"
      >
        <form onSubmit={handlePublish} className="space-y-3">
          <FormInput
            id="title"
            label="Advisory Title"
            placeholder="e.g. Rice Blast Fungicide Alert"
            value={newAdvisory.title}
            onChange={(e) => setNewAdvisory({ ...newAdvisory, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="severity"
              label="Severity"
              value={newAdvisory.severity}
              onChange={(e) =>
                setNewAdvisory({
                  ...newAdvisory,
                  severity: e.target.value as AgronomicAdvisory['severity'],
                })
              }
              options={[
                { value: 'urgent', label: 'Urgent (Emergency Action)' },
                { value: 'high', label: 'High (Outbreak Likely)' },
                { value: 'medium', label: 'Medium (Precautionary)' },
                { value: 'low', label: 'Low (Advisory Info)' },
              ]}
            />

            <FormSelect
              id="category"
              label="Advisory Category"
              value={newAdvisory.category}
              onChange={(e) =>
                setNewAdvisory({
                  ...newAdvisory,
                  category: e.target.value as AgronomicAdvisory['category'],
                })
              }
              options={[
                { value: 'Pest Alert', label: 'Pest Alert' },
                { value: 'Weather Advisory', label: 'Weather Advisory' },
                { value: 'Nutrient Management', label: 'Nutrient Management' },
                { value: 'Irrigation Timing', label: 'Irrigation Timing' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="targetCrops"
              label="Target Crops (comma-separated)"
              value={newAdvisory.targetCrops}
              onChange={(e) => setNewAdvisory({ ...newAdvisory, targetCrops: e.target.value })}
              required
            />
            <FormInput
              id="targetDistricts"
              label="Target Districts (comma-separated)"
              value={newAdvisory.targetDistricts}
              onChange={(e) => setNewAdvisory({ ...newAdvisory, targetDistricts: e.target.value })}
              required
            />
          </div>

          <FormTextarea
            id="advisoryText"
            label="Agronomic Advisory Details"
            placeholder="Describe climatic conditions, pest vectors, and early symptoms..."
            value={newAdvisory.advisoryText}
            onChange={(e) => setNewAdvisory({ ...newAdvisory, advisoryText: e.target.value })}
            required
            rows={3}
          />

          <FormTextarea
            id="recommendedTreatments"
            label="Recommended Field Treatments (one per line)"
            placeholder="Spray azoxystrobin @ 1ml/L&#10;Drain standing water..."
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
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Send}>
              Publish & Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
