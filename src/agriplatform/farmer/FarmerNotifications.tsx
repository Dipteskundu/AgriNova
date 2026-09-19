import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
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
import { useLanguage } from '@/agriplatform/lib/LanguageContext';

export const FarmerNotifications: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
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
        showToast('error', tr('Failed to retrieve notifications'));
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
        showToast('info', tr('Notification marked as read'));
      }
    } catch {
      showToast('error', tr('Failed to update notification'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast('success', tr('All notifications marked as read'));
      }
    } catch {
      showToast('error', tr('Failed to mark all as read'));
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
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'bn' ? 'বিজ্ঞপ্তি ও জরুরি কৃষি সংকেত' : 'Notifications & Agronomic Alerts'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {unreadCount > 0 ? (
              <span className="text-amber-700 font-semibold">
                {language === 'bn'
                  ? `${unreadCount} টি অপঠিত সংকেত মনোযোগ দাবি করছে`
                  : `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''} requiring attention`}
              </span>
            ) : (
              language === 'bn'
                ? 'সব কাজের সময়সূচি, বাজার দর ও আবহাওয়া সংকেত স্বাভাবিক রয়েছে'
                : 'All farm schedules, market prices, and weather alerts are up to date'
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
              {language === 'bn' ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark All as Read'}
            </Button>
          )}

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">{language === 'bn' ? `সকল ধরন (${notifications.length})` : `All Types (${notifications.length})`}</option>
            <option value="weather">{language === 'bn' ? 'আবহাওয়া সংকেত' : 'Weather Alerts'}</option>
            <option value="crop_schedule">{language === 'bn' ? 'ফসল পরিচর্যা সময়সূচি' : 'Crop Schedule'}</option>
            <option value="market_price">{language === 'bn' ? 'বাজার দর' : 'Market Prices'}</option>
            <option value="subsidy">{language === 'bn' ? 'সরকারি প্রণোদনা' : 'Government Subsidy'}</option>
            <option value="inspection">{language === 'bn' ? 'পরিদর্শন ও মান যাচাই' : 'Inspection & Quality'}</option>
            <option value="system">{language === 'bn' ? 'সিস্টেম বার্তা' : 'System Notices'}</option>
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
                        {language === 'bn'
                          ? item.priority === 'high' ? 'জরুরি'
                            : item.priority === 'medium' ? 'মাঝারি'
                            : 'সাধারণ'
                          : item.priority.toUpperCase()}
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
                    {language === 'bn' ? 'মুছে ফেলুন' : 'Dismiss'}
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
