"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { language } = useLanguage();
  const t = useCallback((bn: string, en: string) => language === 'bn' ? bn : en, [language]);

  const VALUES = [
    { title: t("বিজ্ঞান-প্রথম", "Science-First"), desc: t("প্রতিটি পরামর্শ BARI, BRRI ও SRDI থেকে সরকারি গবেষণা তথ্য দ্বারা সমর্থিত।", "Every recommendation backed by government research data from BARI, BRRI, and SRDI."), icon: "FlaskConical" as IconName },
    { title: t("কৃষক-কেন্দ্রিক", "Farmer-Centric"), desc: t("কম ডিজিটাল সাক্ষরতার জন্য ডিজাইন — বাংলা ভয়েস, সহজ UI, ফোন-প্রথম।", "Designed for low digital literacy — Bangla voice, simple UI, phone-first."), icon: "Sprout" as IconName },
    { title: t("সম্পূর্ণ স্বচ্ছতা", "Full Transparency"), desc: t("এসক্রো-সুরক্ষিত পেমেন্ট, যাচাইকৃত গ্রেড ও উন্মুক্ত বাজার মূল্য।", "Escrow-protected payments, verified grades, and open marketplace pricing."), icon: "ShieldCheck" as IconName },
    { title: t("সারা দেশে বিস্তৃত", "Nationwide Reach"), desc: t("দূরবর্তী হাওর অববাহিকা থেকে শহরের পাইকারি বাজার — শেষ পর্যন্ত সংযুক্ত।", "From remote haor basins to urban wholesale markets — connected end to end."), icon: "Globe" as IconName },
  ];

  const TIMELINE = [
    { year: t("পরিকল্পনা", "Plan"), desc: t("আপনার মাটি, জলবায়ু ও বাজার চাহিদা অনুযায়ী AI-চালিত ফসল নির্বাচন।", "AI-powered crop selection based on your soil, climate, and market demand."), icon: "Calendar" as IconName },
    { year: t("ক্রয়", "Buy"), desc: t("যাচাইকৃত সরকার-অনুমোদিত সরবরাহকারী থেকে সার্টিফাইড বীজ ও উপকরণ সংগ্রহ।", "Procure certified seeds and inputs from verified government-approved suppliers."), icon: "ShoppingCart" as IconName },
    { year: t("চাষ", "Grow"), desc: t("তাৎক্ষণিক কৃষি পরামর্শ, আবহাওয়া সতর্কতা ও স্যাটেলাইট ফসল পর্যবেক্ষণ।", "Real-time agronomic advisory, weather alerts, and satellite crop monitoring."), icon: "Sprout" as IconName },
    { year: t("বিক্রয়", "Sell"), desc: t("ডিমান্ড বোর্ডে যাচাইকৃত পণ্য তালিকাভুক্ত করুন ও পাইকারি ক্রেতাদের সাথে সংযুক্ত হোন।", "List verified produce on the demand board and connect with wholesale buyers."), icon: "Store" as IconName },
    { year: t("পেমেন্ট", "Get Paid"), desc: t("তাৎক্ষণিক মোবাইল পেমেন্ট বিতরণসহ সুরক্ষিত এসক্রো নিষ্পত্তি।", "Protected escrow settlement with instant mobile payment disbursement."), icon: "Coins" as IconName },
  ];

  const NUMBERS = [
    { value: "6M+", label: t("বাংলাদেশে ৬০ লক্ষ কৃষককে ক্ষমতায়ন", "Farmers to be empowered across Bangladesh") },
    { value: "64", label: t("সারা দেশে ৬৪টি জেলায় সেবা", "Districts covered nationwide") },
    { value: "480+", label: t("আমাদের গবেষণা ডাটাবেসে ৪৮০+ ফসল জাত", "Crop varieties in our research database") },
    { value: "24h", label: t("গড় মান যাচাই সময়", "Average quality verification turnaround") },
    { value: "100%", label: t("এসক্রো-সুরক্ষিত লেনদেন নিশ্চয়তা", "Escrow-protected transaction guarantee") },
    { value: "2", label: t("ভাষা সমর্থিত — বাংলা ও ইংরেজি", "Languages supported — Bangla & English") },
  ];

  return (
    <div className="flex flex-col">

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 mb-6">
              <Icon name="Sprout" size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t("প্রতিষ্ঠিত ২০২৪ — বাংলাদেশ", "Est. 2024 — Bangladesh")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0] leading-[1.08]">
              {t("আমরা তৈরি করছি", "We're building the future of")}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-600 dark:text-emerald-400">{t("বাংলাদেশের কৃষির ভবিষ্যৎ", "Bangladeshi agriculture")}</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-100 dark:bg-emerald-500/15 -z-0 rounded" />
              </span>
            </h1>
            <p className="mt-6 text-base text-slate-500 dark:text-[#a0a0a0] leading-relaxed max-w-xl mx-auto">
              {t("AgriNova ৬০ লক্ষ কৃষককে নির্ভুল সরকারি পরামর্শ, যাচাইকৃত বাজার ও তাৎক্ষণিক এসক্রো-সুরক্ষিত পেমেন্টের সাথে সংযুক্ত করে — সবকিছু বাংলা ও ইংরেজিতে।", "AgriNova connects 6 million farmers to precision government advisory, verified marketplaces, and instant escrow-protected payments — all in Bangla and English.")}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>
      </section>

      {/* ─── Numbers ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#000000]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {NUMBERS.map((n) => (
              <div key={n.label} className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{n.value}</p>
                <p className="text-[11px] text-slate-400 dark:text-[#666666] mt-1 leading-snug">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────────── */}
      <section id="values" className="py-16 sm:py-24 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("আমরা যাতে বিশ্বাস করি", "What we believe")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("গুরুত্বপূর্ণ নীতির উপর নির্মিত", "Built on principles that matter")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] group hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                  <Icon name={v.icon} size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0] mb-1">{v.title}</h3>
                <p className="text-xs text-slate-500 dark:text-[#a0a0a0] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works (Journey) ───────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#000000]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("যাত্রা", "The journey")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("বীজ থেকে বিক্রয়, সম্পূর্ণ সংযুক্ত", "From seed to sale, fully connected")}</h2>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-[2.25rem] left-0 right-0 h-px bg-slate-200 dark:bg-[#222222]" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {TIMELINE.map((tItem, i) => (
                <div key={tItem.year} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 dark:bg-emerald-500 dark:shadow-[0_0_16px_rgba(16,185,129,0.3)] mb-4">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0] mb-1">{tItem.year}</h3>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0a0] leading-relaxed max-w-[200px]">{tItem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partners ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("অংশীদার", "Partners")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("শীর্ষস্থানীয় প্রতিষ্ঠান দ্বারা সমর্থিত", "Backed by leading institutions")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { name: t("কৃষি মন্ত্রণালয়", "Ministry of Agriculture"), role: t("সরকারি অংশীদার", "Government Partner"), icon: "Landmark" as IconName, desc: t("সারা দেশে সম্প্রসারণের জন্য সরকারি অনুমোদন ও নীতিগত সামঞ্জস্য।", "Official government endorsement and policy alignment for nationwide deployment.") },
              { name: "BARI & BRRI", role: t("গবেষণা ডাটাসেট", "Research Datasets"), icon: "Database" as IconName, desc: t("৪৮০+ ফসল জাত ও কৃষি গবেষণা তথ্যের সাথে সরাসরি ইন্টিগ্রেশন।", "Direct integration with 480+ crop varieties and agronomic research data.") },
              { name: t("DAE এক্সটেনশন", "DAE Extension"), role: t("মাঠ নেটওয়ার্ক", "Field Network"), icon: "MapPin" as IconName, desc: t("বাংলাদেশের ৬৪টি জেলায় বিস্তৃত মাঠ যাচাইকরণ নেটওয়ার্ক।", "On-ground verification network spanning all 64 districts of Bangladesh.") },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] group hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                  <Icon name={p.icon} size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0] mb-0.5">{p.name}</h3>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">{p.role}</p>
                <p className="text-xs text-slate-500 dark:text-[#a0a0a0] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission Statement ────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#000000]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#f5f5f5] dark:bg-[#111111] p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10">
              <div className="absolute top-8 left-12 h-40 w-40 rounded-full bg-emerald-500 blur-3xl" />
              <div className="absolute bottom-8 right-12 h-48 w-48 rounded-full bg-emerald-500 blur-3xl" />
            </div>
            <div className="relative z-10">
              <Icon name="Sprout" size={32} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-[#f0f0f0] leading-snug max-w-3xl mx-auto">
                &ldquo;{t("বাংলাদেশের প্রতিটি কৃষকই একই মানের পরামর্শ, উপকরণ ও বাজার পাওয়ার যোগ্য — তারা যেখানেই থাকুন না কেন।", "Every farmer in Bangladesh deserves the same quality of advisory, inputs, and markets — regardless of where they live.")}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm text-slate-400 dark:text-[#666666]">— {t("FarmPath টিম", "FarmPath Team")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("শুরু করতে প্রস্তুত?", "Ready to get started?")}</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-[#a0a0a0] max-w-md mx-auto">{t("FarmPath-এ যোগ দিন এবং আজই আপনার ডিজিটাল কৃষি যাত্রা শুরু করুন।", "Join FarmPath and start your digital agriculture journey today.")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
              <Icon name="Sprout" size={15} />
              {t("কৃষক হিসেবে নিবন্ধন করুন", "Register as a Farmer")}
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-[#333333] dark:bg-[#0a0a0a] dark:text-[#e0e0e0]">
              {t("হোমে ফিরুন", "Back to Home")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
