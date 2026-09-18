import React, { useState, useEffect } from 'react';
import {
  Truck,
  Thermometer,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getLogisticsFleetAdmin } from '@/agriplatform/lib/adminApi';
import { LogisticsFleetAdminView } from '@/agriplatform/types';

export const LogisticsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fleet, setFleet] = useState<LogisticsFleetAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadFleet();
  }, []);

  const loadFleet = async () => {
    try {
      setLoading(true);
      const res = await getLogisticsFleetAdmin();
      if (res.success) {
        setFleet(res.data);
      }
    } catch {
      showToast('error', 'Failed to load cold chain logistics telemetry');
    } finally {
      setLoading(false);
    }
  };

  const filtered = fleet.filter((item) => {
    const matchesSearch =
      item.consignmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originHub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destinationDepot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.transitStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCargoTons = fleet.reduce((acc, f) => acc + f.cargoWeightKg, 0) / 1000;
  const inTransitCount = fleet.filter((f) => f.transitStatus === 'On Route').length;
  const delayedCount = fleet.filter((f) => f.transitStatus === 'Delayed').length;

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
          <h2 className="text-lg font-bold text-slate-900">National Agro-Freight & Cold Chain Logistics Fleet</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time IoT reefer telemetry, temperature logger compliance, and inter-district freight dispatch monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadFleet}>
            Ping GPS Sensors
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Cargo Volume</span>
          <span className="text-lg font-black text-slate-900">{totalCargoTons.toFixed(1)} Metric Tons</span>
          <span className="text-[10px] text-slate-500 block">Across scheduled freights</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Fleet In Transit</span>
          <span className="text-lg font-black text-blue-600">{inTransitCount} En Route</span>
          <span className="text-[10px] text-slate-500 block">Active highway dispatches</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Cold Chain Integrity</span>
          <span className="text-lg font-black text-emerald-700">96.8%</span>
          <span className="text-[10px] text-emerald-600 block">Temperature within band</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Traffic / Weather Delays</span>
          <span className="text-lg font-black text-amber-600">{delayedCount}</span>
          <span className="text-[10px] text-slate-500 block">Escrow hold adjusted</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search consignment, origin, destination, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
        >
          <option value="All">All Transit Statuses</option>
          <option value="On Route">On Route</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Delayed">Delayed</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.consignmentCode}</h3>
                    <Badge
                      variant={
                        item.transitStatus === 'Delivered'
                          ? 'success'
                          : item.transitStatus === 'Delayed'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {item.transitStatus}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500">{item.vehicleType}</span>
                </div>

                <Badge
                  variant={
                    item.coldChainIntegrity === 'Optimal'
                      ? 'success'
                      : item.coldChainIntegrity === 'Warning'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {item.coldChainIntegrity}
                </Badge>
              </div>

              {/* Route */}
              <div className="p-3 bg-slate-50 rounded-xl my-2 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{item.originHub}</span>
                </div>
                <div className="pl-5 text-slate-400 text-[10px]">↓ Dedicated Highway Transit Corridor</div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{item.destinationDepot}</span>
                </div>
              </div>

              {/* Live IoT Sensor Stats */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl mb-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Live Cargo Temp</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                    {item.temperatureCelsius}°C
                  </div>
                  <span className="text-[10px] text-slate-500">{item.targetTempRange}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Cargo Weight</span>
                  <div className="font-mono font-bold text-slate-900">
                    {(item.cargoWeightKg / 1000).toFixed(1)} Tons
                  </div>
                  <span className="text-[10px] text-slate-500">{item.cargoDescription}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Driver: <strong>{item.driverName}</strong></span>
                  <span className="font-mono text-slate-500">{item.driverPhone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ETA: {item.estimatedArrival}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => showToast('info', `Pinged driver ${item.driverName} - GPS signal updated`)}
              >
                Track Unit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
