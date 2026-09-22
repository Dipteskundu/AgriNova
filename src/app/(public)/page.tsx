"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop", alt: "সবুজ ধান ক্ষেত", altEn: "Green paddy field" },
  { src: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop", alt: "তাজা সবজি বাজার", altEn: "Fresh vegetables market" },
  { src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop", alt: "গম ফসল", altEn: "Wheat harvest" },
  { src: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop", alt: "ধানের সিঁড়ি", altEn: "Rice terraces" },
  { src: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop", alt: "কলা বাগান", altEn: "Banana plantation" },
  { src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop", alt: "কৃষি ভূদৃশ্য", altEn: "Farm landscape" },
  { src: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop", alt: "ভুট্টা ক্ষেত সূর্যাস্ত", altEn: "Corn field sunset" },
  { src: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop", alt: "চা বাগান", altEn: "Tea garden" },
];

export default function HomePage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Farmer");
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = useCallback((bn: string, en: string) => language === 'bn' ? bn : en, [language]);

  const autoScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: 280, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(autoScroll, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoScroll]);

  const pauseAutoScroll = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  const resumeAutoScroll = () => { intervalRef.current = setInterval(autoScroll, 3000); };

  const STAGES = [
    { num: "01", title: t("পরিকল্পনা", "PLAN"), desc: t("আপনার মাটি, জলবায়ু ও বাজার চাহিদা অনুযায়ী AI-চালিত ফসল নির্বাচন।", "AI-powered crop selection based on your soil, climate, and market demand."), icon: "Calendar" as IconName },
    { num: "02", title: t("ক্রয়", "BUY"), desc: t("যাচাইকৃত সরবরাহকারী থেকে সার্টিফাইড বীজ ও উপকরণ সংগ্রহ।", "Procure certified seeds and inputs from verified suppliers."), icon: "ShoppingCart" as IconName },
    { num: "03", title: t("চাষ", "GROW"), desc: t("তাৎক্ষণিক কৃষি পরামর্শ ও স্যাটেলাইট ফসল পর্যবেক্ষণ।", "Real-time agronomic advisory and satellite crop monitoring."), icon: "Sprout" as IconName },
    { num: "04", title: t("পর্যবেক্ষণ", "MONITOR"), desc: t("স্বয়ংক্রিয় সতর্কতাসহ IoT-চালিত মাঠ পর্যবেক্ষণ।", "IoT-powered field monitoring with automated alerts."), icon: "Eye" as IconName },
    { num: "05", title: t("যাচাই", "VERIFY"), desc: t("২৪ ঘণ্টার ল্যাব-গ্রেড মান যাচাই।", "24-hour laboratory-grade quality verification."), icon: "ShieldCheck" as IconName },
    { num: "06", title: t("বিক্রয়", "SELL"), desc: t("ডিমান্ড বোর্ডে পাইকারি ক্রেতাদের সাথে সংযুক্ত হোন।", "Connect with wholesale buyers on the demand board."), icon: "Store" as IconName },
    { num: "07", title: t("ডেলিভারি", "DELIVER"), desc: t("কোল্ড-চেইন ট্র্যাকিংসহ সমন্বিত লজিস্টিক্স।", "Coordinated logistics with cold-chain tracking."), icon: "Truck" as IconName },
    { num: "08", title: t("পেমেন্ট", "GET PAID"), desc: t("এসক্রো-সুরক্ষিত তাৎক্ষণিক মোবাইল পেমেন্ট।", "Escrow-protected instant mobile payment."), icon: "Coins" as IconName },
    { num: "09", title: t("বিশ্লেষণ", "ANALYZE"), desc: t("ফসলভিত্তিক লাভজনকতা ও মৌসুমি রিপোর্ট।", "Crop-by-crop profitability and season reports."), icon: "BarChart3" as IconName },
  ];

  const TESTIMONIALS = [
    { name: "আব্দুল মালেক", nameEn: "Abdul Malek", role: t("কৃষক, বগুড়া", "Farmer, Bogura"), quote: t("FarmPath helped me increase my paddy yield by 20% with their AI recommendations. The verified buyers mean I get fair prices every time.", " আমার AI পরামর্শের মাধ্যমে ধানের ফলন ২০% বাড়িয়েছে। যাচাইকৃত ক্রেতারা প্রতিবার ন্যায্য মূল্য দেন।"), avatar: "AM" },
    { name: "ফাতেমা বেগম", nameEn: "Fatema Begum", role: t("কৃষক, রংপুর", "Farmer, Rangpur"), quote: t("I used to travel 3 hours to sell my vegetables. Now buyers come to me through FarmPath. My income has doubled in just one season.", "আমি সবজি বিক্রি করতে ৩ ঘণ্টা যেতাম। এখন ক্রেতারা FarmPath-র মাধ্যমে আমার কাছে আসেন। মাত্র এক মৌসুমে আয় দ্বিগুণ হয়েছে।"), avatar: "FB" },
    { name: t("রহিম ট্রেডিং কো.", "Rahim Trading Co."), role: t("পাইকারি ক্রেতা, ঢাকা", "Wholesale Buyer, Dhaka"), quote: t("The 24-hour quality verification gives us confidence. We source directly from verified farmers — no middlemen, no surprises.", "২৪ ঘণ্টার মান যাচাই আমাদের আত্মবিশ্বাস দেয়। আমরা সরাসরি যাচাইকৃত কৃষক থেকে সরবরাহ निइ — कोनो मध्यस्वत्वभोगी नेइ।"), avatar: "RT" },
  ];

  const STAKEHOLDERS = [
    { title: t("কৃষক", "Farmer"), desc: t("ফসল পরিচালনা, লাভজনকতা ট্র্যাক করুন এবং ভর্তুকি পান।", "Manage crops, track profitability, and access subsidies."), icon: "Sprout" as IconName },
    { title: t("পাইকারি ক্রেতা", "Wholesale Buyer"), desc: t("সরাসরি কৃষক থেকে যাচাইকৃত পণ্য সংগ্রহ করুন।", "Source verified produce directly from farmers."), icon: "Store" as IconName },
    { title: t("ইনপুট সরবরাহকারী", "Input Supplier"), desc: t("সার্টিফাইড উপকরণ নিয়ে সারা দেশে কৃষকদের কাছে পৌঁছান।", "Reach farmers nationwide with certified inputs."), icon: "PackageCheck" as IconName },
    { title: t("মান পরিদর্শক", "Quality Inspector"), desc: t("অডিট পরিচালনা করুন এবং ডিজিটাল গ্রেড সার্টিফিকেট প্রদান করুন।", "Conduct audits and issue digital grade certificates."), icon: "Microscope" as IconName },
    { title: t("লজিস্টিক্স পার্টনার", "Logistics Partner"), desc: t("বহর প্রেরণ ও ডেলিভারি নিশ্চিতকরণ পরিচালনা করুন।", "Manage fleet dispatch and delivery confirmations."), icon: "Truck" as IconName },
    { title: t("প্রশাসক", "Administrator"), desc: t("পরিচালনা, বিবাদ ও সম্মতি তত্ত্বাবধান করুন।", "Oversee operations, disputes, and compliance."), icon: "LayoutDashboard" as IconName },
  ];

  return (
    <div className="flex flex-col">

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center h-full">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-[#f0f0f0]">
                <span className="sm:hidden">From the field<br />to the market, one<br />connected platform</span>
                <span className="hidden sm:inline">{t("খামার থেকে বাজার পর্যন্ত, একটি সংযুক্ত প্ল্যাটফর্ম", "From the field to the market, one connected platform")}</span>
              </h1>
              <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-500 dark:text-[#a0a0a0] leading-relaxed max-w-lg">
                {t("FarmPath প্রতিটি কৃষককে সম্পূর্ণ কৃষি যাত্রায় নির্দেশনা দেয় — সঠিক ফসল বাছাই, উপকরণ ক্রয়, নির্দেশনায় চাষ, মান যাচাই, ক্রেতা ম্যাচিং, ডেলিভারি, পেমেন্ট ও লাভজনকতা বোঝা।", "FarmPath guides every farmer through the whole agricultural journey — pick the right crop, buy inputs, grow with guidance, verify quality, get matched buyers, deliver, get paid, and understand profitability.")}
              </p>
              <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                  {t("প্রারম্ভিক অ্যাক্সেস ওয়েটলিস্টে যোগ দিন", "Join the early access waitlist")}
                  <Icon name="ArrowRight" size={14} />
                </Link>
                <Link href="#journey" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-[#333333] dark:bg-[#0a0a0a] dark:text-[#e0e0e0] dark:hover:border-[#444444]">
                  {t("৯-ধাপের যাত্রা দেখুন", "See the 9-step journey")}
                </Link>
              </div>
              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400 dark:text-[#666666]">
                <span className="flex items-center gap-1.5"><Icon name="Landmark" size={13} />{t("সরকারি ফসল পরামর্শ", "Government crop advice")}</span>
                <span className="hidden sm:block h-3 w-px bg-slate-300 dark:bg-[#333333]" />
                <span className="flex items-center gap-1.5"><Icon name="ShieldCheck" size={13} />{t("২৪ ঘণ্টার মান যাচাই", "24h quality verification")}</span>
                <span className="hidden sm:block h-3 w-px bg-slate-300 dark:bg-[#333333]" />
                <span className="flex items-center gap-1.5"><Icon name="Globe" size={13} />{t("বাংলা + ইংরেজি", "Bangla + English")}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&crop=center" alt={t("সবুজ ধান ক্ষেত", "Green paddy field")} className="w-full h-52 sm:h-60 object-cover" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-sm dark:bg-[#111111]/90">
                  <Icon name="CheckCircle" size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-[#e0e0e0]">{t("গ্রেড A — যাচাইকৃত ফসল লট", "Grade A — Verified Harvest Lot")}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0] mb-1">{t("প্রারম্ভিক অ্যাক্সেস সংরক্ষণ করুন", "Reserve early access")}</h3>
                <p className="text-xs text-slate-400 dark:text-[#666666] mb-4">{t("অঞ্চল অনুযায়ী কৃষক ও ক্রেতাদের ধাপে ধাপে আমন্ত্রণ জানানো হয়।", "Farmers and buyers are invited in stages as regions open.")}</p>
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-[#0a0a0a] dark:border-[#333333] dark:text-[#f0f0f0] dark:placeholder:text-[#666666]" />
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-[#0a0a0a] dark:border-[#333333] dark:text-[#e0e0e0]">
                    <option>{t("কৃষক", "Farmer")}</option><option>{t("ক্রেতা", "Buyer")}</option><option>{t("সরবরাহকারী", "Supplier")}</option>
                  </select>
                </div>
                <button className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 flex items-center justify-center gap-2 cursor-pointer">
                  {t("Request early access", "প্রারম্ভিক অ্যাক্সেস অনুরোধ করুন")} <Icon name="ArrowRight" size={14} />
                </button>
                <p className="mt-2.5 text-center text-[11px] text-slate-400 dark:text-[#666666]">{t("১,২৪৫ জন কৃষক ইতিমধ্যে অপেক্ষা করছেন", "1,245 farmers already waiting")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Image Gallery Strip ──────────────────────────────── */}
      <section className="py-8 bg-white dark:bg-[#000000] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-[#666666]">{t("সারা বাংলাদেশ", "Across Bangladesh")}</p>
          </div>
        </div>
        <div ref={scrollRef} onMouseEnter={pauseAutoScroll} onMouseLeave={resumeAutoScroll} className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-4 sm:px-6 lg:px-[max(1rem,calc((100vw-80rem)/2+1rem))] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {GALLERY_IMAGES.map((img, i) => (
            <div key={i} className="relative flex-none w-64 h-44 rounded-2xl overflow-hidden group cursor-pointer">
              <img src={img.src} alt={language === 'bn' ? img.alt : img.altEn} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-3 left-3 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">{language === 'bn' ? img.alt : img.altEn}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 9-Stage Journey ──────────────────────────────────── */}
      <section id="journey" className="py-20 sm:py-28 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("শেষ থেকে শেষ ট্রেসেবিলিটি", "End-to-End Traceability")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("৯-ধাপের সংযুক্ত যাত্রা", "The 9-Stage Connected Journey")}</h2>
            <p className="mt-3 text-slate-500 dark:text-[#a0a0a0]">{t("নির্ভুল পরিকল্পনা থেকে তাৎক্ষণিক পেমেন্ট — প্রতিটি ধাপ ট্র্যাক ও যাচাইকৃত।", "From precision planning to instant payments — every step tracked and verified.")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAGES.map((s) => (
              <div key={s.num} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] group hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white dark:bg-emerald-500">
                  <Icon name={s.icon} size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{s.num}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">{s.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0a0] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ─────────────────────────────────────── */}
      <section className="py-16 bg-emerald-600 dark:bg-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} /></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
            {[
              { value: "6M+", label: t("কৃষক ক্ষমতায়ন", "Farmers Empowered") },
              { value: "64", label: t("জেলা কভারেজ", "Districts Covered") },
              { value: "480+", label: t("ফসল জাত", "Crop Varieties") },
              { value: "24hr", label: t("যাচাই গতি", "Verification Speed") },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-emerald-100 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Two Marketplaces ─────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#000000]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("বাজার", "Marketplace")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("দুটি ডিজিটাল বাজার, একটি ইকোসিস্টেম", "Two digital marketplaces, one ecosystem")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] group">
              <div className="relative h-44 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=300&fit=crop" alt={t("তাজা সবজি", "Fresh vegetables")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white">{t("ইনপুট বাজার", "Input Marketplace")}</h3>
                  <p className="text-xs text-white/70">{t("কৃষক ও সরবরাহকারীদের জন্য", "For Farmers & Suppliers")}</p>
                </div>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {[t("সার্টিফাইড বীজ ও ফসল জাত", "Certified seeds and crop varieties"), t("সরকার অনুমোদিত সার", "Government-approved fertilizers"), t("সেচ ও সোলার সরঞ্জাম", "Irrigation and solar equipment"), t("স্বচ্ছ সরাসরি মূল্য", "Transparent direct pricing")].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#a0a0a0]">
                      <Icon name="Check" size={12} className="text-emerald-500 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] group">
              <div className="relative h-44 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=300&fit=crop" alt={t("পণ্য বাজার", "Produce market")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white">{t("পণ্য বাজার", "Produce Marketplace")}</h3>
                  <p className="text-xs text-white/70">{t("কৃষক ও ক্রেতাদের জন্য", "For Farmers & Buyers")}</p>
                </div>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {[t("তাৎক্ষণিক ক্রেতা চাহিদা তালিকা", "Real-time buyer demand listings"), t("২৪ ঘণ্টার ল্যাব গ্রেডিং", "24-hour lab grading"), t("এসক্রো-সুরক্ষিত লেনদেন", "Escrow-protected transactions"), t("সারা দেশে কোল্ড-চেইন লজিস্টিক্স", "Nationwide cold-chain logistics")].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#a0a0a0]">
                      <Icon name="Check" size={12} className="text-emerald-500 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("মতামত", "Testimonials")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("কৃষক ও ক্রেতাদের আস্থা", "Trusted by farmers and buyers")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((tst) => (
              <div key={tst.name} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map((star) => <Icon key={star} name="Star" size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-600 dark:text-[#a0a0a0] leading-relaxed flex-1 mb-4">&ldquo;{tst.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-[#222222]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-400">{tst.avatar}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f0f0f0]">{language === 'bn' ? tst.name : tst.nameEn}</p>
                    <p className="text-[10px] text-slate-400 dark:text-[#666666]">{tst.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 24-Hour Verification ─────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#000000]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("মান নিশ্চয়তা", "Quality Assurance")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("২৪ ঘণ্টার মান যাচাই", "24-hour quality verification")}</h2>
            <p className="mt-3 text-slate-500 dark:text-[#a0a0a0]">{t("পণ্য ও উপকরণের জন্য ল্যাব-গ্রেড যাচাই, সারা দেশে।", "Lab-grade verification for produce and inputs, nationwide.")}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: t("কৃষকের অনুরোধ", "Farmer Request"), desc: t("ছবি ও মাঠের তথ্যসহ ফসল লট জমা দিন।", "Submit harvest lot with photos and field data."), color: "bg-emerald-500" },
              { step: "2", title: t("পরিদর্শক নির্ধারিত", "Inspector Assigned"), desc: t("জিপিএসের মাধ্যমে নিকটতম সার্টিফাইড পরিদর্শক প্রেরিত।", "Nearest certified inspector dispatched via GPS."), color: "bg-teal-500" },
              { step: "3", title: t("পদার্থবিদ্যাগত অডিট", "Physical Audit"), desc: t("ল্যাব-গ্রেড আর্দ্রতা, ওজন ও মান পরীক্ষা।", "Lab-grade moisture, weight, and quality check."), color: "bg-cyan-500" },
              { step: "4", title: t("গ্রেড সিল প্রদান", "Grade Seal Issued"), desc: t("ডিজিটাল সার্টিফিকেট তাৎক্ষণিকভাবে ক্রেতাদের সাথে শেয়ার।", "Digital certificate shared with buyers instantly."), color: "bg-emerald-600" },
            ].map((p, i) => (
              <div key={p.step} className="relative rounded-2xl bg-[#f9f9f9] dark:bg-[#111111] p-5">
                {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-slate-300 dark:bg-[#333333] z-10" />}
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${p.color} text-[11px] font-bold text-white`}>{p.step}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0] mt-3 mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500 dark:text-[#a0a0a0] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stakeholders ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t("বহু-স্টেকহোল্ডার", "Multi-Stakeholder")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">{t("মূল্য শৃঙ্খলার সকলের জন্য তৈরি", "Built for everyone in the value chain")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STAKEHOLDERS.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#111111] dark:border dark:border-[#222222] text-center group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/5 group-hover:from-emerald-100 group-hover:to-emerald-200 dark:group-hover:from-emerald-500/20 dark:group-hover:to-emerald-500/10 transition-colors">
                  <Icon name={s.icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-[#f0f0f0] mb-0.5">{s.title}</h3>
                <p className="text-[10px] text-slate-400 dark:text-[#666666] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA with Image Background ────────────────────────── */}
      <section className="relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&h=500&fit=crop&crop=center" alt={t("কৃষি ভূদৃশ্য", "Farm landscape")} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-emerald-900/80 dark:bg-emerald-950/90" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t("আপনার ডিজিটাল কৃষি যাত্রা শুরু করুন", "Start your digital agriculture journey")}</h2>
          <p className="mt-3 text-emerald-100 max-w-lg mx-auto text-sm">{t("হাজার হাজার কৃষক FarmPath ব্যবহার করে প্রিমিয়াম বাজার, বিশেষজ্ঞ পরামর্শ ও তাৎক্ষণিক পেমেন্ট পাচ্ছেন।", "Join thousands of farmers using FarmPath to access premium markets, get expert advisory, and receive instant payments.")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50">
              <Icon name="Sprout" size={15} />{t("কৃষক হিসেবে নিবন্ধন করুন", "Register as a Farmer")}
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              {t("আরও জানুন", "Learn more")} <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
