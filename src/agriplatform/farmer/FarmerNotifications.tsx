import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  Calendar,
  CloudRain,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import {
  getFarmerNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
} from '@/agriplatform/lib/farmerApi';
import { FarmerNotification } from '@/agriplatform/types';

export const FarmerNotifications: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<FarmerNotification[]>([]);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getFarmerNotifications();
        if (res.success) {
          setNotifications(res.data);
        }
      } catch {
        showToast('error', 'Failed to retrieve notifications');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        showToast('info', 'Notification marked as read');
      }
    } catch {
      showToast('error', 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast('success', 'All notifications marked as read');
      }
    } catch {
      showToast('error', 'Failed to mark all as read');
    }
  };

  const filtered =
    filterType === 'All'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
          <h2 className="text-lg font-bold text-slate-900">Notifications & Agronomic Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {unreadCount > 0 ? (
              <span className="text-amber-700 font-semibold">{unreadCount} unread alert{unreadCount > 1 ? 's' : ''} requiring attention</span>
            ) : (
              'All farm schedules, market prices, and weather alerts are up to date'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">All Types ({notifications.length})</option>
            <option value="weather">Weather Alerts</option>
            <option value="crop_schedule">Crop Schedule</option>
            <option value="market_price">Market Prices</option>
            <option value="subsidy">Government Subsidy</option>
            <option value="inspection">Inspection & Quality</option>
            <option value="system">System Notices</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.isRead
                  ? 'bg-white border-slate-200/80 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-200/90 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      item.type === 'weather'
                        ? 'bg-amber-100 text-amber-700'
                        : item.type === 'crop_schedule'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.type === 'market_price'
                        ? 'bg-blue-100 text-blue-700'
                        : item.type === 'subsidy'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.type === 'weather' ? (
                      <CloudRain className="w-4 h-4" />
                    ) : item.type === 'crop_schedule' ? (
                      <Calendar className="w-4 h-4" />
                    ) : item.type === 'market_price' ? (
                      <DollarSign className="w-4 h-4" />
                    ) : item.type === 'subsidy' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      )}
                      <Badge
                        variant={
                          item.priority === 'high'
                            ? 'danger'
                            : item.priority === 'medium'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {item.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {!item.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkRead(item.id)}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
