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
  Phone,
  Check,
  Store,
  DollarSign,
} from '@/components/icons';
import { useToast } from '@/components/ui/Toast';
import {
  DashboardHero,
  ServiceGrid,
  ServiceInfoModal,
  DashboardSkeleton,
  ModalSyncedNote,
  ModalStat,
  ModalRow,
  ModalChip,
  ModalEmpty,
  type ServiceCardItem,
} from '@/components/dashboard';
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
import { getMyProduceListings, type ProduceListing } from '@/lib/marketplaceApi';
import { getWallet, type WalletSummary } from '@/lib/walletApi';
import { FarmerModuleKey } from '@/features/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { tr } from '@/lib/localize';
import { bnNum, fmtBdt, fmtBdtShort } from '@/lib/format';

async function safeData<T>(p: Promise<{ success: boolean; data: T }>): Promise<T | null> {
  try {
    const res = await p;
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

interface FarmerDashboardProps {
  onNavigate: (module: FarmerModuleKey) => void;
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
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [diagnostic, setDiagnostic] = useState<AiRecommendationDiagnostic | null>(null);
  const [selectedCard, setSelectedCard] = useState<ServiceCardItem | null>(null);

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
          listingsData,
          walletData,
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
          safeData(getMyProduceListings()),
          safeData(getWallet()),
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
        setListings(listingsData ?? []);
        setWallet(walletData);
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
  const approvedListings = listings.filter((l) => l.status === 'Approved');
  const pendingListings = listings.filter((l) => l.status !== 'Approved');

  // Minimalist cards list - pure icons and crisp labels
  const featureCards: ServiceCardItem[] = [
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
      tone: 'emerald',
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
      tone: 'indigo',
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
      tone: 'amber',
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
      tone: 'teal',
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
      tone: 'rose',
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
      tone: 'emeraldDeep',
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
      tone: 'orange',
    },
    {
      id: 'my_listings',
      moduleKey: 'my_listings',
      icon: Store,
      titleBn: 'বিক্রয়ে তালিকাভুক্তি',
      titleEn: 'List for Sale',
      badgeBn: `${bnNum(approvedListings.length)}টি অনুমোদিত`,
      badgeEn: `${approvedListings.length} Approved`,
      descBn: 'ফসল বাজারে তুলুন — দাম, পরিমাণ ও অনুমোদনের অবস্থা দেখুন',
      descEn: 'List your produce, set price and quantity, track approval',
      tone: 'violet',
    },
    {
      id: 'sales',
      moduleKey: 'sales',
      icon: DollarSign,
      titleBn: 'বিক্রয় ও মানি ব্যাগ',
      titleEn: 'Sales & Wallet',
      badgeBn: wallet ? `ব্যালেন্স ${bnNum(fmtBdt(wallet.available))}` : 'এসক্রোর অপেক্ষায়',
      badgeEn: wallet ? `Balance ${fmtBdt(wallet.available)}` : 'Awaiting escrow',
      descBn: 'এসক্রো ছাড়ার পর টাকা জমা হয়, উত্তোলনের অনুরোধ করে অ্যাডমিন অনুমোদনের অপেক্ষা করুন',
      descEn: 'Track released escrow, your sales orders, and request a payout',
      tone: 'emerald',
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
      tone: 'purple',
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
      tone: 'cyan',
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
      tone: 'slate',
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
      tone: 'blue',
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
      tone: 'emeraldStrong',
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
      tone: 'rose',
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
      tone: 'sky',
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Minimalist Warm Greeting Header */}
      <DashboardHero
        meta={<>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>📍 {profile ? `${profile.primaryLocation.upazila}, ${profile.primaryLocation.district}` : 'শেরপুর, বগুড়া'}</span>
          <span className="text-slate-300">•</span>
          <span>{language === 'bn' ? 'রবি মৌসুম' : 'Rabi Season'}</span>
        </>}
        title={
          language === 'bn'
            ? `আসসালামু আলাইকুম, ${profile?.fullName || 'মহিউদ্দীন ভাই'}`
            : `Welcome, ${profile?.fullName || 'Mohiuddin Khan'}`
        }
        subtitle={
          language === 'bn'
            ? 'আপনার খামারের সকল তথ্য ও সেবা সহজে দেখতে নিচের আইকনটিতে ক্লিক করুন।'
            : 'Click any service icon below to quickly view details or open the full page.'
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => onNavigate('my_listings')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন তালিকা' : 'New Listing'}</span>
            </button>
            <a
              href="tel:16123"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 text-xs font-bold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হেল্পলাইন ১৬১২৩' : 'Call 16123'}</span>
            </a>
          </>
        }
        stats={[
          {
            label: t('statActiveCrops'),
            value: `${cropBatches.length} ${language === 'bn' ? 'টি ফসল' : 'Crops'}`,
            onClick: () => onNavigate('crops'),
          },
          {
            label: t('statTotalLand'),
            value: `${profile?.totalAcreage ?? 0} ${language === 'bn' ? 'একর' : 'Acres'}`,
            onClick: () => onNavigate('farms'),
          },
          {
            label: t('statTodayTasks'),
            value: `${pendingTasksCount} ${language === 'bn' ? 'টি বাকি' : 'Pending'}`,
            onClick: () => onNavigate('calendar'),
          },
          {
            label: language === 'bn' ? 'নিট লাভ' : 'Net Profit',
            value: bnNum(fmtBdt(netProfitBdt)),
            accent: true,
            onClick: () => onNavigate('profitability'),
          },
          {
            label: language === 'bn' ? 'বাজারে তালিকাভুক্ত' : 'Listed for Sale',
            value: `${listings.length} ${language === 'bn' ? 'টি তালিকা' : 'Listings'}`,
            onClick: () => onNavigate('my_listings'),
          },
          {
            label: language === 'bn' ? 'উত্তোলনযোগ্য' : 'Withdrawable',
            value: bnNum(fmtBdt(wallet?.available ?? 0)),
            accent: true,
            onClick: () => onNavigate('sales'),
          },
        ]}
      />

      {/* 2. Iconic Services Grid (ক্লিক করলে তথ্য দেখাবে) */}
      <ServiceGrid
        label={
          language === 'bn'
            ? 'কৃষি সেবাসমূহ (আইকনে ক্লিক করে তথ্য দেখুন)'
            : 'Farm Services (Click Icon for Details)'
        }
        items={featureCards}
        onSelect={setSelectedCard}
      />

      {/* 3. Interactive Information Modal */}
      {selectedCard && (
        <ServiceInfoModal
          item={selectedCard}
          onClose={() => setSelectedCard(null)}
          onOpenPage={
            selectedCard.moduleKey
              ? () => onNavigate(selectedCard.moduleKey as FarmerModuleKey)
              : undefined
          }
        >
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

              {selectedCard.id === 'my_listings' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <ModalStat
                      label={language === 'bn' ? 'অনুমোদিত' : 'Approved'}
                      value={approvedListings.length}
                      valueClassName="text-emerald-700 dark:text-emerald-400"
                    />
                    <ModalStat
                      label={language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Awaiting Approval'}
                      value={pendingListings.length}
                      valueClassName="text-amber-700 dark:text-amber-400"
                    />
                  </div>
                  {listings.length > 0 ? (
                    <div className="space-y-2">
                      {listings.slice(0, 4).map((l) => (
                        <ModalRow
                          key={l.id}
                          title={`${l.cropName}${l.variety ? ` · ${l.variety}` : ''}`}
                          subtitle={`${l.quantityKg.toLocaleString()} kg · ${fmtBdt(l.pricePerKgBdt)}/kg · ${l.district || l.location || '—'}`}
                          chip={
                            <ModalChip
                              className={
                                l.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                              }
                            >
                              {l.status === 'Approved'
                                ? (language === 'bn' ? 'অনুমোদিত' : 'Approved')
                                : (language === 'bn' ? 'অনুমোদন বাকি' : 'Pending')}
                            </ModalChip>
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <ModalEmpty>
                      {language === 'bn'
                        ? 'এখনো কোনো ফসল বাজারে তালিকাভুক্ত করা হয়নি — "নতুন তালিকা" চেপে শুরু করুন।'
                        : 'No produce listed yet — use "New Listing" to get started.'}
                    </ModalEmpty>
                  )}
                </div>
              )}

              {/* Fallback for other cards */}
              {!['crops', 'calendar', 'weather', 'farms', 'expenses', 'profitability', 'helpline', 'recommendation', 'comparison', 'logs', 'training', 'harvest', 'my_listings', 'profile', 'notifications'].includes(selectedCard.id) && (
                <div className="space-y-3">
                  <p className="text-slate-600 dark:text-[#a0a0a0] leading-relaxed">
                    {language === 'bn'
                      ? `${selectedCard.titleBn} সংক্রান্ত সার্বিক ব্যবস্থাপনা, ডাটা এন্ট্রি ও বিশদ বিশ্লেষণ দেখতে নিচের বাটনে ক্লিক করে মূল পাতায় যান।`
                      : `View and manage all details for ${selectedCard.titleEn} by navigating to the full page below.`}
                  </p>
                  <ModalSyncedNote
                    label={
                      language === 'bn'
                        ? 'সিস্টেমে সকল তথ্য প্রস্তুত রয়েছে'
                        : 'All records synchronized'
                    }
                  />
                </div>
              )}
        </ServiceInfoModal>
      )}
    </div>
  );
};