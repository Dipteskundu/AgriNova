"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Calendar,
  FileBarChart,
  Bell,
  Clock,
  CheckCircle2,
  PlayCircle,
  FlaskConical,
  User,
} from "@/components/icons";
import {
  DashboardHero,
  DashboardStatGrid,
  ServiceGrid,
  ServiceInfoModal,
  DashboardSkeleton,
  ModalRow,
  ModalChip,
  ModalStat,
  ModalEmpty,
  useT,
  type ServiceCardItem,
} from "@/components/dashboard";
import {
  getInspectorDashboardStats,
  getAssignedInspections,
  getInspectorSchedule,
  getInspectorNotifications,
  type InspectorDashboardStats,
  type InspectorNotification,
} from "@/lib/inspectorApi";
import { InspectionRequest, InspectorScheduleEntry } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { trPhrase } from "@/lib/localize";
import { bnNum, fmtDateBn } from "@/lib/format";

interface InspectorDashboardProps {
  onNavigate: (module: string) => void;
}

const EMPTY_STATS: InspectorDashboardStats = {
  pendingCount: 0,
  inProgressCount: 0,
  completedThisMonth: 0,
  scheduledThisWeek: 0,
};

/** Status → chip classes, shared by the queue list and the schedule list. */
const inspectionChip = (status: InspectionRequest["status"]) => {
  switch (status) {
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "cancelled":
      return "bg-slate-200 text-slate-600 dark:bg-[#1a1a1a] dark:text-[#a0a0a0]";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }
};

const scheduleChip = (status: InspectorScheduleEntry["status"]) => {
  switch (status) {
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    case "done":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "cancelled":
      return "bg-slate-200 text-slate-600 dark:bg-[#1a1a1a] dark:text-[#a0a0a0]";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }
};

/**
 * Overview for the quality-inspector role (`operations` portal).
 *
 * The first real implementation — before this file the inspector landed on an
 * inline emoji stub shared with logistics. KPIs come from
 * `getInspectorDashboardStats()`, which derives them from the same
 * `/quality` + `/quality/schedule` endpoints the linked lists read, so the
 * numbers here can never disagree with the pages they route to.
 */
