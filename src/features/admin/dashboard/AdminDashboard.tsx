import React, { useEffect, useState } from 'react';
import { tr, trPhrase } from "@/lib/localize";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users,
  ShieldCheck,
  Sprout,
  TrendingUp,
  MapPin,
  Activity,
  CheckCircle2,
  FileCheck,
  Send,
  Store,
  ShoppingCart,
  CreditCard,
  Truck,
  BookOpen,
  FileBarChart,
  Scale,
  LucideIcon,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DashboardHero,
  DashboardStatGrid,
  DashboardSkeleton,
  ServiceInfoModal,
  ModalStat,
  ModalRow,
  ModalChip,
  ModalEmpty,
  ModalSyncedNote,
  useT,
  type ServiceCardItem,
  type ServiceTone,
} from '@/components/dashboard';
import { useToast } from '@/components/ui/Toast';
import { UI_DICT } from '@/lib/uiDict';
import { getAdminDashboardSummary, getPendingFarmVerifications } from '@/lib/adminApi';
import { fmtBdt } from '@/lib/format';
import { AdminDashboardSummary, FarmVerificationRequest } from '@/types';
import { AdminModuleKey } from '@/features/layout';

interface AdminDashboardProps {
  onNavigate: (module: AdminModuleKey) => void;
}

/**
 * A live label/value pair rendered inside the click-for-details dialog.
 *
 * `labelBn`/`labelEn` keep the label bilingual (the table sits outside the
 * component, so it can't call the `useT` hook itself).
 */
type AdminFact = { labelBn: string; labelEn: string; value: React.ReactNode };

/**
 * The ten executive modules, as data.
 *
 * This was ten near-identical `<button>` blocks (~110 lines) whose only
 * differences were the route key, icon, tile colour and two labels. Keeping it
 * as a table means adding an eleventh module is one row, not fourteen lines,
 * and the markup can't drift between entries.
 *
 * Besides the tile styling (`tile`), each row carries the shared
 * dashboard-kit card fields (`tone`, `descBn`/`descEn`) and a `facts` reader
 * that pulls that module's numbers out of the live admin summary — so the
 * same table drives the matrix tile *and* the dialog opened by clicking it.
 * Module titles are looked up with `tr()` at render time so the dialog header
 * always matches the tile's own translation.
 */
