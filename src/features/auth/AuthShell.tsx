"use client";


import Image from "next/image";
import React from "react";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sprout, Coins, ShieldCheck } from "@/components/icons";

/**
 * Shared split-screen shell for `/login` and `/register`.
 *
 * Left (or top on mobile): a theme-aware form column that slides in with a
 * direction-aware offset — from the left on login, from the right on
 * register — so moving between the two pages feels like lateral movement.
 * Right: the "living field" brand panel — an emerald gradient mesh with
 * slowly drifting blobs, topographic waves and floating stat cards — that
 * stays rich emerald in both light and dark themes.
 *
 * Form screens compose their content inside `<motion.div
 * variants={authContainer}>` with `authItem` on each section to get the
 * staggered entrance choreography.
 *
 * All motion respects the user's OS preference via `MotionConfig
 * reducedMotion="user"` (transforms are dropped, opacity remains).
 */

/** Container variant: staggered entrance for auth form sections. */
export const authContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

/** Item variant: fade + rise used on each form section. */
export const authItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Ambient layers: drifting gradient blobs + topographic waves. */
const AmbientLayers = () => (
  <>
    <motion.div
      aria-hidden="true"
      className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-emerald-400/25 blur-3xl"
      animate={{ x: [0, 46, -28, 0], y: [0, -34, 22, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      aria-hidden="true"
      className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
      animate={{ x: [0, -38, 24, 0], y: [0, 26, -20, 0] }}
      transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      aria-hidden="true"
      className="absolute top-1/3 left-1/4 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl"
      animate={{ x: [0, 30, -18, 0], y: [0, -22, 16, 0] }}
      transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
    />
    <svg
      aria-hidden="true"
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <g fill="none" stroke="#6ee7b7" strokeOpacity="0.13" strokeWidth="1">
        <path d="M-20 90 C 80 40, 180 140, 420 80" />
        <path d="M-20 180 C 90 130, 200 230, 420 170" />
        <path d="M-20 280 C 60 230, 220 330, 420 260" />
        <path d="M-20 380 C 100 320, 210 430, 420 360" />
        <path d="M-20 480 C 70 430, 190 530, 420 460" />
        <path d="M-20 570 C 110 520, 230 610, 420 550" />
      </g>
    </svg>
  </>
);

function BrandPanel({ variant }: { variant: "strip" | "panel" }) {
  const { language } = useLanguage();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  // Illustrative marketing figures for the brand panel.
  const stats = [
    { Icon: Sprout, value: "12,400+", bn: "কৃষক যোগ দিয়েছেন", en: "farmers onboarded" },
    { Icon: Coins, value: "2,400 MT", bn: "পণ্য বিক্রিত হয়েছে", en: "produce traded" },
    { Icon: ShieldCheck, value: "100%", bn: "নিরাপদ এসক্রো লেনদেন", en: "escrow-secured deals" },
  ];

  const tagline = t("খামার থেকে ন্যায্য বাজার পর্যন্ত", "From farm gate to fair trade");
  const gradient = "bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950";

  if (variant === "strip") {
    // Mobile: a slim brand banner above the form.
    return (
      <div className={`relative flex h-36 items-center justify-center overflow-hidden lg:hidden ${gradient}`}>
        <AmbientLayers />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center gap-3 px-6"
        >
          <Image
            src="/logo.png"
            alt="FarmPath"
            className="h-11 w-11 rounded-xl object-cover shadow-lg shadow-black/30 ring-1 ring-white/20" width={48} height={48} />
          <div>
            <p className="text-base font-bold text-white">FarmPath</p>
            <p className="text-xs text-emerald-200/80">{tagline}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Desktop: the full animated brand panel beside the form.
  return (
    <aside className={`relative hidden overflow-hidden lg:block ${gradient}`}>
      <AmbientLayers />
      <motion.div
        variants={authContainer}
        initial="hidden"
        animate="show"
        className="relative flex h-full flex-col justify-center px-10 py-12 xl:px-14"
      >
        <motion.div variants={authItem} className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="FarmPath"
            className="h-12 w-12 rounded-xl object-cover shadow-lg shadow-black/30 ring-1 ring-white/20" width={48} height={48} />
          <span className="text-xl font-bold text-white">FarmPath</span>
        </motion.div>

        <motion.h2
          variants={authItem}
          className="mt-8 text-3xl font-bold leading-snug tracking-tight text-white xl:text-4xl"
        >
          {tagline}
        </motion.h2>
        <motion.p
          variants={authItem}
          className="mt-3 max-w-md text-sm leading-relaxed text-emerald-100/70"
        >
          {t(
            "কৃষক, ক্রেতা ও সরবরাহকারীদের জন্য বিশ্বস্ত ও নিরাপদ কৃষি বাজার — স্বচ্ছ দাম, সুরক্ষিত লেনদেন।",
            "A trusted, secure agricultural marketplace for farmers, buyers and suppliers — transparent pricing, protected payments."
          )}
        </motion.p>

        <div className="mt-8 space-y-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.en}
              variants={authItem}
              className={i === 1 ? "ml-6" : i === 2 ? "ml-12" : ""}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4.5 + i * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              >
                <div className="flex w-fit max-w-[19rem] items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-md">
                  <span className="rounded-xl bg-emerald-500/20 p-2 text-emerald-200">
                    <s.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-xs text-emerald-100/70">{t(s.bn, s.en)}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}

interface AuthShellProps {
  mode: "login" | "register";
  children: React.ReactNode;
}

export function AuthShell({ mode, children }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-base)] text-[var(--text-primary)] antialiased selection:bg-emerald-500/20">
      <PublicNavbar />
      <MotionConfig reducedMotion="user">
        <div className="flex flex-1 flex-col overflow-hidden lg:grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
          <BrandPanel variant="strip" />
          <motion.section
            initial={{ opacity: 0, x: mode === "register" ? 36 : -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center bg-[var(--bg-surface-1)] px-4 py-10 sm:px-8 lg:py-14"
          >
            <div className="w-full max-w-md">{children}</div>
          </motion.section>
          <BrandPanel variant="panel" />
        </div>
      </MotionConfig>
    </div>
  );
}
