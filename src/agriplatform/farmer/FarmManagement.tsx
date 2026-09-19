import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  Trees,
  Plus,
  MapPin,
  Droplets,
  Layers,
  Compass,
  CheckCircle2,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getFarms, createFarm } from '@/agriplatform/lib/farmerApi';
import { Farm } from '@/agriplatform/types';

export const FarmManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    totalAreaAcres: 5.0,
    soilClassification: 'Alluvial Loam',
    irrigationType: 'Deep Tube Well' as Farm['irrigationType'],
    waterSource: 'Solar Powered Submersible',
    latitude: 24.67,
    longitude: 89.41,
    status: 'active' as Farm['status'],
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getFarms();
        if (res.success) {
          setFarms(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load farms'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createFarm({
        name: newFarm.name,
        location: newFarm.location,
        totalAreaAcres: Number(newFarm.totalAreaAcres),
        soilClassification: newFarm.soilClassification,
        irrigationType: newFarm.irrigationType,
        waterSource: newFarm.waterSource,
        latitude: Number(newFarm.latitude),
        longitude: Number(newFarm.longitude),
        status: newFarm.status,
      });
      if (res.success) {
        setFarms([res.data, ...farms]);
        setIsAddModalOpen(false);
        setNewFarm({
          name: '',
          location: '',
          totalAreaAcres: 5.0,
          soilClassification: 'Alluvial Loam',
          irrigationType: 'Deep Tube Well',
          waterSource: 'Solar Powered Submersible',
          latitude: 24.67,
          longitude: 89.41,
          status: 'active',
        });
        showToast('success', tr('New farm registered successfully'));
      }
    } catch {
      showToast('error', tr('Failed to create farm'));
    }
  };

  const totalAcres = farms.reduce((acc, f) => acc + f.totalAreaAcres, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 p-5">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{tr('Farm Estates & Landholdings')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{tr('Total of')}{farms.length}{tr('distinct farm parcels covering')}{' '}
            <span className="font-semibold text-emerald-700">{totalAcres}{tr('Total Acres')}</span>.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >{tr('Register New Farm')}</Button>
      </div>

      {/* Grid of Farms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Trees className="w-5 h-5" />
                </div>
                <Badge variant={farm.status === 'active' ? 'success' : 'neutral'}>
                  {farm.status === 'active' ? 'Active Cultivation' : 'Fallow'}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">{farm.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{farm.location}</span>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />{tr('Area')}</span>
                  <span className="font-bold text-slate-800">{farm.totalAreaAcres}{tr('Acres')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-slate-400" />{tr('Irrigation')}</span>
                  <span className="font-semibold text-slate-700">{farm.irrigationType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{tr('Water Source')}</span>
                  <span className="text-slate-600 truncate max-w-[140px]">{farm.waterSource}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{tr('Soil Type')}</span>
                  <span className="text-slate-700 font-medium">{farm.soilClassification}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />{tr('GPS Coords')}</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {farm.latitude}, {farm.longitude}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">{tr('Since')}{farm.registeredDate}</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {farm.activeFieldsCount}{tr('Active Plots')}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Farm Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={tr('Register New Farm Estate')}
        subtitle={tr('Specify land coordinates, irrigation systems, and soil classification')}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFarm} className="space-y-4">
          <FormInput
            id="farmName"
            label={tr('Farm Estate Name')}
            placeholder={tr('e.g. Karatoya South Agro Farm')}
            value={newFarm.name}
            onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
            required
          />
          <FormInput
            id="farmLocation"
            label={tr('Geographic Location / Village')}
            placeholder={tr('e.g. Garidaha, Sherpur, Bogura')}
            value={newFarm.location}
            onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="totalAreaAcres"
              label={tr('Total Land Area (Acres)')}
              type="number"
              step="0.1"
              value={newFarm.totalAreaAcres}
              onChange={(e) => setNewFarm({ ...newFarm, totalAreaAcres: Number(e.target.value) })}
              required
            />
            <FormSelect
              id="irrigationType"
              label={tr('Primary Irrigation Infrastructure')}
              value={newFarm.irrigationType}
              onChange={(e) => setNewFarm({ ...newFarm, irrigationType: e.target.value as Farm['irrigationType'] })}
              options={[
                { value: 'Deep Tube Well', label: tr('Deep Tube Well') },
                { value: 'Drip', label: tr('Precision Drip Grid') },
                { value: 'Canal', label: tr('River/Canal Gravity') },
                { value: 'Sprinkler', label: tr('Sprinkler Set') },
                { value: 'Rainfed', label: tr('Rainfed') },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="waterSource"
              label={tr('Water Supply Source')}
              placeholder={tr('e.g. Solar Tube Well / Karatoya Canal')}
              value={newFarm.waterSource}
              onChange={(e) => setNewFarm({ ...newFarm, waterSource: e.target.value })}
              required
            />
            <FormInput
              id="soilClassification"
              label={tr('Soil Classification')}
              placeholder={tr('e.g. Clay Loam / Sandy Alluvium')}
              value={newFarm.soilClassification}
              onChange={(e) => setNewFarm({ ...newFarm, soilClassification: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="lat"
              label={tr('Latitude')}
              type="number"
              step="0.0001"
              value={newFarm.latitude}
              onChange={(e) => setNewFarm({ ...newFarm, latitude: Number(e.target.value) })}
              required
            />
            <FormInput
              id="lng"
              label={tr('Longitude')}
              type="number"
              step="0.0001"
              value={newFarm.longitude}
              onChange={(e) => setNewFarm({ ...newFarm, longitude: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >{tr('Cancel')}</Button>
            <Button type="submit" variant="primary" size="sm">{tr('Save Farm Estate')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