const COMMAND_MATRIX: Array<{
  key: AdminModuleKey;
  icon: LucideIcon;
  tile: string;
  tone: ServiceTone;
  title: string;
  subtitle: string;
  descBn: string;
  descEn: string;
  facts: (s: AdminDashboardSummary) => AdminFact[];
}> = [
  { key: 'user_management', icon: Users, tile: 'bg-emerald-100 text-emerald-800', tone: 'emerald', title: '1. User Mgmt', subtitle: 'Farmers, Officers, Labs', descBn: 'কৃষক, ডিএই অফিসার ও ল্যাব টেকনিশিয়ানদের অ্যাকাউন্ট, ভূমিকা ও যাচাই অবস্থা নিয়ন্ত্রণ করুন', descEn: 'Manage accounts, roles and verification status for farmers, DAE officers and lab technicians', facts: (s) => [
    { labelBn: 'নিবন্ধিত খামার', labelEn: 'Registered Farmers', value: s.kpis.totalRegisteredFarmers.toLocaleString() },
    { labelBn: 'সক্রিয় খামার', labelEn: 'Active Farms', value: s.kpis.totalActiveFarms.toLocaleString() },
    { labelBn: 'প্রশিক্ষিত কৃষক', labelEn: 'Enrolled in Training', value: s.kpis.enrolledTrainingFarmers.toLocaleString() },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'marketplace', icon: Store, tile: 'bg-teal-100 text-teal-800', tone: 'teal', title: '2. Marketplace', subtitle: 'Listing Approvals', descBn: 'তালিকাভুক্ত পণ্য যাচাই করে বাজারে প্রকাশের অনুমোদন দিন এবং মূল্য পরিসীমা নিরীক্ষণ করুন', descEn: 'Approve listed produce for publication and monitor price bands across the marketplace', facts: (s) => [
    { labelBn: 'সাপ্তাহিক বাজার পরিমাণ', labelEn: 'Weekly Market Volume', value: `${s.totalWeeklyMarketVolumeTons.toLocaleString()} T` },
    { labelBn: 'বার্ষিক প্রক্কলিত ফলন', labelEn: 'Projected Annual Yield', value: `${(s.kpis.projectedAnnualYieldTons / 1000).toFixed(0)}k T` },
    { labelBn: 'ফলন সূচক', labelEn: 'Crop Yield Index', value: s.averageCropYieldIndex },
    { labelBn: 'সক্রিয় পরামর্শ', labelEn: 'Active Advisories', value: s.totalActiveAdvisories },
  ] },
  { key: 'orders', icon: ShoppingCart, tile: 'bg-blue-100 text-blue-800', tone: 'blue', title: '3. Orders', subtitle: 'Contracts & Escrow', descBn: 'চলমান অর্ডার, চুক্তি ও এসক্রো তহবিলের অবস্থা পর্যবেক্ষণ করুন', descEn: 'Track live orders, contract terms and escrow-held funds across the platform', facts: (s) => [
    { labelBn: 'প্ল্যাটফর্ম লেনদেন', labelEn: 'Platform Transactions', value: fmtBdt(s.kpis.totalPlatformTransactionsBdt) },
    { labelBn: 'সাপ্তাহিক বাজার পরিমাণ', labelEn: 'Weekly Market Volume', value: `${s.totalWeeklyMarketVolumeTons.toLocaleString()} T` },
    { labelBn: 'খোলা বিরোধ', labelEn: 'Active Disputes', value: s.kpis.activeDisputesCount },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'payments', icon: CreditCard, tile: 'bg-emerald-100 text-emerald-800', tone: 'emerald', title: '4. Payments', subtitle: 'BEFTN & bKash Payouts', descBn: 'কৃষকদের মোট আয়, এসক্রো বন্দিত অর্থ ও পেআউট প্রক্রিয়ার হিসাব দেখুন', descEn: 'Review total farmer earnings, escrow-held funds and the status of BEFTN and bKash payouts', facts: (s) => [
    { labelBn: 'প্ল্যাটফর্ম লেনদেন', labelEn: 'Platform Transactions', value: fmtBdt(s.kpis.totalPlatformTransactionsBdt) },
    { labelBn: 'খোলা বিরোধ', labelEn: 'Active Disputes', value: s.kpis.activeDisputesCount },
    { labelBn: 'অপেক্ষমাণ জমি নিরীক্ষা', labelEn: 'Pending Land Audits', value: s.totalPendingVerifications },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'quality', icon: CheckCircle2, tile: 'bg-indigo-100 text-indigo-800', tone: 'indigo', title: '5. Quality Mgmt', subtitle: 'Lab Moisture & Grades', descBn: 'ল্যাব আর্দ্রতা, গ্রেডিং ফলাফল ও মোট ফলন সূচক নিয়ন্ত্রণ করুন', descEn: 'Oversee lab moisture readings, grading outcomes and the aggregate crop yield index', facts: (s) => [
    { labelBn: 'ফলন সূচক', labelEn: 'Crop Yield Index', value: s.averageCropYieldIndex },
    { labelBn: 'বার্ষিক প্রক্কলিত ফলন', labelEn: 'Projected Annual Yield', value: `${(s.kpis.projectedAnnualYieldTons / 1000).toFixed(0)}k T` },
    { labelBn: 'সাপ্তাহিক বাজার পরিমাণ', labelEn: 'Weekly Market Volume', value: `${s.totalWeeklyMarketVolumeTons.toLocaleString()} T` },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'logistics', icon: Truck, tile: 'bg-amber-100 text-amber-800', tone: 'amber', title: '6. Logistics', subtitle: 'Cold Chain & GPS Fleet', descBn: 'কোল্ড চেইন ও জিপিএস ফ্লিটের সার্বিক চিত্র এবং পরিবহিত পণ্যের পরিমাণ দেখুন', descEn: 'See the state of the cold chain and GPS fleet alongside the volume of goods in transit', facts: (s) => [
    { labelBn: 'সাপ্তাহিক বাজার পরিমাণ', labelEn: 'Weekly Market Volume', value: `${s.totalWeeklyMarketVolumeTons.toLocaleString()} T` },
    { labelBn: 'সক্রিয় খামার', labelEn: 'Active Farms', value: s.kpis.totalActiveFarms.toLocaleString() },
    { labelBn: 'পর্যবেক্ষিত জমি', labelEn: 'Monitored Acreage', value: `${s.kpis.monitoredAcreage.toLocaleString()} Acres` },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'training_management', icon: BookOpen, tile: 'bg-purple-100 text-purple-800', tone: 'purple', title: '7. Training', subtitle: 'DAE Course Workshops', descBn: 'ডিএই কোর্স, ওয়ার্কশপ ও নিবন্ধিত কৃষকদের অগ্রগতি দেখুন', descEn: 'Review DAE courses, workshops and the progress of enrolled farmers', facts: (s) => [
    { labelBn: 'প্রশিক্ষিত কৃষক', labelEn: 'Enrolled in Training', value: s.kpis.enrolledTrainingFarmers.toLocaleString() },
    { labelBn: 'নিবন্ধিত খামার', labelEn: 'Registered Farmers', value: s.kpis.totalRegisteredFarmers.toLocaleString() },
    { labelBn: 'সক্রিয় খামার', labelEn: 'Active Farms', value: s.kpis.totalActiveFarms.toLocaleString() },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'reports', icon: FileBarChart, tile: 'bg-cyan-100 text-cyan-800', tone: 'cyan', title: '8. Reports', subtitle: 'Macro Agro Intelligence', descBn: 'আঞ্চলিক বণ্ডন, ফলন সূচক ও বাজার পরিসংখ্যান দিয়ে ম্যাক্রো কৃষি বিশ্লেষণ দেখুন', descEn: 'Read the macro agro intelligence built from regional distribution, yield index and market volume', facts: (s) => [
    { labelBn: 'নিবন্ধিত খামার', labelEn: 'Registered Farmers', value: s.kpis.totalRegisteredFarmers.toLocaleString() },
    { labelBn: 'পর্যবেক্ষিত জমি', labelEn: 'Monitored Acreage', value: `${s.kpis.monitoredAcreage.toLocaleString()} Acres` },
    { labelBn: 'ফলন সূচক', labelEn: 'Crop Yield Index', value: s.averageCropYieldIndex },
    { labelBn: 'প্ল্যাটফর্ম লেনদেন', labelEn: 'Platform Transactions', value: fmtBdt(s.kpis.totalPlatformTransactionsBdt) },
  ] },
  { key: 'disputes', icon: Scale, tile: 'bg-rose-100 text-rose-800', tone: 'rose', title: '9. Disputes', subtitle: 'Escrow Arbitration', descBn: 'খোলা বিরোধ ও এসক্রো বন্দিত অর্থের নিষ্পত্তি নিয়ে মধ্যস্থতার অবস্থা দেখুন', descEn: 'Review open disputes and escrow-held funds awaiting arbitration', facts: (s) => [
    { labelBn: 'খোলা বিরোধ', labelEn: 'Active Disputes', value: s.kpis.activeDisputesCount },
    { labelBn: 'প্ল্যাটফর্ম লেনদেন', labelEn: 'Platform Transactions', value: fmtBdt(s.kpis.totalPlatformTransactionsBdt) },
    { labelBn: 'অপেক্ষমাণ জমি নিরীক্ষা', labelEn: 'Pending Land Audits', value: s.totalPendingVerifications },
    { labelBn: 'প্ল্যাটফর্ম অবস্থা', labelEn: 'Platform Health', value: s.kpis.systemHealthStatus },
  ] },
  { key: 'farm_verification', icon: FileCheck, tile: 'bg-slate-200 text-slate-800 dark:text-[#e0e0e0]', tone: 'slate', title: '10. Land Audit', subtitle: 'Cadastral Deeds', descBn: 'খতিয়ান দলিল ও জিপিএস সীমানা যাচাইয়ের অপেক্ষমাণ তালিকা পর্যালোচনা করুন', descEn: 'Audit the queue of pending cadastral deeds and GPS boundary submissions', facts: (s) => [
    { labelBn: 'অপেক্ষমাণ জমি নিরীক্ষা', labelEn: 'Pending Land Audits', value: s.totalPendingVerifications },
    { labelBn: 'নিবন্ধিত খামার', labelEn: 'Registered Farmers', value: s.kpis.totalRegisteredFarmers.toLocaleString() },
    { labelBn: 'সক্রিয় খামার', labelEn: 'Active Farms', value: s.kpis.totalActiveFarms.toLocaleString() },
    { labelBn: 'পর্যবেক্ষিত জমি', labelEn: 'Monitored Acreage', value: `${s.kpis.monitoredAcreage.toLocaleString()} Acres` },
  ] },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  useLanguage();
  const { showToast } = useToast();
  const t = useT();

  const verifyStatusLabel = (s: string) =>
    s === "verified"
      ? t("যাচাইকৃত", "Verified")
      : s === "rejected"
        ? t("প্রত্যাখ্যাত", "Rejected")
        : t("অপেক্ষমাণ", "Pending");

  const logStatusLabel = (s: string) =>
    s === "success"
      ? t("সফল", "success")
      : s === "failure"
        ? t("ব্যর্থ", "failure")
        : s;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<FarmVerificationRequest[]>([]);
  const [selectedKey, setSelectedKey] = useState<AdminModuleKey | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [summaryRes, verifRes] = await Promise.all([
          getAdminDashboardSummary(),
          getPendingFarmVerifications(),
        ]);
        if (summaryRes.success && verifRes.success) {
          setSummary(summaryRes.data);
          setPendingVerifications(verifRes.data);
        }
      } catch {
        showToast('error', tr('Failed to load central admin telemetry'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading || !summary) {
    return <DashboardSkeleton variant="metrics" />;
  }

  const { kpis, regionalFarmerDistribution, recentAuditLogs } = summary;

  /**
   * The matrix row currently open in the dialog, paired with the
   * `ServiceCardItem` shape `ServiceInfoModal` expects.
   *
   * Titles are resolved through `UI_DICT` so the dialog header reads exactly
   * what the tile reads — the kit's own `(bn, en)` fields can't reach into
   * the `tr()` dictionary without this lookup.
   */
  const selected = selectedKey
    ? (() => {
        const row = COMMAND_MATRIX.find((entry) => entry.key === selectedKey);
        if (!row) return null;
        return {
          row,
          card: {
            id: row.key,
            moduleKey: row.key,
            icon: row.icon,
            titleBn: UI_DICT[row.title] ?? row.title,
            titleEn: row.title,
            descBn: row.descBn,
            descEn: row.descEn,
            tone: row.tone,
          } satisfies ServiceCardItem,
        };
      })()
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <DashboardHero
        variant="dark"
        meta={
          <>
            <Activity className="w-3.5 h-3.5" />
            {tr('Central Agronomy & Platform Governance Network')}
          </>
        }
        title={tr('Executive Agricultural Oversight Portal')}
        subtitle={tr('Supervising regional land registries, DAE extension courses, real-time commodity trading, and agro-met advisories across Bangladesh.')}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('weather_broadcast')}
              icon={Send}
            >{tr('Emergency Weather Alert')}</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('farm_verification')}
              icon={FileCheck}
            >{tr('Audit Verifications (')}{pendingVerifications.length})
            </Button>
          </>
        }
      />

      {/* Primary KPI Metrics */}
      <DashboardStatGrid
        tiles={[
          {
            id: 'registered-farmers',
            title: tr('Registered Farmers'),
            value: kpis.totalRegisteredFarmers.toLocaleString(),
            trend: 'up',
            subtitle: tr('Active farmer accounts'),
            icon: Users,
            colorScheme: 'emerald',
          },
          {
            id: 'monitored-acreage',
            title: tr('Monitored Acreage'),
            value: `${kpis.monitoredAcreage.toLocaleString()} ${t("একর", "Acres")}`,
            change: t("জিপিএস ম্যাপিং ও যাচাইকৃত", "GIS mapped & verified"),
            trend: 'neutral',
            subtitle: `${kpis.totalActiveFarms} ${tr('active farms registered')}`,
            icon: Sprout,
            colorScheme: 'blue',
          },
          {
            id: 'projected-yield',
            title: tr('Projected Yield'),
            value: `${(kpis.projectedAnnualYieldTons / 1000).toFixed(0)}k ${t("টন", "Tons")}`,
            trend: 'up',
            subtitle: tr('Boro, Potato & Mustard'),
            icon: TrendingUp,
            colorScheme: 'indigo',
          },
          {
            id: 'pending-verifications',
            title: tr('Pending Verifications'),
            value: summary.totalPendingVerifications,
            change: t("কাদস্ট্রাল পরচা দলিল", "Cadastral Porcha deeds"),
            trend: 'neutral',
            subtitle: tr('Awaiting officer audit'),
            icon: ShieldCheck,
            colorScheme: 'amber',
            onClick: () => onNavigate('farm_verification'),
          },
        ]}
      />

      {/* Regional Distribution & Pending Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Distribution */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title={tr('Regional Agro-Ecological Distribution')}
              subtitle={tr('Registered agrarian landholdings and verified farmer density by division')}
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate('platform_analytics')}>{tr('Detailed Analytics')}</Button>
              }
            />

            <div className="space-y-3">
              {regionalFarmerDistribution.map((region) => (
                <div
                  key={region.region}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-[#111111]/60/50 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 dark:bg-[#111111]/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">{region.region}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-[#e0e0e0]">
                      {region.farmerCount.toLocaleString()}{tr('Farmers (')}{region.acreage.toLocaleString()}{tr('Acres)')}</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (region.acreage / 15000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Verification Quick Queue */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title={tr('Pending Land Approvals')}
              subtitle={tr('Recent deed & GPS submissions')}
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate('farm_verification')}>{tr('View All (')}{pendingVerifications.length})
                </Button>
              }
            />

            <div className="space-y-3">
              {pendingVerifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#0a0a0a] hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-[#f0f0f0]">{tr(item.farmName)}</h4>
                    <Badge variant="warning">{verifyStatusLabel(item.status)}</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-[#a0a0a0] font-medium">{tr('Owner:')}{item.farmerName}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {tr(item.upazila)}, {tr(item.district)}{tr('•')}{item.totalAcreage}{tr('Acres')}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">{tr(item.cadastralPlotNumbers)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('farm_verification')}
                      className="text-emerald-700 hover:text-emerald-800 p-0 h-auto"
                    >{tr('Audit Record →')}</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 10 Core Admin Operational Modules Quick Command Matrix */}
      <Card>
        <CardHeader
          title={tr('Admin Operational Command Matrix (10 Core Modules)')}
          subtitle={tr('Direct executive access to all platform oversight, marketplace, and logistics subsystems')}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-1">
          {COMMAND_MATRIX.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.key}
                onClick={() => setSelectedKey(module.key)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60/60 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg ${module.tile} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-[#f0f0f0] block">{tr(module.title)}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0]">{tr(module.subtitle)}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Click-for-details dialog — the same interaction every other role's
          dashboard has: live numbers for this module, then "Open Full Page". */}
      {selected && summary && (
        <ServiceInfoModal
          item={selected.card}
          onClose={() => setSelectedKey(null)}
          onOpenPage={() => onNavigate(selected.row.key)}
        >
          <div className="grid grid-cols-2 gap-2">
            {selected.row.facts(summary).map((fact) => (
              <ModalStat
                key={fact.labelEn}
                label={t(fact.labelBn, fact.labelEn)}
                value={fact.value}
              />
            ))}
          </div>

          {selected.row.key === 'farm_verification' && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#666666]">
                {t('সাম্প্রতিক দলিল জমা', 'Recent Deed Submissions')}
              </h4>
              {pendingVerifications.slice(0, 3).map((item) => (
                <ModalRow
                  key={item.id}
                  title={tr(item.farmName)}
                  subtitle={`${item.farmerName} • ${tr(item.upazila)}, ${tr(item.district)}`}
                  chip={<ModalChip className="bg-amber-100 text-amber-800">{verifyStatusLabel(item.status)}</ModalChip>}
                />
              ))}
              {pendingVerifications.length === 0 && (
                <ModalEmpty>{t('কোনো নতুন দলিল জমা পাওয়া যায়নি।', 'No deed submissions found.')}</ModalEmpty>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#666666]">
              {t('সাম্প্রতিক সিস্টেম নিবন্ধ', 'Recent System Log')}
            </h4>
            {recentAuditLogs.slice(0, 2).map((log) => (
              <ModalRow
                key={log.id}
                title={tr(log.actionType)}
                subtitle={`${tr(log.actorRole)} • ${trPhrase(log.timestamp)}`}
                chip={
                  <ModalChip
                    className={
                      log.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'failure'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }
                  >
                    {logStatusLabel(log.status)}
                  </ModalChip>
                }
              />
            ))}
          </div>

          <ModalSyncedNote label={t('কেন্দ্রীয় টেলিমেট্রি সঙ্গে সমন্বিত', 'Synchronized with central telemetry')} />
        </ServiceInfoModal>
      )}

      {/* Recent System Audit Logs Activity */}
      <Card>
        <CardHeader
          title={tr('Recent System & Security Audit Ledger')}
          subtitle={tr('Immutable event logs of administrative approvals, credential changes, and system broadcasts')}
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('system_audit')}>{tr('Full Audit Ledger')}</Button>
          }
        />

        <div className="divide-y divide-slate-100 text-xs">
          {recentAuditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.status === 'success'
                      ? 'bg-emerald-600'
                      : log.status === 'failure'
                      ? 'bg-rose-600'
                      : 'bg-amber-600'
                  }`}
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-[#f0f0f0]">{tr(log.actionType)}</span>
                  <span className="text-slate-500 dark:text-[#a0a0a0] ml-2">{tr('by')}{log.actorName} ({tr(log.actorRole)})</span>
                  <p className="text-slate-600 dark:text-[#a0a0a0] text-[11px] mt-0.5">{trPhrase(log.details)}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-slate-400 text-[11px] block">{trPhrase(log.timestamp)}</span>
                <span className="font-mono text-[10px] text-slate-400">{tr('IP:')}{log.ipAddress}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