export const InspectorDashboard: React.FC<InspectorDashboardProps> = ({
  onNavigate,
}) => {
  const t = useT();
  const { language } = useLanguage();
  const num = (v: string | number) => (language === "bn" ? bnNum(v) : String(v));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InspectorDashboardStats>(EMPTY_STATS);
  const [inspections, setInspections] = useState<InspectionRequest[]>([]);
  const [schedule, setSchedule] = useState<InspectorScheduleEntry[]>([]);
  const [notifications, setNotifications] = useState<InspectorNotification[]>([]);
  const [selected, setSelected] = useState<ServiceCardItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // The stats call re-reads the same two endpoints; failure there must
        // not take the lists down with it, so each is settled independently.
        const [statsRes, inspectionsRes, scheduleRes, notificationsRes] =
          await Promise.all([
            getInspectorDashboardStats().catch(() => null),
            getAssignedInspections().catch(() => null),
            getInspectorSchedule().catch(() => null),
            getInspectorNotifications().catch(() => null),
          ]);

        if (cancelled) return;
        if (statsRes?.success && statsRes.data) setStats(statsRes.data);
        if (inspectionsRes?.success) setInspections(inspectionsRes.data);
        if (scheduleRes?.success) setSchedule(scheduleRes.data);
        if (notificationsRes?.success) setNotifications(notificationsRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingQueue = inspections.filter((i) => i.status === "assigned");
  const inProgress = inspections.filter((i) => i.status === "in_progress");
  const completed = inspections.filter((i) => i.status === "completed");
  const upcomingSchedule = schedule.filter(
    (s) => s.status === "upcoming" || s.status === "in_progress"
  );
  const unread = notifications.filter((n) => !n.isRead);

  const serviceCards: ServiceCardItem[] = [
    {
      id: "inspections",
      moduleKey: "inspections",
      icon: ClipboardList,
      titleBn: "কোয়ালিটি পরীক্ষণ",
      titleEn: "Quality Inspections",
      badgeBn: `${bnNum(stats.pendingCount)}টি বাকি`,
      badgeEn: `${stats.pendingCount} Pending`,
      descBn: "অপেক্ষমাণ ও চলমান পরীক্ষণের তালিকা, ফলাফল জমা দিন",
      descEn: "Review assigned lots and submit grade assessments",
      tone: "amber",
    },
    {
      id: "schedule",
      moduleKey: "schedule",
      icon: Calendar,
      titleBn: "পরীক্ষণ সময়সূচি",
      titleEn: "Inspection Schedule",
      badgeBn: `${bnNum(stats.scheduledThisWeek)}টি এই সপ্তাহে`,
      badgeEn: `${stats.scheduledThisWeek} This Week`,
      descBn: "আজকের ও আসন্ন পরীক্ষণের তারিখ, সময় ও স্থান",
      descEn: "Upcoming visits with dates, times and farm locations",
      tone: "indigo",
    },
    {
      id: "reports",
      moduleKey: "reports",
      icon: FileBarChart,
      titleBn: "পরীক্ষণ রিপোর্ট",
      titleEn: "Inspection Reports",
      badgeBn: `${bnNum(stats.completedThisMonth)}টি এই মাসে`,
      badgeEn: `${stats.completedThisMonth} This Month`,
      descBn: "জমাকৃত গ্রেড, ময়লা হার ও সার্টিফিকেট রিপোর্ট",
      descEn: "Submitted grades, moisture readings and certificates",
      tone: "blue",
    },
    {
      id: "notifications",
      moduleKey: "inspector_notifications",
      icon: Bell,
      titleBn: "বিজ্ঞপ্তি ও সতর্কতা",
      titleEn: "Alerts & Messages",
      badgeBn: `${bnNum(unread.length)}টি নতুন`,
      badgeEn: `${unread.length} New`,
      descBn: "নতুন অ্যাসাইনমেন্ট, জরুরি অনুরোধ ও স্ট্যাটাস আপডেট",
      descEn: "New assignments, urgent requests and status updates",
      tone: "rose",
    },
    {
      id: "profile",
      moduleKey: "inspector_profile",
      icon: User,
      titleBn: "পরিদর্শক প্রোফাইল",
      titleEn: "Inspector Profile",
      badgeBn: "কর্মকর্তা তথ্য",
      badgeEn: "Officer Details",
      descBn: "ব্যক্তিগত তথ্য, দায়িত্ব ও যোগাযোগের বিবরণ",
      descEn: "Personal details, assignment area and contact info",
      tone: "teal",
    },
    {
      id: "help",
      icon: FlaskConical,
      titleBn: "ল্যাব নির্দেশিকা",
      titleEn: "Lab Guidelines",
      badgeBn: "SOP",
      badgeEn: "SOP",
      descBn: "নমুনা সংগ্রহ, পরীক্ষা ও রিপোর্টিং প্রথার সহায়িকা",
      descEn: "Standard procedures for sampling, testing and reporting",
      tone: "purple",
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Mission header */}
      <DashboardHero
        title={t(
          `শুভেচ্ছা, ${user?.name ?? "পরিদর্শক"}`,
          `Welcome, ${user?.name ?? "Inspector"}`
        )}
        subtitle={t(
          "আপনার অপেক্ষমাণ পরীক্ষণ, সময়সূচি ও রিপোর্ট এক জায়গায়।",
          "Your pending inspections, schedule and reports — all in one place."
        )}
        meta={
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{t("কোয়ালিটি অ্যাসিওরেন্স", "Quality Assurance")}</span>
            <span className="text-slate-300 dark:text-[#444]">•</span>
            <span>{t("সদস্য: বগুড়া জেলা", "Zone: Bogura District")}</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => onNavigate("schedule")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("আজকের সময়সূচি", "Today's Schedule")}</span>
          </button>
        }
      />

      {/* Live KPIs */}
      <DashboardStatGrid
        tiles={[
          {
            id: "pending",
            title: t("অপেক্ষমাণ পরীক্ষণ", "Pending Inspections"),
            value: num(stats.pendingCount),
            change: t("বাকি আছে", "In queue"),
            trend: stats.pendingCount > 0 ? "neutral" : "up",
            subtitle: t("স্ট্যাটাস: অ্যাসাইনড", "Status: assigned"),
            icon: ClipboardList,
            colorScheme: "amber",
            onClick: () => onNavigate("inspections"),
          },
          {
            id: "in-progress",
            title: t("চলমান পরীক্ষণ", "In Progress"),
            value: num(stats.inProgressCount),
            change: t("এখন চলছে", "Active now"),
            trend: "neutral",
            subtitle: t("শুরু হয়েছে, জমা দেওয়া হয়নি", "Started, not yet submitted"),
            icon: PlayCircle,
            colorScheme: "blue",
            onClick: () => onNavigate("inspections"),
          },
          {
            id: "completed",
            title: t("এই মাসে সম্পন্ন", "Completed This Month"),
            value: num(stats.completedThisMonth),
            change: t("রিপোর্ট জমা", "Filed"),
            trend: "up",
            subtitle: t("গ্রেড ও সার্টিফিকেট প্রদত্ত", "Grades & certificates issued"),
            icon: CheckCircle2,
            colorScheme: "emerald",
            onClick: () => onNavigate("reports"),
          },
          {
            id: "scheduled",
            title: t("এই সপ্তাহে সূচি", "Scheduled This Week"),
            value: num(stats.scheduledThisWeek),
            change: t("আসন্ন", "Upcoming"),
            trend: "neutral",
            subtitle: t("মাঠ পরিদর্শনের নির্ধারিত সময়", "Field visits on the calendar"),
            icon: Clock,
            colorScheme: "indigo",
            onClick: () => onNavigate("schedule"),
          },
        ]}
      />

      {/* Service grid */}
      <ServiceGrid
        label={t("পরীক্ষণ সেবা (আইকনে ক্লিক করে তথ্য দেখুন)", "Inspection Services (Click Icon for Details)")}
        items={serviceCards}
        onSelect={setSelected}
      />

      {/* Info modal */}
      {selected && (
        <ServiceInfoModal
          item={selected}
          onClose={() => setSelected(null)}
          onOpenPage={selected.moduleKey ? () => onNavigate(selected.moduleKey!) : undefined}
        >
          {selected.id === "inspections" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("মোট অ্যাসাইনমেন্ট", "Total Assignments")}
                  value={num(inspections.length)}
                />
                <ModalStat
                  label={t("চলমান", "In Progress")}
                  value={num(inProgress.length)}
                  valueClassName="text-blue-700 dark:text-blue-400"
                />
              </div>
              {pendingQueue.length + inProgress.length > 0 ? (
                <div className="space-y-2">
                  {[...inProgress, ...pendingQueue].slice(0, 4).map((item) => (
                    <ModalRow
                      key={item.id}
                      title={`${trPhrase(item.cropName)} · ${item.harvestBatchCode}`}
                      subtitle={[
                        item.farmerName,
                        item.farmLocation ? trPhrase(item.farmLocation) : "",
                        item.scheduledDate ? fmtDateBn(item.scheduledDate) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      chip={
                        <ModalChip className={inspectionChip(item.status)}>
                          {item.status === "in_progress"
                            ? t("চলছে", "In Progress")
                            : t("বাকি", "Pending")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "এই মুহূর্তে কোনো অপেক্ষমাণ পরীক্ষণ নেই — সব আপডেট করা হয়েছে।",
                    "No inspections waiting right now — your queue is clear."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "schedule" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("আসন্ন ভ্রমণ", "Upcoming Visits")}
                  value={num(upcomingSchedule.length)}
                />
                <ModalStat
                  label={t("মোট সূচি", "Total Entries")}
                  value={num(schedule.length)}
                />
              </div>
              {upcomingSchedule.length > 0 ? (
                <div className="space-y-2">
                  {upcomingSchedule.slice(0, 4).map((entry) => (
                    <ModalRow
                      key={entry.id}
                      title={`${trPhrase(entry.cropName)} · ${entry.farmerName}`}
                      subtitle={[
                        [entry.date ? fmtDateBn(entry.date) : "", entry.time]
                          .filter(Boolean)
                          .join(" "),
                        entry.location ? trPhrase(entry.location) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      chip={
                        <ModalChip className={scheduleChip(entry.status)}>
                          {entry.status === "in_progress"
                            ? t("চলছে", "Running")
                            : t("আসন্ন", "Upcoming")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "এই সপ্তাহে কোনো নির্ধারিত পরীক্ষণ নেই।",
                    "Nothing scheduled for this week."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "reports" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("এই মাসে সম্পন্ন", "Completed This Month")}
                  value={num(stats.completedThisMonth)}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("মোট রিপোর্ট", "All Reports")}
                  value={num(completed.length)}
                />
              </div>
              {completed.length > 0 ? (
                <div className="space-y-2">
                  {completed.slice(0, 4).map((item) => (
                    <ModalRow
                      key={item.id}
                      title={`${trPhrase(item.cropName)} · ${item.harvestBatchCode}`}
                      subtitle={[item.farmerName, item.scheduledDate ? fmtDateBn(item.scheduledDate) : ""]
                        .filter(Boolean)
                        .join(" · ")}
                      chip={
                        <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          {t("সম্পন্ন", "Completed")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "এই মাসে এখনো কোনো রিপোর্ট জমা হয়নি।",
                    "No reports filed yet this month."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "notifications" && (
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      n.isRead
                        ? "bg-slate-50 dark:bg-[#111111]/60 border-slate-200 dark:border-[#222222]"
                        : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`font-bold block ${
                        n.isRead
                          ? "text-slate-800 dark:text-[#e0e0e0]"
                          : "text-amber-900 dark:text-amber-300"
                      }`}
                    >
                      {trPhrase(n.title)}
                    </span>
                    <span
                      className={`text-[11px] ${
                        n.isRead
                          ? "text-slate-500 dark:text-[#a0a0a0]"
                          : "text-amber-800 dark:text-amber-200"
                      }`}
                    >
                      {trPhrase(n.message)}
                    </span>
                  </div>
                ))
              ) : (
                <ModalEmpty>
                  {t("কোনো নতুন বিজ্ঞপ্তি নেই।", "No new notifications.")}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "profile" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-xl">
                <div className="w-11 h-11 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-base">
                  {user?.name ? user.name.charAt(0) : "I"}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm">
                    {user?.name ?? "—"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0]">
                    {user?.email ?? "—"}
                  </p>
                </div>
              </div>
              <ModalRow
                title={t("দায়িত্বপ্রাপ্ত এলাকা", "Assigned Zone")}
                subtitle={t("বগুড়া জেলা · উপজেলা ভিত্তিক", "Bogura District · Upazila level")}
                chip={
                  <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {t("সক্রিয়", "Active")}
                  </ModalChip>
                }
              />
              <ModalRow
                title={t("অনুমোদন", "Authorisation")}
                subtitle={t("গ্রেডিং ও সার্টিফিকেট ইস্যুর ক্ষমতা", "Empowered to grade and certify")}
                chip={
                  <ModalChip className="bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                    {t("কর্তৃপক্ষ", "Officer")}
                  </ModalChip>
                }
              />
            </div>
          )}

          {selected.id === "help" && (
            <div className="space-y-3">
              <ModalRow
                title={t("১. নমুনা সংগ্রহ", "1. Sampling")}
                subtitle={t(
                  "প্রতি লটে অন্তত ৩টি বিকল্প নমুনা নিন",
                  "Take at least 3 sub-samples per lot"
                )}
              />
              <ModalRow
                title={t("২. পরীক্ষা", "2. Testing")}
                subtitle={t(
                  "আর্দ্রতা, বিদেশী পদার্থ ও অ্যাফ্লাটক্সিন মাপুন",
                  "Measure moisture, foreign matter and aflatoxin"
                )}
              />
              <ModalRow
                title={t("৩. রিপোর্টিং", "3. Reporting")}
                subtitle={t(
                  "২৪ ঘণ্টার মধ্যে রিপোর্ট জমা ও সার্টিফিকেট ইস্যু",
                  "Submit within 24 hours and issue the certificate"
                )}
              />
            </div>
          )}
        </ServiceInfoModal>
      )}
    </div>
  );
};
