import React, { useState, useEffect } from 'react';
import {
  Send,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Trash2,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { FormInput, FormSelect, FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getWeatherData } from '@/agriplatform/lib/farmerApi';
import { WeatherData } from '@/agriplatform/types';

type MicroclimateAlert = WeatherData['microclimateAlerts'][number];

export const WeatherAlertBroadcast: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<MicroclimateAlert[]>([]);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    severity: 'warning' as MicroclimateAlert['severity'],
    message: '',
    actionRequired: '',
    validUntil: 'Tomorrow 18:00 BST',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getWeatherData();
        if (res.success) {
          setActiveAlerts(res.data.microclimateAlerts);
        }
      } catch {
        showToast('error', 'Failed to load meteorological broadcasts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: MicroclimateAlert = {
      id: `ALERT-${Date.now().toString().slice(-4)}`,
      title: broadcastForm.title,
      severity: broadcastForm.severity,
      message: broadcastForm.message,
      actionRequired: broadcastForm.actionRequired,
      validUntil: broadcastForm.validUntil,
    };
    setActiveAlerts([newAlert, ...activeAlerts]);
    setBroadcastForm({
      title: '',
      severity: 'warning',
      message: '',
      actionRequired: '',
      validUntil: 'Tomorrow 18:00 BST',
    });
    showToast(
      'success',
      `Emergency Weather Advisory dispatched across Northern divisions!`
    );
  };

  const handleDismiss = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('info', 'Advisory bulletin expired');
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
          <h2 className="text-lg font-bold text-slate-900">National Agromet & Flash-Flood Broadcast Terminal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time push broadcasting of severe weather, pest outbreaks, and heatwave warnings to farmer dashboards and SMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">BMD Sat-Link Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader
              title="Issue Weather Alert"
              subtitle="Compose and broadcast immediate microclimate advisory"
            />

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <FormInput
                id="title"
                label="Alert Headline"
                placeholder="e.g. Severe Nor'wester (Kalbaishakhi) Storm Warning"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                required
              />

              <FormSelect
                id="severity"
                label="Risk Severity Level"
                value={broadcastForm.severity}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    severity: e.target.value as MicroclimateAlert['severity'],
                  })
                }
                options={[
                  { value: 'advisory', label: 'Advisory (Information / Caution)' },
                  { value: 'warning', label: 'Warning (Moderate Agronomic Hazard)' },
                  { value: 'critical', label: 'Critical (Severe Flash Flood / Cyclone)' },
                ]}
              />

              <FormTextarea
                id="message"
                label="Meteorological Description"
                placeholder="Gusty winds of 50-70 km/h with heavy squalls predicted within the next 12 hours..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
                rows={3}
              />

              <FormTextarea
                id="actionRequired"
                label="Recommended Agronomic Defense"
                placeholder="Suspend harvesting and chemical spraying, secure nursery seedbeds, clear drainage canals..."
                value={broadcastForm.actionRequired}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, actionRequired: e.target.value })
                }
                required
                rows={2}
              />

              <FormInput
                id="validUntil"
                label="Advisory Expiration Window"
                placeholder="e.g. Tomorrow 18:00 BST"
                value={broadcastForm.validUntil}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, validUntil: e.target.value })
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                className="w-full mt-2"
              >
                Transmit Push Broadcast
              </Button>
            </form>
          </Card>
        </div>

        {/* Active Broadcasts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title={`Active Agronomic Bulletins (${activeAlerts.length})`}
              subtitle="Currently transmitting to field officers, farmer portals, and regional SMS gateways"
            />

            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50 border-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          alert.severity === 'critical'
                            ? 'text-rose-600'
                            : alert.severity === 'warning'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'danger'
                            : alert.severity === 'warning'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Dismiss bulletin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>

                  <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase">
                      Required Field Action
                    </span>
                    <span className="text-slate-700">{alert.actionRequired}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {alert.validUntil}
                    </span>
                    <span className="font-mono">ID: {alert.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
