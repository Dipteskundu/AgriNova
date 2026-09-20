import React, { useEffect, useState } from 'react';
import {
  Sprout,
  Calendar,
  CloudSun,
  Trees,
  Receipt,
  TrendingUp,
  PackageCheck,
  Sparkles,
  GitCompare,
  FileText,
  GraduationCap,
  PhoneCall,
  Bell,
  User,
  ArrowRight,
  Check,
  X,
  Phone,
  CheckCircle2,
  ArrowUpRight,
} from '@/components/icons';
import { useToast } from '@/components/shared/Toast';
import { getFarmerDashboardSummary, getCropBatches, toggleCalendarTask } from '@/agriplatform/lib/farmerApi';
import { FarmerProfile, CropBatch, CalendarTask, CropLog } from '@/agriplatform/types';
import { FarmerModuleKey } from '@/agriplatform/layout/AppLayout';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';
import { tr } from '@/agriplatform/lib/localize';

interface FarmerDashboardProps {
  onNavigate: (module: FarmerModuleKey) => void;
}

interface FeatureCardItem {
  id: string;
  moduleKey?: FarmerModuleKey;
  icon: React.ElementType;
  titleBn: string;
  titleEn: string;
  badgeBn: string;
  badgeEn: string;
  descBn: string;
  descEn: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  isHelpline?: boolean;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<CalendarTask[]>([]);
  const [recentLogs, setRecentLogs] = useState<CropLog[]>([]);
  const [selectedCard, setSelectedCard] = useState<FeatureCardItem | null>(null);

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
        showToast('error', language === 'bn' ? 'ড্যাশবোর্ড তথ্য লোড হতে সমস্যা হয়েছে' : 'Error loading dashboard data');
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
        showToast('success', language === 'bn' ? 'কাজের স্ট্যাটাস আপডেট হয়েছে' : 'Task status updated');
      }
    } catch {
      showToast('error', language === 'bn' ? 'কাজ আপডেট করা যায়নি' : 'Could not update task');
    }
  };

  const pendingTasksCount = upcomingTasks.filter((t) => !t.isCompleted).length;

  // Minimalist cards list - pure icons and crisp labels
  const featureCards: FeatureCardItem[] = [
    {
      id: 'crops',
      moduleKey: 'crops',
      icon: Sprout,
      titleBn: 'আমার ফসল',
      titleEn: 'My Crops',
      badgeBn: `${cropBatches.length || 5}টি সক্রিয়`,
      badgeEn: `${cropBatches.length || 5} Active`,
      descBn: 'মাঠে চলমান ফসলের সার্বিক অবস্থা ও বৃদ্ধির তথ্য',
      descEn: 'Overall status, variety, and health of standing crops',
      colorBg: 'bg-emerald-50',
      colorText: 'text-emerald-700',
      colorBorder: 'hover:border-emerald-400',
    },
    {
      id: 'calendar',
      moduleKey: 'calendar',
      icon: Calendar,
      titleBn: 'কাজের সময়সূচি',
      titleEn: 'Task Schedule',
      badgeBn: `${pendingTasksCount}টি বাকি`,
      badgeEn: `${pendingTasksCount} Pending`,
      descBn: 'সার, কীটনাশক ও সেচ দেওয়ার তারিখ ও তালিকা',
      descEn: 'Scheduled dates for irrigation, fertilizer, and spray',
      colorBg: 'bg-indigo-50',
      colorText: 'text-indigo-700',
      colorBorder: 'hover:border-indigo-400',
    },
    {
      id: 'weather',
      moduleKey: 'weather',
      icon: CloudSun,
      titleBn: 'আজকের আবহাওয়া',
      titleEn: 'Weather Advisory',
      badgeBn: '৩০.৫°C রোদ',
      badgeEn: '30.5°C Sunny',
      descBn: 'বৃষ্টির পূর্বাভাস, তাপমাত্রা ও কৃষি আবহাওয়া বার্তা',
      descEn: 'Precipitation forecast, temperature, and farm tips',
      colorBg: 'bg-amber-50',
      colorText: 'text-amber-700',
      colorBorder: 'hover:border-amber-400',
    },
    {
      id: 'farms',
      moduleKey: 'farms',
      icon: Trees,
      titleBn: 'খামার ও জমি',
      titleEn: 'Farms & Land',
      badgeBn: `${profile?.totalAcreage || '18.5'} একর`,
      badgeEn: `${profile?.totalAcreage || '18.5'} Acres`,
      descBn: '৩টি খামার, ৭টি জমির প্লট ও মাটির ধরণ',
      descEn: '3 registered farms, 7 plots, and soil records',
      colorBg: 'bg-teal-50',
      colorText: 'text-teal-700',
      colorBorder: 'hover:border-teal-400',
    },
    {
      id: 'expenses',
      moduleKey: 'expenses',
      icon: Receipt,
      titleBn: 'আয়-ব্যয়ের খাতা',
      titleEn: 'Farm Expenses',
      badgeBn: '৳৩,১২,৫০০ ব্যয়',
      badgeEn: '৳312.5k Spent',
      descBn: 'সার, বীজ, ডিজেল ও শ্রমিক খরচের সার্বিক হিসাব',
      descEn: 'Categorized breakdown of inputs, labor, and machinery',
      colorBg: 'bg-rose-50',
      colorText: 'text-rose-700',
      colorBorder: 'hover:border-rose-400',
    },
    {
      id: 'profitability',
      moduleKey: 'profitability',
      icon: TrendingUp,
      titleBn: 'লাভ-ক্ষতির হিসাব',
      titleEn: 'Profit & Loss',
      badgeBn: '৳১,৭২,৫০০ লাভ',
      badgeEn: '৳172.5k Profit',
      descBn: 'ফসলের বিক্রয়মূল্য, নিট মুনাফা ও লাভ্যাংশের হার',
      descEn: 'Crop-by-crop revenue, profit margin, and ROI',
      colorBg: 'bg-emerald-50',
      colorText: 'text-emerald-800',
      colorBorder: 'hover:border-emerald-500',
    },
    {
      id: 'harvest',
      moduleKey: 'harvest',
      icon: PackageCheck,
      titleBn: 'ফসল তোলা ও মজুত',
      titleEn: 'Harvest & Storage',
      badgeBn: 'আমন ধান প্রস্তুত',
      badgeEn: 'Paddy Ready',
      descBn: 'ফসল কাটার উপযুক্ত সময়, আনুমানিক ফলন ও গুদাম',
      descEn: 'Harvest dates, moisture levels, and expected yield',
      colorBg: 'bg-orange-50',
      colorText: 'text-orange-700',
      colorBorder: 'hover:border-orange-400',
    },
    {
      id: 'recommendation',
      moduleKey: 'recommendation',
      icon: Sparkles,
      titleBn: 'স্মার্ট AI পরামর্শ',
      titleEn: 'AI Advisory',
      badgeBn: 'রবি মৌসুমের সেরা',
      badgeEn: 'Best for Rabi',
      descBn: 'মাটি ও আবহাওয়া অনুযায়ী উপযুক্ত ফসল ও জাত নির্বাচন',
      descEn: 'AI-guided crop and seed selection for your soil',
      colorBg: 'bg-purple-50',
      colorText: 'text-purple-700',
      colorBorder: 'hover:border-purple-400',
    },
    {
      id: 'comparison',
      moduleKey: 'comparison',
      icon: GitCompare,
      titleBn: 'ফসলের তুলনা',
      titleEn: 'Crop Comparison',
      badgeBn: '৪টি ফসলের ডাটা',
      badgeEn: '4 Crop Profiles',
      descBn: 'ধান বনাম ভুট্টা বনাম গম: কোনটিতে লাভ বেশি?',
      descEn: 'Side-by-side ROI, water requirement, and costs',
      colorBg: 'bg-cyan-50',
      colorText: 'text-cyan-700',
      colorBorder: 'hover:border-cyan-400',
    },
    {
      id: 'logs',
      moduleKey: 'logs',
      icon: FileText,
      titleBn: 'কৃষি ডায়েরি',
      titleEn: 'Field Logs',
      badgeBn: 'সর্বশেষ সার প্রয়োগ',
      badgeEn: 'Recent Log',
      descBn: 'প্রতিদিনের ক্ষেতের কার্যক্রম ও সার-কীটনাশক প্রয়োগের ডায়েরি',
      descEn: 'Daily farm activity logs and operational history',
      colorBg: 'bg-slate-100',
      colorText: 'text-slate-800',
      colorBorder: 'hover:border-slate-400',
    },
    {
      id: 'training',
      moduleKey: 'training',
      icon: GraduationCap,
      titleBn: 'কৃষি প্রশিক্ষণ',
      titleEn: 'Training & Video',
      badgeBn: '৪টি কোর্স',
      badgeEn: '4 Courses',
      descBn: 'আধুনিক কৃষি প্রযুক্তি ও ভিডিও প্রশিক্ষণ নির্দেশিকা',
      descEn: 'Video guides on modern farming and disease control',
      colorBg: 'bg-blue-50',
      colorText: 'text-blue-700',
      colorBorder: 'hover:border-blue-400',
    },
    {
      id: 'helpline',
      icon: PhoneCall,
      titleBn: 'কৃষি হেল্পলাইন ১৬১২৩',
      titleEn: 'Krishi Helpline 16123',
      badgeBn: 'টোল-ফ্রি সরাসরি',
      badgeEn: 'Toll-Free',
      descBn: 'সরকারি কৃষি বিশেষজ্ঞের সাথে ফোনে সরাসরি কথা বলুন',
      descEn: 'Free telephone advisory from Govt agricultural officers',
      colorBg: 'bg-emerald-100/70',
      colorText: 'text-emerald-900',
      colorBorder: 'hover:border-emerald-500',
      isHelpline: true,
    },
    {
      id: 'notifications',
      moduleKey: 'notifications',
      icon: Bell,
      titleBn: 'বিজ্ঞপ্তি ও সতর্কতা',
      titleEn: 'Alerts & Messages',
      badgeBn: '২টি নতুন সতর্কবার্তা',
      badgeEn: '2 New Alerts',
      descBn: 'পোকামাকড় আক্রমণ, বাজার দর ও জরুরি বার্তা',
      descEn: 'Pest outbreak warnings and market price notices',
      colorBg: 'bg-rose-50',
      colorText: 'text-rose-700',
      colorBorder: 'hover:border-rose-400',
    },
    {
      id: 'profile',
      moduleKey: 'profile',
      icon: User,
      titleBn: 'কৃষক প্রোফাইল',
      titleEn: 'Farmer Profile',
      badgeBn: 'যাচাইকৃত কৃষক',
      badgeEn: 'Verified ID',
      descBn: 'জাতীয় পরিচয়পত্র, ব্যাংক হিসাব ও কৃষি কার্ড তথ্য',
      descEn: 'NID, mobile banking, and registered farmer card',
      colorBg: 'bg-sky-50',
      colorText: 'text-sky-700',
      colorBorder: 'hover:border-sky-400',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Minimalist Warm Greeting Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>📍 {profile ? `${profile.primaryLocation.upazila}, ${profile.primaryLocation.district}` : 'শেরপুর, বগুড়া'}</span>
              <span className="text-slate-300">•</span>
              <span>{language === 'bn' ? 'রবি মৌসুম' : 'Rabi Season'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'bn'
                ? `আসসালামু আলাইকুম, ${profile?.fullName || 'মহিউদ্দীন ভাই'}`
                : `Welcome, ${profile?.fullName || 'Mohiuddin Khan'}`}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'আপনার খামারের সকল তথ্য ও সেবা সহজে দেখতে নিচের আইকনটিতে ক্লিক করুন।'
                : 'Click any service icon below to quickly view details or open the full page.'}
            </p>
          </div>

          {/* Quick Helpline Pill Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <a
              href="tel:16123"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হেল্পলাইন ১৬১২৩' : 'Call 16123'}</span>
            </a>
          </div>
        </div>

        {/* 4 Minimalist Stat Strip Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100">
          <div
            onClick={() => onNavigate('crops')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">{t('statActiveCrops')}</span>
            <span className="text-base font-black text-slate-900">
              {cropBatches.length || 5} {language === 'bn' ? 'টি ফসল' : 'Crops'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('farms')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">{t('statTotalLand')}</span>
            <span className="text-base font-black text-slate-900">
              {profile?.totalAcreage || '18.5'} {language === 'bn' ? 'একর' : 'Acres'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('calendar')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">{t('statTodayTasks')}</span>
            <span className="text-base font-black text-slate-900">
              {pendingTasksCount} {language === 'bn' ? 'টি বাকি' : 'Pending'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('profitability')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'নিট লাভ' : 'Net Profit'}</span>
            <span className="text-base font-black text-emerald-700">৳১,৭২,৫০০</span>
          </div>
        </div>
      </div>

      {/* 2. Iconic Services Grid (ক্লিক করলে তথ্য দেখাবে) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'কৃষি সেবাসমূহ (আইকনে ক্লিক করে তথ্য দেখুন)' : 'Farm Services (Click Icon for Details)'}
          </h2>
          <span className="text-xs text-slate-400">
            {featureCards.length} {language === 'bn' ? 'টি সেবা' : 'Services'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group ${card.colorBorder}`}
              >
                <div>
                  {/* Icon Tile & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl ${card.colorBg} ${card.colorText} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate max-w-[90px]">
                      {language === 'bn' ? card.badgeBn : card.badgeEn}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors leading-snug">
                    {language === 'bn' ? card.titleBn : card.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {language === 'bn' ? card.descBn : card.descEn}
                  </p>
                </div>

                {/* Subtle Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 transition-colors">
                  <span>{language === 'bn' ? 'তথ্য দেখুন' : 'View Info'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Information Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${selectedCard.colorBg} ${selectedCard.colorText} flex items-center justify-center`}>
                  <selectedCard.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {language === 'bn' ? selectedCard.titleBn : selectedCard.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'bn' ? selectedCard.descBn : selectedCard.descEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Live Content Body based on Selected Card */}
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
              {/* Card-specific Information Details */}
              {selectedCard.id === 'crops' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="font-semibold text-emerald-900">
                      {language === 'bn' ? `মোট সক্রিয় ফসল: ${cropBatches.length || 5}টি` : `Total Active Crops: ${cropBatches.length || 5}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                      {language === 'bn' ? 'চমৎকার স্বাস্থ্য' : 'Healthy'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cropBatches.slice(0, 4).map((crop) => (
                      <div key={crop.id} className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between bg-slate-50/60">
                        <div>
                          <p className="font-bold text-slate-900">{crop.cropName} ({crop.variety})</p>
                          <p className="text-[11px] text-slate-500">{crop.fieldName} • {crop.growthStage}</p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700">{crop.healthRating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.id === 'calendar' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-600 pb-1">
                    <span className="font-bold">{language === 'bn' ? 'আজকের ও আসন্ন কাজসমূহ:' : 'Upcoming Farm Tasks:'}</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">{pendingTasksCount} {language === 'bn' ? 'টি বাকি' : 'Pending'}</span>
                  </div>
                  <div className="space-y-2">
                    {upcomingTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskToggle(task.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          task.isCompleted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              task.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <div className="truncate">
                            <p className={`font-semibold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {tr(task.taskTitle)}
                            </p>
                            <p className="text-[10px] text-slate-500">{tr(task.cropName)} • {task.scheduledDate}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          task.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.isCompleted ? (language === 'bn' ? 'সম্পন্ন' : 'Done') : (language === 'bn' ? 'বাকি' : 'Pending')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.id === 'weather' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black block">30.5°C</span>
                      <span className="text-xs font-bold text-amber-800">{language === 'bn' ? 'আজ রৌদ্রোজ্জ্বল দিন' : 'Sunny & Clear'}</span>
                    </div>
                    <div className="text-right text-[11px] text-amber-900 space-y-0.5">
                      <p>{language === 'bn' ? 'বৃষ্টির সম্ভাবনা:' : 'Rain chance:'} <strong className="text-amber-950">০%</strong></p>
                      <p>{language === 'bn' ? 'বাতাসের আর্দ্রতা:' : 'Humidity:'} <strong className="text-amber-950">৬২%</strong></p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed">
                    💡 <strong>{language === 'bn' ? 'কৃষি পরামর্শ:' : 'Farm Tip:'}</strong>{' '}
                    {language === 'bn'
                      ? 'আজ আমন ধান ও ভুট্টার জমিতে হালকা সেচ এবং সকালে সুষম ইউরিয়া সার প্রয়োগের জন্য অত্যন্ত অনুকূল আবহাওয়া।'
                      : 'Ideal conditions today for light irrigation and morning urea fertilizer application.'}
                  </div>
                </div>
              )}

              {selectedCard.id === 'farms' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'মোট জমি' : 'Total Land'}</span>
                      <span className="text-base font-black text-slate-900">{profile?.totalAcreage || '18.5'} {language === 'bn' ? 'একর' : 'Acres'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'নিবন্ধিত প্লট' : 'Registered Plots'}</span>
                      <span className="text-base font-black text-slate-900">{language === 'bn' ? '৭টি প্লট' : '7 Plots'}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-xs">
                    🌾 {language === 'bn'
                      ? <strong>প্রধান খামার:</strong>
                      : <strong>Primary Farm:</strong>}{' '}
                    {language === 'bn'
                      ? 'খান এগ্রো শেরপুর (বগুড়া), মাটির ধরণ: দোআঁশ ও এটেল। সেচ সুবিধা: নিজস্ব গভীর নলকূপ।'
                      : 'Khan Agro Sherpur (Bogura), loamy & clay soil. Own deep tube-well irrigation.'}
                  </div>
                </div>
              )}

              {selectedCard.id === 'expenses' && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-rose-900">{language === 'bn' ? 'চলতি মৌসুমের মোট খরচ:' : 'Total Seasonal Cost:'}</span>
                    <span className="text-base font-black text-rose-800">৳৩,১২,৫০০</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg text-slate-700">
                      <span>{language === 'bn' ? 'রাসায়নিক ও জৈব সার:' : 'Chemical & Organic Fertilizer:'}</span>
                      <span className="font-bold">৳৭৫,০০০</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg text-slate-700">
                      <span>{language === 'bn' ? 'সেচ ও জ্বালানি ডিজেল:' : 'Irrigation & Fuel:'}</span>
                      <span className="font-bold">৳৩২,০০০</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg text-slate-700">
                      <span>{language === 'bn' ? 'শ্রমিক ও জমি চাষ:' : 'Labor & Tillage:'}</span>
                      <span className="font-bold">৳৬৫,০০০</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCard.id === 'profitability' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[11px] text-emerald-800 block">{language === 'bn' ? 'সম্ভাব্য বিক্রয়মূল্য' : 'Expected Revenue'}</span>
                      <span className="text-base font-black text-emerald-950">৳৪,৮৫,০০০</span>
                    </div>
                    <div className="p-3 bg-emerald-100/60 border border-emerald-300 rounded-xl">
                      <span className="text-[11px] text-emerald-800 block">{language === 'bn' ? 'প্রত্যাশিত নিট লাভ' : 'Expected Net Profit'}</span>
                      <span className="text-base font-black text-emerald-900">৳১,৭২,৫০০</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'bn'
                      ? 'চলতি মৌসুমে সরিষা ও ভুট্টার ফলনে সর্বোচ্চ মুনাফা (৩৫.৫%) পাওয়ার সম্ভাবনা রয়েছে।'
                      : 'Highest margin (35.5%) is projected from Mustard and Maize yields this season.'}
                  </p>
                </div>
              )}

              {selectedCard.id === 'helpline' && (
                <div className="space-y-3 text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-emerald-900">১৬১২৩</h4>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {language === 'bn' ? 'সরকারি কৃষক সেবা কল সেন্টার (বিনামূল্যে)' : 'Govt Farmer Call Center (Toll-free)'}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {language === 'bn'
                      ? 'যেকোনো ফসলের রোগবালাই, পোকামাকড় দমন বা সঠিক পরামর্শের জন্য যেকোনো মোবাইল থেকে কল করুন।'
                      : 'Call from any phone for crop disease, pest control, or expert agronomy advice.'}
                  </p>
                  <a
                    href="tel:16123"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{language === 'bn' ? 'সরাসরি কল করুন (১৬১২৩)' : 'Call Now (16123)'}</span>
                  </a>
                </div>
              )}

              {selectedCard.id === 'recommendation' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-purple-950">
                    <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide block">
                      {language === 'bn' ? 'রবি মৌসুমের সেরা সুপারিশ' : 'Top Rabi Season Recommendation'}
                    </span>
                    <p className="text-sm font-bold mt-1 text-purple-950">
                      {language === 'bn' ? 'বারি সরিষা-১৪ ও হাইব্রিড ভুট্টা (পায়োনিয়ার ৩৩৫৫)' : 'BARI Mustard-14 & Hybrid Maize'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">{language === 'bn' ? 'মাটির উপযুক্ততা' : 'Soil Match'}</span>
                      <span className="font-bold text-emerald-700">৯৬% {language === 'bn' ? 'অনুকূল' : 'Optimal'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">{language === 'bn' ? 'সেচ চাহিদা' : 'Water Need'}</span>
                      <span className="font-bold text-slate-800">{language === 'bn' ? 'স্বল্প (২-৩ বার)' : 'Low (2-3x)'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'bn'
                      ? 'দোআঁশ মাটির আর্দ্রতা অনুযায়ী বারি সরিষা-১৪ চাষ করলে সর্বোচ্চ ফলন ও কম খরচে দ্রুত লাভবান হওয়া সম্ভব।'
                      : 'AI recommends BARI Mustard-14 for high yield and quick turnover with low irrigation requirements.'}
                  </p>
                </div>
              )}

              {selectedCard.id === 'comparison' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {[
                      {
                        name: language === 'bn' ? 'ব্রি ধান-২৮ (বোরো)' : 'BRRI Dhan-28',
                        roi: '২৪%',
                        cost: '৳২২,০০০ / বিঘা',
                        badge: language === 'bn' ? 'মধ্যম লাভ' : 'Medium Profit',
                        color: 'border-slate-200',
                      },
                      {
                        name: language === 'bn' ? 'বারি সরিষা-১৪ (রবি)' : 'BARI Mustard-14',
                        roi: '৩৮%',
                        cost: '৳১২,৫০০ / বিঘা',
                        badge: language === 'bn' ? 'সর্বোচ্চ লাভ' : 'Max Profit',
                        color: 'border-emerald-300 bg-emerald-50/50',
                      },
                      {
                        name: language === 'bn' ? 'হাইব্রিড ভুট্টা' : 'Hybrid Maize',
                        roi: '৩২%',
                        cost: '৳১৮,০০০ / বিঘা',
                        badge: language === 'bn' ? 'উচ্চ ফলন' : 'High Yield',
                        color: 'border-slate-200',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border ${item.color} flex items-center justify-between`}>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-500">{language === 'bn' ? 'খরচ: ' : 'Cost: '}{item.cost}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-700 block">ROI {item.roi}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{item.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.id === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
                    <span className="font-bold">{language === 'bn' ? 'সাম্প্রতিক কৃষি ডায়েরি' : 'Recent Farm Logs'}</span>
                    <span className="text-[11px] text-slate-400">{language === 'bn' ? 'সর্বশেষ এন্ট্রি' : 'Latest Entry'}</span>
                  </div>
                  <div className="space-y-2">
                    {recentLogs.length > 0 ? (
                      recentLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">{tr(log.activityType)}</span>
                            <span className="text-[10px] text-slate-400">{log.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{tr(log.details)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                        {language === 'bn' ? 'আমন ধানে ইউরিয়া ও ডিএপি সার প্রয়োগ সম্পন্ন।' : 'Applied Urea & DAP fertilizer on Aman paddy.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCard.id === 'training' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                      {language === 'bn' ? 'চলমান অডিও ও ভিডিও কোর্স' : 'Featured Course'}
                    </span>
                    <p className="text-sm font-bold mt-1 text-amber-950">
                      {language === 'bn' ? 'আধুনিক পদ্ধতিতে সরিষা ও রবি শস্য চাষাবাদ' : 'Modern Mustard & Rabi Cultivation'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'bn' ? 'মোট মডিউল:' : 'Total Modules:'}</span>
                      <span className="font-bold text-slate-800">{language === 'bn' ? '৫টি অডিও লেকচার' : '5 Audio Lectures'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'bn' ? 'সময়কাল:' : 'Duration:'}</span>
                      <span className="font-bold text-slate-800">{language === 'bn' ? '৩৫ মিনিট' : '35 Minutes'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCard.id === 'harvest' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">{language === 'bn' ? 'মোট উত্তোলন' : 'Total Harvested'}</span>
                      <span className="text-base font-black text-slate-900">{language === 'bn' ? '১২,৪৫০ কেজি' : '12,450 kg'}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-emerald-800 block text-[11px]">{language === 'bn' ? 'গড়ে বিক্রয় দর' : 'Avg Sell Price'}</span>
                      <span className="text-base font-black text-emerald-900">৳৩৮ / {language === 'bn' ? 'কেজি' : 'kg'}</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    🌾 {language === 'bn'
                      ? 'আসন্ন কর্তন: ব্রি ধান-২৮ (কাটার সম্ভাব্য সময়: ১৫ দিন বাকি)'
                      : 'Upcoming harvest: BRRI Dhan-28 in 15 days'}
                  </div>
                </div>
              )}

              {selectedCard.id === 'profile' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-base">
                      {profile?.fullName ? profile.fullName.charAt(0) : 'খ'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{profile?.fullName || 'মোহাম্মদ করিম খান'}</p>
                      <p className="text-[11px] text-slate-500">{profile?.phoneNumber || '০১৭XXXXXXXX'} • {language === 'bn' ? 'বগুড়া, বাংলাদেশ' : 'Bogura, Bangladesh'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">{language === 'bn' ? 'জাতীয় পরিচয়পত্র' : 'NID'}</span>
                      <span className="font-bold text-emerald-700">✓ {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">{language === 'bn' ? 'সদস্যপদ' : 'Membership'}</span>
                      <span className="font-bold text-slate-800">{language === 'bn' ? 'প্রিমিয়াম কৃষক' : 'Premium Farmer'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCard.id === 'notifications' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <span className="font-bold text-emerald-900 block">{language === 'bn' ? 'সার ভর্তুকি আপডেট' : 'Subsidy Alert'}</span>
                    <span className="text-[11px] text-emerald-800">
                      {language === 'bn' ? 'ইউরিয়া ও ডিএপি সারের নতুন সরকারি মূল্য তালিকা প্রকাশিত হয়েছে।' : 'New fertilizer subsidy schedule published.'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                    <span className="font-bold text-amber-900 block">{language === 'bn' ? 'আবহাওয়া পূর্বাভাস' : 'Weather Alert'}</span>
                    <span className="text-[11px] text-amber-800">
                      {language === 'bn' ? 'আগামী ৪৮ ঘণ্টার মধ্যে উত্তরবঙ্গে শুষ্ক আবহাওয়া বজায় থাকবে।' : 'Dry weather expected in next 48 hours.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Fallback for other cards */}
              {!['crops', 'calendar', 'weather', 'farms', 'expenses', 'profitability', 'helpline', 'recommendation', 'comparison', 'logs', 'training', 'harvest', 'profile', 'notifications'].includes(selectedCard.id) && (
                <div className="space-y-3">
                  <p className="text-slate-600 leading-relaxed">
                    {language === 'bn'
                      ? `${selectedCard.titleBn} সংক্রান্ত সার্বিক ব্যবস্থাপনা, ডাটা এন্ট্রি ও বিশদ বিশ্লেষণ দেখতে নিচের বাটনে ক্লিক করে মূল পাতায় যান।`
                      : `View and manage all details for ${selectedCard.titleEn} by navigating to the full page below.`}
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'bn' ? 'সিস্টেমে সকল তথ্য প্রস্তুত রয়েছে' : 'All records synchronized'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>

              {selectedCard.moduleKey && (
                <button
                  onClick={() => {
                    const targetModule = selectedCard.moduleKey;
                    setSelectedCard(null);
                    if (targetModule) onNavigate(targetModule);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সম্পূর্ণ পাতা খুলুন' : 'Open Full Page'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};