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
import { useToast } from '@/components/ui/Toast';
import {
  getFarmerDashboardSummary,
  getCropBatches,
  toggleCalendarTask,
  getProfitabilityMetrics,
  getTrainingCourses,
  getFarms,
  getHarvestRecords,
  getCropComparisonProfiles,
  getAiRecommendationDiagnostic,
  getFarmerNotifications,
  FarmerDashboardSummary,
} from '@/lib/farmerApi';
import {
  FarmerProfile,
  CropBatch,
  CalendarTask,
  CropLog,
  ProfitabilityMetrics,
  TrainingCourse,
  Farm,
  HarvestRecord,
  CropComparisonProfile,
  AiRecommendationDiagnostic,
  FarmerNotification,
} from '@/types';
import { FarmerModuleKey } from '@/features/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { tr } from '@/lib/localize';

async function safeData<T>(p: Promise<{ success: boolean; data: T }>): Promise<T | null> {
  try {
    const res = await p;
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

const bnNum = (v: string | number): string =>
  String(v).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const fmtBdt = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  return `${sign}৳${Math.round(Math.abs(n)).toLocaleString('en-IN')}`;
};

const fmtBdtShort = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a >= 100000) return `${sign}৳${(a / 100000).toFixed(1)}L`;
  if (a >= 1000) return `${sign}৳${(a / 1000).toFixed(1)}k`;
  return `${sign}৳${a}`;
};

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
  const [summaryData, setSummaryData] = useState<FarmerDashboardSummary | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<CalendarTask[]>([]);
  const [recentLogs, setRecentLogs] = useState<CropLog[]>([]);
  const [profit, setProfit] = useState<ProfitabilityMetrics | null>(null);
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([]);
  const [farmsList, setFarmsList] = useState<Farm[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [compareProfiles, setCompareProfiles] = useState<CropComparisonProfile[]>([]);
  const [notifList, setNotifList] = useState<FarmerNotification[]>([]);
  const [diagnostic, setDiagnostic] = useState<AiRecommendationDiagnostic | null>(null);
  const [selectedCard, setSelectedCard] = useState<FeatureCardItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          summaryRes,
          batchesRes,
          profitData,
          trainingData,
          farmsData,
          harvestData,
          compareData,
          notifData,
          diagData,
        ] = await Promise.all([
          getFarmerDashboardSummary(),
          getCropBatches(),
          safeData(getProfitabilityMetrics()),
          safeData(getTrainingCourses()),
          safeData(getFarms()),
          safeData(getHarvestRecords()),
          safeData(getCropComparisonProfiles()),
          safeData(getFarmerNotifications()),
          safeData(getAiRecommendationDiagnostic()),
        ]);
        if (summaryRes.success && batchesRes.success) {
          setSummaryData(summaryRes.data);
          setProfile(summaryRes.data.profile);
          setUpcomingTasks(summaryRes.data.upcomingTasks);
          setRecentLogs(summaryRes.data.recentLogs);
          setCropBatches(batchesRes.data);
        }
        setProfit(profitData);
        setTrainingCourses(trainingData ?? []);
        setFarmsList(farmsData ?? []);
        setHarvests(harvestData ?? []);
        setCompareProfiles(compareData ?? []);
        setNotifList(notifData ?? []);
        setDiagnostic(diagData);
      } catch {
        showToast('error', language === 'bn' ? 'ড্যাশবোর্ড তথ্য লোড হতে সমস্যা হয়েছে' : 'Error loading dashboard data');
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

  const weather = summaryData?.weatherCurrent ?? null;
  const totalExpensesBdt = profit?.totalExpensesBdt ?? 0;
  const netProfitBdt = profit?.netProfitBdt ?? 0;
  const totalRevenueBdt = profit?.totalRevenueBdt ?? 0;
  const totalHarvestedKg = harvests.reduce((sum, h) => sum + (h.quantityKg || 0), 0);
  const harvestValuationBdt = harvests.reduce((sum, h) => sum + (h.estimatedValuationBdt || 0), 0);
  const avgSellPriceBdt = totalHarvestedKg > 0 ? Math.round(harvestValuationBdt / totalHarvestedKg) : 0;
  const unreadCount = summaryData?.unreadNotificationsCount ?? 0;
  const totalFarmsCount = summaryData?.totalFarmsCount ?? 0;
  const totalFieldsCount = summaryData?.totalFieldsCount ?? 0;
  const topMarginCrop =
    profit?.revenueByCrop.find((row) => row.revenue > 0) ?? null;
  const topMarginPercent =
    topMarginCrop && topMarginCrop.revenue > 0
      ? Math.round((topMarginCrop.profit / topMarginCrop.revenue) * 1000) / 10
      : 0;
  const expenseCategories = (profit?.costBreakdownByCategory ?? []).slice(0, 3);
  const featuredCourse = trainingCourses[0] ?? null;
  const primaryFarm = farmsList[0] ?? null;
  const upcomingHarvestBatch =
    cropBatches.find((b) => /harvest|ready|মোসম|প্রস্তুত/i.test(b.growthStage || '')) ?? null;
  const soilInsight = diagnostic?.soilDeficiencies[0] ?? null;
  const deficientCount = (diagnostic?.soilDeficiencies ?? []).filter((d) => d.status === 'Deficient').length;

  // Minimalist cards list - pure icons and crisp labels
  const featureCards: FeatureCardItem[] = [
    {
      id: 'crops',
      moduleKey: 'crops',
      icon: Sprout,
      titleBn: 'আমার ফসল',
      titleEn: 'My Crops',
      badgeBn: `${bnNum(cropBatches.length)}টি সক্রিয়`,
      badgeEn: `${cropBatches.length} Active`,
      descBn: 'মাঠে চলমান ফসলের সার্বিক অবস্থা ও বৃদ্ধির তথ্য',
      descEn: 'Overall status, variety, and health of standing crops',
      colorBg: 'bg-emerald-50 dark:bg-emerald-500/15',
      colorText: 'text-emerald-700 dark:text-emerald-400',
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
      colorBg: 'bg-indigo-50 dark:bg-indigo-500/15',
      colorText: 'text-indigo-700 dark:text-indigo-400',
      colorBorder: 'hover:border-indigo-400',
    },
    {
      id: 'weather',
      moduleKey: 'weather',
      icon: CloudSun,
      titleBn: 'আজকের আবহাওয়া',
      titleEn: 'Weather Advisory',
      badgeBn: weather ? `${bnNum(weather.tempCelsius)}°C` : '—',
      badgeEn: weather ? `${weather.tempCelsius}°C ${weather.condition}` : '—',
      descBn: 'বৃষ্টির পূর্বাভাস, তাপমাত্রা ও কৃষি আবহাওয়া বার্তা',
      descEn: 'Precipitation forecast, temperature, and farm tips',
      colorBg: 'bg-amber-50 dark:bg-amber-500/15',
      colorText: 'text-amber-700 dark:text-amber-400',
      colorBorder: 'hover:border-amber-400',
    },
    {
      id: 'farms',
      moduleKey: 'farms',
      icon: Trees,
      titleBn: 'খামার ও জমি',
      titleEn: 'Farms & Land',
      badgeBn: `${bnNum(profile?.totalAcreage ?? 0)} একর`,
      badgeEn: `${profile?.totalAcreage ?? 0} Acres`,
      descBn: `${bnNum(totalFarmsCount)}টি খামার, ${bnNum(totalFieldsCount)}টি জমির প্লট ও মাটির ধরণ`,
      descEn: `${totalFarmsCount} registered farms, ${totalFieldsCount} plots, and soil records`,
      colorBg: 'bg-teal-50 dark:bg-teal-500/15',
      colorText: 'text-teal-700 dark:text-teal-400',
      colorBorder: 'hover:border-teal-400',
    },
    {
      id: 'expenses',
      moduleKey: 'expenses',
      icon: Receipt,
      titleBn: 'আয়-ব্যয়ের খাতা',
      titleEn: 'Farm Expenses',
      badgeBn: `${bnNum(fmtBdt(totalExpensesBdt))} ব্যয়`,
      badgeEn: `${fmtBdtShort(totalExpensesBdt)} Spent`,
      descBn: 'সার, বীজ, ডিজেল ও শ্রমিক খরচের সার্বিক হিসাব',
      descEn: 'Categorized breakdown of inputs, labor, and machinery',
      colorBg: 'bg-rose-50 dark:bg-rose-500/15',
      colorText: 'text-rose-700 dark:text-rose-400',
      colorBorder: 'hover:border-rose-400',
    },
    {
      id: 'profitability',
      moduleKey: 'profitability',
      icon: TrendingUp,
      titleBn: 'লাভ-ক্ষতির হিসাব',
      titleEn: 'Profit & Loss',
      badgeBn: `${bnNum(fmtBdt(netProfitBdt))} লাভ`,
      badgeEn: `${fmtBdtShort(netProfitBdt)} Profit`,
      descBn: 'ফসলের বিক্রয়মূল্য, নিট মুনাফা ও লাভ্যাংশের হার',
      descEn: 'Crop-by-crop revenue, profit margin, and ROI',
      colorBg: 'bg-emerald-50 dark:bg-emerald-500/15',
      colorText: 'text-emerald-800 dark:text-emerald-400',
      colorBorder: 'hover:border-emerald-500',
    },
    {
      id: 'harvest',
      moduleKey: 'harvest',
      icon: PackageCheck,
      titleBn: 'ফসল তোলা ও মজুত',
      titleEn: 'Harvest & Storage',
      badgeBn: `${bnNum(totalHarvestedKg)} কেজি উত্তোলিত`,
      badgeEn: `${totalHarvestedKg} kg Harvested`,
      descBn: 'ফসল কাটার উপযুক্ত সময়, আনুমানিক ফলন ও গুদাম',
      descEn: 'Harvest dates, moisture levels, and expected yield',
      colorBg: 'bg-orange-50 dark:bg-orange-500/15',
      colorText: 'text-orange-700 dark:text-orange-400',
      colorBorder: 'hover:border-orange-400',
    },
    {
      id: 'recommendation',
      moduleKey: 'recommendation',
      icon: Sparkles,
      titleBn: 'স্মার্ট AI পরামর্শ',
      titleEn: 'AI Advisory',
      badgeBn: `${diagnostic ? `${bnNum(deficientCount)}টি সার ঘাটতি` : 'বিশ্লেষণ নেই'}`,
      badgeEn: `${diagnostic ? `${deficientCount} Nutrient Gaps` : 'Awaiting Analysis'}`,
      descBn: 'মাটি ও আবহাওয়া অনুযায়ী উপযুক্ত ফসল ও জাত নির্বাচন',
      descEn: 'AI-guided crop and seed selection for your soil',
      colorBg: 'bg-purple-50 dark:bg-purple-500/15',
      colorText: 'text-purple-700 dark:text-purple-400',
      colorBorder: 'hover:border-purple-400',
    },
    {
      id: 'comparison',
      moduleKey: 'comparison',
      icon: GitCompare,
      titleBn: 'ফসলের তুলনা',
      titleEn: 'Crop Comparison',
      badgeBn: `${bnNum(compareProfiles.length)}টি ফসলের ডাটা`,
      badgeEn: `${compareProfiles.length} Crop Profiles`,
      descBn: 'ধান বনাম ভুট্টা বনাম গম: কোনটিতে লাভ বেশি?',
      descEn: 'Side-by-side ROI, water requirement, and costs',
      colorBg: 'bg-cyan-50 dark:bg-cyan-500/15',
      colorText: 'text-cyan-700 dark:text-cyan-400',
      colorBorder: 'hover:border-cyan-400',
    },
    {
      id: 'logs',
      moduleKey: 'logs',
      icon: FileText,
      titleBn: 'কৃষি ডায়েরি',
      titleEn: 'Field Logs',
      badgeBn: `${recentLogs.length ? `সর্বশেষ ${tr(recentLogs[0].activityType)}` : 'কোনো লগ নেই'}`,
      badgeEn: `${recentLogs.length ? `Latest: ${recentLogs[0].activityType}` : 'No Logs Yet'}`,
      descBn: 'প্রতিদিনের ক্ষেতের কার্যক্রম ও সার-কীটনাশক প্রয়োগের ডায়েরি',
      descEn: 'Daily farm activity logs and operational history',
      colorBg: 'bg-slate-100 dark:bg-[#1a1a1a]',
      colorText: 'text-slate-800 dark:text-[#e0e0e0]',
      colorBorder: 'hover:border-slate-400',
    },
    {
      id: 'training',
      moduleKey: 'training',
      icon: GraduationCap,
      titleBn: 'কৃষি প্রশিক্ষণ',
      titleEn: 'Training & Video',
      badgeBn: `${bnNum(trainingCourses.length)}টি কোর্স`,
      badgeEn: `${trainingCourses.length} Courses`,
      descBn: 'আধুনিক কৃষি প্রযুক্তি ও ভিডিও প্রশিক্ষণ নির্দেশিকা',
      descEn: 'Video guides on modern farming and disease control',
      colorBg: 'bg-blue-50 dark:bg-blue-500/15',
      colorText: 'text-blue-700 dark:text-blue-400',
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
      colorBg: 'bg-emerald-100/70 dark:bg-emerald-500/15',
      colorText: 'text-emerald-900 dark:text-emerald-400',
      colorBorder: 'hover:border-emerald-500',
      isHelpline: true,
    },
    {
      id: 'notifications',
      moduleKey: 'notifications',
      icon: Bell,
      titleBn: 'বিজ্ঞপ্তি ও সতর্কতা',
      titleEn: 'Alerts & Messages',
      badgeBn: `${bnNum(unreadCount)}টি নতুন সতর্কবার্তা`,
      badgeEn: `${unreadCount} New Alerts`,
      descBn: 'পোকামাকড় আক্রমণ, বাজার দর ও জরুরি বার্তা',
      descEn: 'Pest outbreak warnings and market price notices',
      colorBg: 'bg-rose-50 dark:bg-rose-500/15',
      colorText: 'text-rose-700 dark:text-rose-400',
      colorBorder: 'hover:border-rose-400',
    },
    {
      id: 'profile',
      moduleKey: 'profile',
      icon: User,
      titleBn: 'কৃষক প্রোফাইল',
      titleEn: 'Farmer Profile',
      badgeBn: `${profile?.nationalId ? 'যাচাইকৃত কৃষক' : 'তথ্য অসম্পূর্ণ'} `,
      badgeEn: `${profile?.nationalId ? 'NID Verified' : 'Profile Incomplete'}`,
      descBn: 'জাতীয় পরিচয়পত্র, ব্যাংক হিসাব ও কৃষি কার্ড তথ্য',
      descEn: 'NID, mobile banking, and registered farmer card',
      colorBg: 'bg-sky-50 dark:bg-sky-500/15',
      colorText: 'text-sky-700 dark:text-sky-400',
      colorBorder: 'hover:border-sky-400',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-24 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] p-4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Minimalist Warm Greeting Header */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>📍 {profile ? `${profile.primaryLocation.upazila}, ${profile.primaryLocation.district}` : 'শেরপুর, বগুড়া'}</span>
              <span className="text-slate-300">•</span>
              <span>{language === 'bn' ? 'রবি মৌসুম' : 'Rabi Season'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#f0f0f0] tracking-tight">
              {language === 'bn'
                ? `আসসালামু আলাইকুম, ${profile?.fullName || 'মহিউদ্দীন ভাই'}`
                : `Welcome, ${profile?.fullName || 'Mohiuddin Khan'}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-[#222222]">
          <div
            onClick={() => onNavigate('crops')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111111]/60 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">{t('statActiveCrops')}</span>
            <span className="text-base font-black text-slate-900 dark:text-[#f0f0f0]">
              {cropBatches.length} {language === 'bn' ? 'টি ফসল' : 'Crops'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('farms')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111111]/60 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">{t('statTotalLand')}</span>
            <span className="text-base font-black text-slate-900 dark:text-[#f0f0f0]">
              {profile?.totalAcreage ?? 0} {language === 'bn' ? 'একর' : 'Acres'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('calendar')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111111]/60 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">{t('statTodayTasks')}</span>
            <span className="text-base font-black text-slate-900 dark:text-[#f0f0f0]">
              {pendingTasksCount} {language === 'bn' ? 'টি বাকি' : 'Pending'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('profitability')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111111]/60 hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">{language === 'bn' ? 'নিট লাভ' : 'Net Profit'}</span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{bnNum(fmtBdt(netProfitBdt))}</span>
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
                className={`bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group ${card.colorBorder}`}
              >
                <div>
                  {/* Icon Tile & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl ${card.colorBg} ${card.colorText} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] truncate max-w-[90px]">
                      {language === 'bn' ? card.badgeBn : card.badgeEn}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm group-hover:text-emerald-700 transition-colors leading-snug">
                    {language === 'bn' ? card.titleBn : card.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] mt-1 line-clamp-2 leading-relaxed">
                    {language === 'bn' ? card.descBn : card.descEn}
                  </p>
                </div>

                {/* Subtle Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#222222] flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-[#a0a0a0] group-hover:text-emerald-700 transition-colors">
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
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-[#222222] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-100 dark:border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${selectedCard.colorBg} ${selectedCard.colorText} flex items-center justify-center`}>
                  <selectedCard.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-[#f0f0f0]">
                    {language === 'bn' ? selectedCard.titleBn : selectedCard.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">
                    {language === 'bn' ? selectedCard.descBn : selectedCard.descEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-[#999999] hover:bg-slate-100 dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a] transition-colors cursor-pointer"
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
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                      {language === 'bn' ? `মোট সক্রিয় ফসল: ${bnNum(cropBatches.length)}টি` : `Total Active Crops: ${cropBatches.length}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                      {language === 'bn' ? 'চমৎকার স্বাস্থ্য' : 'Healthy'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cropBatches.slice(0, 4).map((crop) => (
                      <div key={crop.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-[#222222] flex items-center justify-between bg-slate-50 dark:bg-[#111111]/60">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-[#f0f0f0]">{crop.cropName} ({crop.variety})</p>
                          <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0]">{crop.fieldName} • {crop.growthStage}</p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{crop.healthRating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.id === 'calendar' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-600 dark:text-[#a0a0a0] pb-1">
                    <span className="font-bold">{language === 'bn' ? 'আজকের ও আসন্ন কাজসমূহ:' : 'Upcoming Farm Tasks:'}</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{pendingTasksCount} {language === 'bn' ? 'টি বাকি' : 'Pending'}</span>
                  </div>
                  <div className="space-y-2">
                    {upcomingTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskToggle(task.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          task.isCompleted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-[#222222] hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              task.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-[#333333]'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <div className="truncate">
                            <p className={`font-semibold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-[#e0e0e0]'}`}>
                              {tr(task.taskTitle)}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-[#a0a0a0]">{tr(task.cropName)} • {task.scheduledDate}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          task.isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300'
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
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-950 dark:text-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black block">{weather ? `${weather.tempCelsius}°C` : '—'}</span>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{weather?.condition ?? '—'}</span>
                    </div>
                    <div className="text-right text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                      <p>{language === 'bn' ? 'বৃষ্টির সম্ভাবনা:' : 'Rain chance:'} <strong className="text-amber-950 dark:text-amber-100">{bnNum(weather?.precipitationProbability ?? 0)}%</strong></p>
                      <p>{language === 'bn' ? 'বাতাসের আর্দ্রতা:' : 'Humidity:'} <strong className="text-amber-950 dark:text-amber-100">{bnNum(weather?.humidityPercent ?? 0)}%</strong></p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-200 dark:border-[#222222] text-slate-700 dark:text-[#999999] text-xs leading-relaxed">
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
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222]">
                      <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">{language === 'bn' ? 'মোট জমি' : 'Total Land'}</span>
                      <span className="text-base font-black text-slate-900 dark:text-[#f0f0f0]">{profile?.totalAcreage ?? 0} {language === 'bn' ? 'একর' : 'Acres'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222]">
                      <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block">{language === 'bn' ? 'নিবন্ধিত প্লট' : 'Registered Plots'}</span>
                      <span className="text-base font-black text-slate-900 dark:text-[#f0f0f0]">{language === 'bn' ? `${bnNum(totalFieldsCount)}টি প্লট` : `${totalFieldsCount} Plots`}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-950 dark:text-teal-200 text-xs">
                    🌾 {language === 'bn'
                      ? <strong>প্রধান খামার:</strong>
                      : <strong>Primary Farm:</strong>}{' '}
                    {primaryFarm
                      ? language === 'bn'
                        ? `${primaryFarm.name} (${primaryFarm.location}), মাটির ধরণ: ${primaryFarm.soilClassification}, সেচ: ${primaryFarm.irrigationType}`
                        : `${primaryFarm.name} (${primaryFarm.location}), ${primaryFarm.soilClassification}, ${primaryFarm.irrigationType}`
                      : language === 'bn'
                        ? 'কোনো খামার এখনো নিবন্ধিত হয়নি।'
                        : 'No farms registered yet.'}
                  </div>
                </div>
              )}

              {selectedCard.id === 'expenses' && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-rose-900 dark:text-rose-300">{language === 'bn' ? 'চলতি মৌসুমের মোট খরচ:' : 'Total Seasonal Cost:'}</span>
                    <span className="text-base font-black text-rose-800 dark:text-rose-300">{bnNum(fmtBdt(totalExpensesBdt))}</span>
                  </div>
                  <div className="space-y-1.5">
                    {expenseCategories.length > 0 ? (
                      expenseCategories.map((cat) => (
                        <div key={cat.category} className="flex justify-between p-2 bg-slate-50 dark:bg-[#111111]/60 rounded-lg text-slate-700 dark:text-[#999999]">
                          <span>{tr(cat.category)}</span>
                          <span className="font-bold">{bnNum(fmtBdt(cat.amount))}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between p-2 bg-slate-50 dark:bg-[#111111]/60 rounded-lg text-slate-700 dark:text-[#999999]">
                        <span>{language === 'bn' ? 'খরচের কোনো রেকর্ড নেই' : 'No expense records yet'}</span>
                        <span className="font-bold">{bnNum(fmtBdt(0))}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCard.id === 'profitability' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block">{language === 'bn' ? 'সম্ভাব্য বিক্রয়মূল্য' : 'Expected Revenue'}</span>
                      <span className="text-base font-black text-emerald-950 dark:text-emerald-200">{bnNum(fmtBdt(totalRevenueBdt))}</span>
                    </div>
                    <div className="p-3 bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-xl">
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block">{language === 'bn' ? 'প্রত্যাশিত নিট লাভ' : 'Expected Net Profit'}</span>
                      <span className="text-base font-black text-emerald-900 dark:text-emerald-200">{bnNum(fmtBdt(netProfitBdt))}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] leading-relaxed">
                    {topMarginCrop
                      ? language === 'bn'
                        ? `${topMarginCrop.cropName} থেকে সর্বোচ্চ লাভ (${bnNum(topMarginPercent)}%) প্রক্ষেপিত`
                        : `Highest margin (${topMarginPercent}%) projected from ${topMarginCrop.cropName}`
                      : language === 'bn'
                        ? 'এখনো আয়-ব্যয়ের রেকর্ড নেই।'
                        : 'No revenue or expense records yet.'}
                  </p>
                </div>
              )}

              {selectedCard.id === 'helpline' && (
                <div className="space-y-3 text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-300">১৬১২৩</h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-[#a0a0a0] mt-0.5">
                      {language === 'bn' ? 'সরকারি কৃষক সেবা কল সেন্টার (বিনামূল্যে)' : 'Govt Farmer Call Center (Toll-free)'}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] max-w-xs mx-auto">
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
                  <div className="p-3 bg-purple-50/80 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl text-purple-950 dark:text-purple-200">
                    <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide block">
                      {language === 'bn' ? 'মাটি বিশ্লেষণ ও সার পরামর্শ' : 'Soil Analysis & Fertilizer Advice'}
                    </span>
                    <p className="text-sm font-bold mt-1 text-purple-950 dark:text-purple-200">
                      {diagnostic ? (language === 'bn' ? `${bnNum(diagnostic.recommendedFertilizers.length)}টি সার পরামর্শ ও ${bnNum(diagnostic.soilDeficiencies.length)}টি মাটি পরীক্ষা` : `${diagnostic.recommendedFertilizers.length} fertilizer recommendations from ${diagnostic.soilDeficiencies.length} soil checks`) : (language === 'bn' ? 'বিশ্লেষণ পাওয়া যায়নি' : 'Diagnostic unavailable')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                      <span className="text-slate-500 dark:text-[#a0a0a0] block text-[11px]">{language === 'bn' ? 'মাটির অবস্থা' : 'Soil Status'}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{diagnostic ? (soilInsight?.status === 'Deficient' ? (language === 'bn' ? 'সার ঘাটতি আছে' : 'Nutrient gaps') : (language === 'bn' ? 'সুষম মাটি' : 'Soil balanced')) : '—'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                      <span className="text-slate-500 dark:text-[#a0a0a0] block text-[11px]">{language === 'bn' ? 'প্রাক্কলিত ফলন' : 'Yield Potential'}</span>
                      <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{diagnostic ? `${bnNum(diagnostic.yieldPotentialPrediction.minimumYield)}-${bnNum(diagnostic.yieldPotentialPrediction.maximumYield)} ${diagnostic.yieldPotentialPrediction.unit}` : '—'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] leading-relaxed">
                    {diagnostic ? diagnostic.agronomicRationale : (language === 'bn' ? 'এইমুহূর্তে কোনো বিশ্লেষণ পাওয়া যায়নি।' : 'No diagnostic available right now.')}
                  </p>
                </div>
              )}

              {selectedCard.id === 'comparison' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {compareProfiles.slice(0, 3).map((p) => ({
                        name: `${p.cropName} (${p.variety})`,
                        roi: `${p.netMarginPercent}%`,
                        cost: `${fmtBdt(p.totalInputCostPerAcre)} / ${language === 'bn' ? 'একর' : 'acre'}`,
                        badge: p.netMarginPercent >= 30 ? (language === 'bn' ? 'সর্বোচ্চ লাভ' : 'Max Profit') : p.netMarginPercent >= 20 ? (language === 'bn' ? 'মধ্যম লাভ' : 'Medium Profit') : (language === 'bn' ? 'কম লাভ' : 'Low Profit'),
                        color: p.netMarginPercent >= 30 ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-[#222222]',
                      }))
                      .map((item, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border ${item.color} flex items-center justify-between`}>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-[#f0f0f0]">{item.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-[#a0a0a0]">{language === 'bn' ? 'খরচ: ' : 'Cost: '}{item.cost}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">ROI {item.roi}</span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-[#a0a0a0]">{item.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.id === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#a0a0a0] pb-1">
                    <span className="font-bold">{language === 'bn' ? 'সাম্প্রতিক কৃষি ডায়েরি' : 'Recent Farm Logs'}</span>
                    <span className="text-[11px] text-slate-400">{language === 'bn' ? 'সর্বশেষ এন্ট্রি' : 'Latest Entry'}</span>
                  </div>
                  <div className="space-y-2">
                    {recentLogs.length > 0 ? (
                      recentLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{tr(log.activityType)}</span>
                            <span className="text-[10px] text-slate-400">{log.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-[#a0a0a0] line-clamp-2">{tr(log.details)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl text-xs text-slate-600 dark:text-[#a0a0a0]">
                        {language === 'bn' ? 'এখনো কোনো ফসল ডায়েরি এন্ট্রি নেই।' : 'No crop log entries yet.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCard.id === 'training' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-950 dark:text-amber-200">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide block">
                      {language === 'bn' ? 'চলমান অডিও ও ভিডিও কোর্স' : 'Featured Course'}
                    </span>
                    <p className="text-sm font-bold mt-1 text-amber-950 dark:text-amber-200">
                      {featuredCourse ? featuredCourse.title : (language === 'bn' ? 'কোনো কোর্স পাওয়া যায়নি' : 'No courses available')}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#a0a0a0]">{language === 'bn' ? 'মোট মডিউল:' : 'Total Modules:'}</span>
                      <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{featuredCourse ? (language === 'bn' ? `${bnNum(featuredCourse.lessonsCount)}টি লেকচার` : `${featuredCourse.lessonsCount} Lessons`) : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#a0a0a0]">{language === 'bn' ? 'সময়কাল:' : 'Duration:'}</span>
                      <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{featuredCourse ? (language === 'bn' ? `${bnNum(featuredCourse.durationMinutes)} মিনিট` : `${featuredCourse.durationMinutes} Minutes`) : '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCard.id === 'harvest' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                      <span className="text-slate-500 dark:text-[#a0a0a0] block text-[11px]">{language === 'bn' ? 'মোট উত্তোলন' : 'Total Harvested'}</span>
                      <span className="text-base font-black text-slate-900 dark:text-[#f0f0f0]">{language === 'bn' ? `${bnNum(totalHarvestedKg)} কেজি` : `${totalHarvestedKg} kg`}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                      <span className="text-emerald-800 dark:text-emerald-300 block text-[11px]">{language === 'bn' ? 'গড়ে বিক্রয় দর' : 'Avg Sell Price'}</span>
                      <span className="text-base font-black text-emerald-900 dark:text-emerald-200">{avgSellPriceBdt > 0 ? bnNum(fmtBdt(avgSellPriceBdt)) : '—'} / {language === 'bn' ? 'কেজি' : 'kg'}</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl text-xs text-slate-600 dark:text-[#a0a0a0]">
                    🌾 {upcomingHarvestBatch
                      ? (language === 'bn'
                        ? `আসন্ন উত্তোলন: ${upcomingHarvestBatch.cropName} (${upcomingHarvestBatch.growthStage})`
                        : `Upcoming harvest: ${upcomingHarvestBatch.cropName} (${upcomingHarvestBatch.growthStage})`)
                      : (language === 'bn' ? 'কাটার উপযুক্ত কোনো ফসল নেই।' : 'No batches ready for harvest yet.')}
                  </div>
                </div>
              )}

              {selectedCard.id === 'profile' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-base">
                      {profile?.fullName ? profile.fullName.charAt(0) : 'খ'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm">{profile?.fullName || '—'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0]">{profile?.phoneNumber || '—'} • {language === 'bn' ? `${profile?.primaryLocation?.district || '—'}, বাংলাদেশ` : `${profile?.primaryLocation?.district || '—'}, Bangladesh`}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                      <span className="text-slate-500 dark:text-[#a0a0a0] block text-[11px]">{language === 'bn' ? 'জাতীয় পরিচয়পত্র' : 'NID'}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{profile?.nationalId ? `✓ ${language === 'bn' ? 'যাচাইকৃত' : 'Verified'}` : (language === 'bn' ? 'NID নেই' : 'No NID')}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                      <span className="text-slate-500 dark:text-[#a0a0a0] block text-[11px]">{language === 'bn' ? 'সদস্যপদ' : 'Membership'}</span>
                      <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{profile?.farmerClub || (language === 'bn' ? 'কোনো কৃষক ক্লাব নেই' : 'No farmer club')}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCard.id === 'notifications' && (
                <div className="space-y-2">
                  {notifList.length > 0 ? (
                    notifList.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          n.priority === 'high'
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                        }`}
                      >
                        <span className={`font-bold block ${n.priority === 'high' ? 'text-amber-900 dark:text-amber-300' : 'text-emerald-900 dark:text-emerald-300'}`}>{n.title}</span>
                        <span className={`text-[11px] ${n.priority === 'high' ? 'text-amber-800 dark:text-amber-200' : 'text-emerald-800 dark:text-emerald-200'}`}>{n.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl text-xs text-slate-600 dark:text-[#a0a0a0]">
                      {language === 'bn' ? 'কোনো নতুন বিজ্ঞপ্তি নেই।' : 'No new notifications.'}
                    </div>
                  )}
                </div>
              )}

              {/* Fallback for other cards */}
              {!['crops', 'calendar', 'weather', 'farms', 'expenses', 'profitability', 'helpline', 'recommendation', 'comparison', 'logs', 'training', 'harvest', 'profile', 'notifications'].includes(selectedCard.id) && (
                <div className="space-y-3">
                  <p className="text-slate-600 dark:text-[#a0a0a0] leading-relaxed">
                    {language === 'bn'
                      ? `${selectedCard.titleBn} সংক্রান্ত সার্বিক ব্যবস্থাপনা, ডাটা এন্ট্রি ও বিশদ বিশ্লেষণ দেখতে নিচের বাটনে ক্লিক করে মূল পাতায় যান।`
                      : `View and manage all details for ${selectedCard.titleEn} by navigating to the full page below.`}
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-200 dark:border-[#222222] text-slate-700 dark:text-[#999999] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{language === 'bn' ? 'সিস্টেমে সকল তথ্য প্রস্তুত রয়েছে' : 'All records synchronized'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-[#111111]/60 border-t border-slate-100 dark:border-[#222222] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-[#a0a0a0] hover:bg-slate-200/60 transition-colors cursor-pointer"
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