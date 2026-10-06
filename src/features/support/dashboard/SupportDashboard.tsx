"use client";

import React, { useEffect, useState } from "react";
import {
  Scale,
  PhoneCall,
  Gavel,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
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
  getSupportDashboardStats,
  getHelpTickets,
  getSupportDisputes,
  getEscalations,
  type SupportDashboardStats,
} from "@/lib/supportApi";
import {
  EscalationRecord,
  HelpTicket,
  SupportDisputeCase,
} from "@/types";
import { fmtBdt, fmtDate } from "@/lib/format";

interface SupportDashboardProps {
  onNavigate: (module: string) => void;
}

const EMPTY_STATS: SupportDashboardStats = {
  openTicketsCount: 0,
  pendingDisputesCount: 0,
  resolvedTodayCount: 0,
  activeEscalationsCount: 0,
};

const ticketChip = (status: HelpTicket["status"]) => {
  switch (status) {
    case "resolved":
    case "closed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    case "waiting_user":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
    default:
      return "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300";
  }
};

const disputeChip = (status: SupportDisputeCase["status"]) => {
  switch (status) {
    case "resolved":
    case "dismissed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "mediation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    case "under_review":
      return "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300";
    default:
      return "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300";
  }
};

const escalationChip = (status: EscalationRecord["status"]) => {
  switch (status) {
    case "resolved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "acknowledged":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }
};

/**
 * Overview for the support role (`support` portal).
 *
 * Replaces the inline emoji stub that used to render here. KPIs come from the
 * ready-but-never-called `getSupportDashboardStats()`; the modals read the
 * ticket/dispute/escalation lists the linked pages are built on, so the "View
 * Info" previews always agree with the queues they open.
 */
export const SupportDashboard: React.FC<SupportDashboardProps> = ({
  onNavigate,
}) => {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SupportDashboardStats>(EMPTY_STATS);
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [disputes, setDisputes] = useState<SupportDisputeCase[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [selected, setSelected] = useState<ServiceCardItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, ticketsRes, disputesRes, escalationsRes] =
          await Promise.all([
            getSupportDashboardStats().catch(() => null),
            getHelpTickets().catch(() => null),
            getSupportDisputes().catch(() => null),
            getEscalations().catch(() => null),
          ]);

        if (cancelled) return;
        if (statsRes?.success) setStats(statsRes.data);
        if (ticketsRes?.success) setTickets(ticketsRes.data);
        if (disputesRes?.success) setDisputes(disputesRes.data);
        if (escalationsRes?.success) setEscalations(escalationsRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openTickets = tickets.filter(
    (x) => x.status === "open" || x.status === "in_progress"
  );
  const urgentTickets = tickets.filter(
    (x) => x.priority === "urgent" || x.priority === "high"
  );
  const pendingDisputes = disputes.filter(
    (d) => d.status === "open" || d.status === "under_review"
  );
  const disputedValue = pendingDisputes.reduce(
    (sum, d) => sum + (d.disputedAmountBdt || 0),
    0
  );
  const activeEscalations = escalations.filter((e) => e.status !== "resolved");

  const serviceCards: ServiceCardItem[] = [
    {
      id: "disputes",
      moduleKey: "disputes",
      icon: Scale,
      titleBn: "বিরোধ নিষ্পত্তি",
      titleEn: "Disputes",
      badgeBn: `${stats.pendingDisputesCount}টি অপেক্ষমাণ`,
      badgeEn: `${stats.pendingDisputesCount} Pending`,
      descBn: "ক্রেতা-বিক্রেতা বিরোধ পর্যালোচনা ও মধ্যস্থতা করুন",
      descEn: "Review buyer–seller cases and mediate resolutions",
      tone: "violet",
    },
    {
      id: "help_tickets",
      moduleKey: "help_tickets",
      icon: PhoneCall,
      titleBn: "হেল্প টিকেট",
      titleEn: "Help Tickets",
      badgeBn: `${stats.openTicketsCount}টি খোলা`,
      badgeEn: `${stats.openTicketsCount} Open`,
      descBn: "ব্যবহারকারীর সমস্যা, প্রশ্ন ও সহায়তা অনুরোধ",
      descEn: "User questions, bug reports and support requests",
      tone: "purple",
    },
    {
      id: "resolution_center",
      moduleKey: "resolution_center",
      icon: Gavel,
      titleBn: "রেজল্যুশন সেন্টার",
      titleEn: "Resolution Center",
      badgeBn: `${stats.resolvedTodayCount}টি আজ সমাধান`,
      badgeEn: `${stats.resolvedTodayCount} Resolved Today`,
      descBn: "মামলার ফাইল, প্রমাণ ও চূড়ান্ত সিদ্ধান্ত পরিচালনা",
      descEn: "Case files, evidence and final decision management",
      tone: "indigo",
    },
    {
      id: "escalations",
      moduleKey: "escalations",
      icon: AlertTriangle,
      titleBn: "এসকালেশন",
      titleEn: "Escalations",
      badgeBn: `${stats.activeEscalationsCount}টি সক্রিয়`,
      badgeEn: `${stats.activeEscalationsCount} Active`,
      descBn: "উর্ধ্বতন কর্মকর্তাকে পাঠানো জরুরি মামলা",
      descEn: "Urgent cases handed up for senior review",
      tone: "amber",
    },
    {
      id: "messages",
      moduleKey: "messages",
      icon: Mail,
      titleBn: "বার্তা",
      titleEn: "Messages",
      badgeBn: "সরাসরি কথোপকথন",
      badgeEn: "Direct Chat",
      descBn: "ব্যবহারকারী ও কর্মীদের সাথে সরাসরি যোগাযোগ",
      descEn: "Communicate directly with users and staff",
      tone: "cyan",
    },
    {
      id: "status",
      icon: Clock,
      titleBn: "প্ল্যাটফর্ম অবস্থা",
      titleEn: "Queue Health",
      badgeBn: `${openTickets.length + pendingDisputes.length}টি খোলা`,
      badgeEn: `${openTickets.length + pendingDisputes.length} Open`,
      descBn: "সকল খোলা মামলার সারসংক্ষেপ ও দায়িত্বপ্রাপ্ত এজেন্ট",
      descEn: "Summary of open cases and their assigned agents",
      tone: "teal",
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Mission header */}
      <DashboardHero
        title={t("সাপোর্ট ড্যাশবোর্ড", "Support Dashboard")}
        subtitle={t(
          "বিরোধ, হেল্প ডেস্ক ও মামলা নিষ্পত্তির কেন্দ্র।",
          "Disputes, help desk and case resolution in one workspace."
        )}
        meta={
          <>
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span>{t("ব্যবহারকারী সেবা ও মধ্যস্থতা", "User Care & Mediation")}</span>
            <span className="text-slate-300 dark:text-[#444]">•</span>
            <span>{t("২৪/৭ সচল", "Open 24/7")}</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => onNavigate("help_tickets")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t("খোলা টিকেট", "Open Tickets")}</span>
          </button>
        }
      />

      {/* Live KPIs */}
      <DashboardStatGrid
        tiles={[
          {
            id: "open-tickets",
            title: t("খোলা টিকেট", "Open Tickets"),
            value: stats.openTicketsCount,
            change: `${urgentTickets.length} ${t("জরুরি", "urgent")}`,
            trend: urgentTickets.length > 0 ? "down" : "up",
            subtitle: t("খোলা ও চলমান সহায়তা অনুরোধ", "Open and in-progress requests"),
            icon: PhoneCall,
            colorScheme: "blue",
            onClick: () => onNavigate("help_tickets"),
          },
          {
            id: "pending-disputes",
            title: t("অপেক্ষমাণ বিরোধ", "Pending Disputes"),
            value: stats.pendingDisputesCount,
            change: fmtBdt(disputedValue),
            trend: "neutral",
            subtitle: t("মধ্যস্থতা ও পর্যালোচনায়", "Under review or mediation"),
            icon: Scale,
            colorScheme: "rose",
            onClick: () => onNavigate("disputes"),
          },
          {
            id: "resolved-today",
            title: t("আজ নিষ্পত্তিকৃত", "Resolved Today"),
            value: stats.resolvedTodayCount,
            change: t("চমৎকার", "Great"),
            trend: "up",
            subtitle: t("আজকের মামলা বন্ধ হয়েছে", "Cases closed today"),
            icon: CheckCircle2,
            colorScheme: "emerald",
            onClick: () => onNavigate("resolution_center"),
          },
          {
            id: "escalations",
            title: t("সক্রিয় এসকালেশন", "Active Escalations"),
            value: stats.activeEscalationsCount,
            change: t("দ্রুত দেখুন", "Needs review"),
            trend: stats.activeEscalationsCount > 0 ? "down" : "neutral",
            subtitle: t("উর্ধ্বতন কর্মকর্তার নজরে", "With senior officers"),
            icon: AlertTriangle,
            colorScheme: "amber",
            onClick: () => onNavigate("escalations"),
          },
        ]}
      />

      {/* Service grid */}
      <ServiceGrid
        label={t("সাপোর্ট সেবা (আইকনে ক্লিক করে তথ্য দেখুন)", "Support Services (Click Icon for Details)")}
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
          {selected.id === "disputes" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("অপেক্ষমাণ", "Pending")}
                  value={pendingDisputes.length}
                  valueClassName="text-rose-700 dark:text-rose-400"
                />
                <ModalStat
                  label={t("বিতর্কিত অঙ্ক", "Disputed Value")}
                  value={fmtBdt(disputedValue)}
                />
              </div>
              {pendingDisputes.length > 0 ? (
                <div className="space-y-2">
                  {pendingDisputes.slice(0, 4).map((d) => (
                    <ModalRow
                      key={d.id}
                      title={`${d.caseNumber} · ${d.disputeType}`}
                      subtitle={`${d.plaintiff.name} vs ${d.defendant.name} · ${fmtBdt(d.disputedAmountBdt)}`}
                      chip={
                        <ModalChip className={disputeChip(d.status)}>
                          {d.status === "under_review"
                            ? t("পর্যালোচনায়", "In Review")
                            : d.status === "mediation"
                              ? t("মধ্যস্থতা", "Mediation")
                              : t("খোলা", "Open")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t("কোনো বিরোধ অপেক্ষমাণ নেই — সব নিষ্পত্তি হয়েছে।", "No disputes pending — everything is settled.")}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "help_tickets" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("খোলা টিকেট", "Open Tickets")}
                  value={openTickets.length}
                  valueClassName="text-blue-700 dark:text-blue-400"
                />
                <ModalStat
                  label={t("জরুরি", "Urgent / High")}
                  value={urgentTickets.length}
                  valueClassName="text-rose-700 dark:text-rose-400"
                />
              </div>
              {openTickets.length > 0 ? (
                <div className="space-y-2">
                  {openTickets.slice(0, 4).map((ticket) => (
                    <ModalRow
                      key={ticket.id}
                      title={`${ticket.ticketNumber} · ${ticket.subject}`}
                      subtitle={`${ticket.requesterName} · ${ticket.category} · ${fmtDate(ticket.openedAt)}`}
                      chip={
                        <ModalChip className={ticketChip(ticket.status)}>
                          {ticket.status === "in_progress"
                            ? t("চলছে", "Working")
                            : t("খোলা", "Open")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t("সব টিকেটের উত্তর দেওয়া হয়েছে — ইনবক্স খালি।", "Every ticket has a reply — inbox is clear.")}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "resolution_center" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("আজ সমাধান", "Resolved Today")}
                  value={stats.resolvedTodayCount}
                  valueClassName="text-emerald-700 dark:text-emerald-400"
                />
                <ModalStat
                  label={t("মোট মামলা", "Total Cases")}
                  value={disputes.length + tickets.length}
                />
              </div>
              {disputes.filter((d) => d.status === "resolved" || d.status === "dismissed").length >
              0 ? (
                <div className="space-y-2">
                  {disputes
                    .filter((d) => d.status === "resolved" || d.status === "dismissed")
                    .slice(0, 3)
                    .map((d) => (
                      <ModalRow
                        key={d.id}
                        title={`${d.caseNumber} · ${d.disputeType}`}
                        subtitle={`${d.assignedAgentName} · ${fmtDate(d.openedAt)}`}
                        chip={
                          <ModalChip className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {d.status === "resolved"
                              ? t("সমাধান", "Resolved")
                              : t("খারিজ", "Dismissed")}
                          </ModalChip>
                        }
                      />
                    ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t(
                    "এখনো কোনো চূড়ান্ত সিদ্ধান্ত জমা হয়নি।",
                    "No final decisions recorded yet."
                  )}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "escalations" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("সক্রিয়", "Active")}
                  value={activeEscalations.length}
                  valueClassName="text-amber-700 dark:text-amber-400"
                />
                <ModalStat
                  label={t("মোট", "All Time")}
                  value={escalations.length}
                />
              </div>
              {escalations.length > 0 ? (
                <div className="space-y-2">
                  {escalations.slice(0, 4).map((e) => (
                    <ModalRow
                      key={e.id}
                      title={`${e.caseNumber} · ${e.escalatedTo}`}
                      subtitle={`${e.reason} · ${fmtDate(e.escalatedAt)}`}
                      chip={
                        <ModalChip className={escalationChip(e.status)}>
                          {e.status === "resolved"
                            ? t("সমাধান", "Resolved")
                            : e.status === "acknowledged"
                              ? t("গৃহীত", "Acknowledged")
                              : t("অপেক্ষমাণ", "Pending")}
                        </ModalChip>
                      }
                    />
                  ))}
                </div>
              ) : (
                <ModalEmpty>
                  {t("কোনো এসকালেশন নেই।", "No escalations raised.")}
                </ModalEmpty>
              )}
            </div>
          )}

          {selected.id === "messages" && (
            <div className="space-y-3">
              <ModalRow
                title={t("ব্যবহারকারী সাথে কথোপকথন", "Chat with users")}
                subtitle={t(
                  "টিকেট ও বিরোধের মধ্য দিয়ে সরাসরি বার্তা",
                  "Direct messages threaded through tickets and disputes"
                )}
                chip={
                  <ModalChip className="bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300">
                    {t("সক্রিয়", "Active")}
                  </ModalChip>
                }
              />
              <ModalRow
                title={t("অভিযোগ দল", "Escalation desk")}
                subtitle={t(
                  "জরুরি মামলা উর্ধ্বতন কর্মকর্তাকে পাঠান",
                  "Hand urgent cases to senior officers"
                )}
                chip={
                  <ModalChip className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    {activeEscalations.length}
                  </ModalChip>
                }
              />
              <ModalEmpty>
                <span className="inline-flex items-center gap-2">
                  <Info className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  {t(
                    "সব বার্তা একই জায়গায় — উত্তর দিতে টিকেট খুলুন।",
                    "All conversations in one place — open a ticket to reply."
                  )}
                </span>
              </ModalEmpty>
            </div>
          )}

          {selected.id === "status" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ModalStat
                  label={t("খোলা মামলা", "Open Cases")}
                  value={openTickets.length + pendingDisputes.length}
                  valueClassName="text-blue-700 dark:text-blue-400"
                />
                <ModalStat
                  label={t("সক্রিয় এজেন্ট", "Assigned Agents")}
                  value={
                    new Set(
                      [...openTickets.map((x) => x.assignedAgentName),
                        ...pendingDisputes.map((x) => x.assignedAgentName)].filter(Boolean)
                    ).size
                  }
                />
              </div>
              <ModalRow
                title={t("দায়িত্বপ্রাপ্ত এজেন্ট", "Agents on duty")}
                subtitle={Array.from(
                  new Set(
                    [...openTickets.map((x) => x.assignedAgentName),
                      ...pendingDisputes.map((x) => x.assignedAgentName)].filter(Boolean)
                  )
                )
                  .slice(0, 3)
                  .join(", ") || t("কেউ নেই", "None assigned")}
                chip={
                  <ModalChip className="bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300">
                    {t("লাইভ", "Live")}
                  </ModalChip>
                }
              />
            </div>
          )}
        </ServiceInfoModal>
      )}
    </div>
  );
};
