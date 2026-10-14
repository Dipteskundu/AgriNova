"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Users,
  ShieldCheck,
  Store,
  PackageCheck,
  Search,
  Truck,
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell, authContainer, authItem } from "./AuthShell";
import { AuthField } from "./AuthField";
import { SocialButtons } from "./SocialButtons";

/** One-click demo logins, revealed by the collapsible "demo access" strip. */
const DEMOS = [
  { email: "farmer@demo.com", Icon: Sprout, bn: "কৃষক", en: "Farmer" },
  { email: "multi@demo.com", Icon: Users, bn: "বহু-ভূমিকা", en: "Multi" },
  { email: "admin@demo.com", Icon: ShieldCheck, bn: "এডমিন", en: "Admin" },
  { email: "buyer@demo.com", Icon: Store, bn: "ক্রেতা", en: "Buyer" },
  { email: "supplier@demo.com", Icon: PackageCheck, bn: "সরবরাহকারী", en: "Supplier" },
  { email: "inspector@demo.com", Icon: Search, bn: "পরিদর্শক", en: "Inspector" },
  { email: "logistics@demo.com", Icon: Truck, bn: "লজিস্টিকস", en: "Logistics" },
  { email: "support@demo.com", Icon: HeartPulse, bn: "সাপোর্ট", en: "Support" },
];

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export const AuthScreen: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const { login, loginWithGoogle, loginWithGitHub } = useAuth();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showToast("success", t("সফলভাবে লগিন হয়েছে।", "Signed in successfully."));
    } catch (err) {
      const { message } = (err ?? {}) as { message?: string };
      showToast(
        "error",
        message || t("লগইনব্যর্থ হয়েছে। আপনার পরিচয়পত্র যাচাই করুন।", "Login failed. Please check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      await login(demoEmail, demoPassword);
      showToast("success", t("সফলভাবে লগিন হয়েছে।", "Signed in successfully."));
    } catch (err) {
      const { message } = (err ?? {}) as { message?: string };
      showToast("error", message || t("ডেমো লগইন ব্যর্থ হয়েছে।", "Demo login failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      await loginWithGoogle();
      showToast("success", t("সফলভাবে লগিন হয়েছে।", "Signed in successfully."));
    } catch (err) {
      const { message, code } = (err ?? {}) as { message?: string; code?: string };
      if (code !== "auth/popup-closed-by-user") {
        showToast("error", message || t("গুগল সাইন-ইন ব্যর্থ হয়েছে।", "Google sign-in failed."));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setSocialLoading(true);
    try {
      await loginWithGitHub();
      showToast("success", t("সফলভাবে লগিন হয়েছে।", "Signed in successfully."));
    } catch (err) {
      const { message, code } = (err ?? {}) as { message?: string; code?: string };
      if (code !== "auth/popup-closed-by-user") {
        showToast("error", message || t("গিটহাব সাইন-ইন ব্যর্থ হয়েছে।", "GitHub sign-in failed."));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
      <motion.div
        variants={authContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={authItem} className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("স্বাগতম", "Welcome back")}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("আপনার অ্যাকাউন্টে প্রবেশ করুন", "Sign in to your account")}
          </p>
        </motion.div>

        <motion.form variants={authItem} onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            id="login-email"
            label={t("ইমেইল", "Email")}
            icon={<Mail className="h-4 w-4" />}
            type="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <AuthField
            id="login-password"
            label={t("পাসওয়ার্ড", "Password")}
            icon={<Lock className="h-4 w-4" />}
            type="password"
            required
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/40 disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <Spinner />
              ) : (
                <>
                  {t("প্রবেশ করুন", "Sign In")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </button>
        </motion.form>

        <motion.div variants={authItem} className="flex items-center justify-between text-xs">
          <Link
            href="/forgot-password"
            className="text-[var(--text-muted)] transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t("পাসওয়ার্ড ভুলে গেছেন?", "Forgot password?")}
          </Link>
          <Link
            href="/register"
            className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            {t("অ্যাকাউন্ট তৈরি করুন", "Create account")} →
          </Link>
        </motion.div>

        {/* Collapsible one-click demo access */}
        <motion.div variants={authItem}>
          <button
            type="button"
            onClick={() => setDemoOpen((v) => !v)}
            aria-expanded={demoOpen}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-2)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            {t("দ্রুত ডেমো অ্যাকাউন্ট", "Quick demo access")}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${demoOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {demoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-1.5 pt-3 sm:grid-cols-4">
                  {DEMOS.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoLogin(demo.email, "demo123")}
                      disabled={loading}
                      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-2 py-2 text-[11px] font-medium text-[var(--text-secondary)] transition-all hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50"
                    >
                      <demo.Icon className="h-3.5 w-3.5 shrink-0" />
                      {t(demo.bn, demo.en)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={authItem}>
          <SocialButtons
            loading={socialLoading}
            onGoogle={handleGoogleLogin}
            onGitHub={handleGitHubLogin}
          />
        </motion.div>
      </motion.div>
    </AuthShell>
  );
};
