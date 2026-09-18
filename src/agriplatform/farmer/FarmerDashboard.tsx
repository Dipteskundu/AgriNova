import React, { useEffect, useState } from 'react';
import {
  Trees,
  Sprout,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Droplets,
  Receipt,
  FileText,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getFarmerDashboardSummary, getCropBatches, toggleCalendarTask } from '@/agriplatform/lib/farmerApi';
import { CropBatch, CalendarTask, CropLog, FarmerProfile } from '@/agriplatform/types';
import { FarmerModuleKey } from '@/agriplatform/layout/AppLayout';

interface FarmerDashboardProps {
  onNavigate: (module: FarmerModuleKey) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<CalendarTask[]>([]);
  const [recentLogs, setRecentLogs] = useState<CropLog[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryRes, batchesRes] = await Promise.all([
          getFarmerDashboardSummary(),
          getCropBatches(),
        ]);
        if (summaryRes.success && batchesRes.success) {
          setProfile(summaryRes.data.profile);
          setUpcomingTasks(summaryRes.data.upcomingTasks);
          setRecentLogs(summaryRes.data.recentLogs);
          setCropBatches(batchesRes.data);
        }
      } catch {
        showToast('error', 'Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleTaskToggle = async (taskId: string) => {
    try {
      const res = await toggleCalendarTask(taskId);
      if (res.success) {
        setUpcomingTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
        );
        showToast('success', 'Task status updated');
      }
    } catch {
      showToast('error', 'Could not update task');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-4">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/50 text-emerald-100">
              Sherpur Upazila Hub, Bogura
            </span>
            <span className="text-xs text-emerald-200">• Season: Kharif-2 to Rabi Transition</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back, {profile?.fullName || 'Farmer Mohiuddin'}!
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
            {profile?.totalAcreage} acres under intensive monitoring. 5 active crop batches with
            excellent vegetative health ratings. Moderate rainfall forecasted for Saturday.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('recommendation')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            AI Recommendation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('logs')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
          >
            + Add Field Log
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Land"
          value={`${profile?.totalAcreage || 18.5} Acres`}
          subtitle="Across 3 distinct farms"
          icon={Trees}
          colorScheme="emerald"
          onClick={() => onNavigate('farms')}
        />
        <MetricCard
          title="Active Crop Batches"
          value={cropBatches.length}
          change="+2 new"
          trend="up"
          subtitle="Rice, Maize, Wheat, Mustard, Banana"
          icon={Sprout}
          colorScheme="blue"
          onClick={() => onNavigate('crops')}
        />
        <MetricCard
          title="Projected Yield"
          value="52.7 Tons"
          change="94% Target"
          trend="up"
          subtitle="Estimated market value: ৳1.42M"
          icon={TrendingUp}
          colorScheme="amber"
          onClick={() => onNavigate('profitability')}
        />
        <MetricCard
          title="Scheduled Tasks"
          value={upcomingTasks.filter((t) => !t.isCompleted).length}
          subtitle="2 irrigation checks this week"
          icon={Calendar}
          colorScheme="indigo"
          onClick={() => onNavigate('calendar')}
        />
      </div>

      {/* Two Column Section: Active Crop Status & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Crop Lifecycle Progress */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Active Crop Lifecycle Batches"
              subtitle="Growth stage tracking and estimated harvest timelines"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => onNavigate('crops')}
                >
                  Manage All
                </Button>
              }
            />

            <div className="space-y-3.5">
              {cropBatches.map((crop) => (
                <div
                  key={crop.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{crop.cropName}</h4>
                        <span className="text-xs text-slate-500 font-normal">({crop.variety})</span>
                        <Badge
                          variant={
                            crop.healthRating === 'Excellent'
                              ? 'success'
                              : crop.healthRating === 'Good'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {crop.healthRating}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {crop.fieldName} • Sown: {crop.sowingDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">
                        {crop.growthStage} ({crop.growthProgressPercent}%)
                      </span>
                      <p className="text-[11px] text-slate-400">Harvest: {crop.expectedHarvestDate}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${crop.growthProgressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>Last action: {crop.lastAction}</span>
                    <span>Target: {crop.targetYieldKg.toLocaleString()} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Upcoming Agronomic Tasks & Quick Shortcuts */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Scheduled Tasks"
              subtitle="Agricultural calendar highlights"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate('calendar')}>
                  Full Calendar
                </Button>
              }
            />

            <div className="space-y-2.5">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    task.isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <button
                    className={`mt-0.5 p-0.5 rounded-full border transition-colors ${
                      task.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 text-transparent hover:border-slate-400'
                    }`}
                    aria-label="Toggle completed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.taskTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {task.cropName} • {task.scheduledDate}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Operations Palette */}
          <Card>
            <CardHeader title="Farmer Quick Actions" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('logs')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors flex flex-col gap-1 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Log Spray/Fertilizer</span>
                <span className="text-[10px] text-slate-400">Keep audit trail</span>
              </button>
              <button
                onClick={() => onNavigate('expenses')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors flex flex-col gap-1 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-800">Record Expense</span>
                <span className="text-[10px] text-slate-400">Seed, labor, diesel</span>
              </button>
              <button
                onClick={() => onNavigate('harvest')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors flex flex-col gap-1 cursor-pointer"
              >
                <Droplets className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Log Harvest Lot</span>
                <span className="text-[10px] text-slate-400">Yield & moisture</span>
              </button>
              <button
                onClick={() => onNavigate('weather')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors flex flex-col gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-800">Weather Radar</span>
                <span className="text-[10px] text-slate-400">7-day microclimate</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Field Logs Activity */}
      <Card>
        <CardHeader
          title="Recent Field Operations & Agricultural Logs"
          subtitle="Audit trail of recent fertilizer doses, pest scouting, and field inspections"
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('logs')}>
              View All Logs
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{log.date}</span>
                  <span className="font-semibold text-emerald-700">{log.costIncurred > 0 ? `৳${log.costIncurred}` : 'Routine'}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{log.activityType}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{log.cropName} • {log.fieldName}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{log.details}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>By: {log.operatorName}</span>
                <span>{log.inputUsed || 'Field Observation'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
