"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, ArrowRight, Check } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell, authContainer, authItem } from "./AuthShell";
import { AuthField } from "./AuthField";
import { SocialButtons } from "./SocialButtons";

const ROLE_OPTIONS = [
  { value: "farmer", labelEn: "Farmer", labelBn: "কৃষক" },
  { value: "buyer", labelEn: "Buyer", labelBn: "ক্রেতা" },
  { value: "supplier", labelEn: "Supplier", labelBn: "সরবরাহকারী" },
];

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export const RegisterScreen: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { register, loginWithGoogle, loginWithGitHub } = useAuth();
  const router = useRouter();
  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["farmer"]);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.length === 0) {
      showToast("error", t("অন্তত একটি ভূমিকা নির্বাচন করুন।", "Please select at least one role."));
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        roles: selectedRoles,
        phone,
      });
      showToast(
        "success",
        t("সফলভাবে নিবন্ধন হয়েছে। এখন লগিন করুন।", "Registration successful. Please sign in.")
      );
      router.push("/login");
    } catch (err) {
      const { message } = (err ?? {}) as { message?: string };
      showToast(
        "error",
        message || t("নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSocialLoading(true);
    try {
      await loginWithGoogle();
      showToast("success", t("সফলভাবে নিবন্ধন হয়েছে।", "Signed up successfully."));
    } catch (err) {
      const { message, code } = (err ?? {}) as { message?: string; code?: string };
      if (code !== "auth/popup-closed-by-user") {
        showToast("error", message || t("গুগল সাইন-আপ ব্যর্থ হয়েছে।", "Google sign-up failed."));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setSocialLoading(true);
    try {
      await loginWithGitHub();
      showToast("success", t("সফলভাবে নিবন্ধন হয়েছে।", "Signed up successfully."));
    } catch (err) {
      const { message, code } = (err ?? {}) as { message?: string; code?: string };
      if (code !== "auth/popup-closed-by-user") {
        showToast("error", message || t("গিটহাব সাইন-আপ ব্যর্থ হয়েছে।", "GitHub sign-up failed."));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <AuthShell mode="register">
      <motion.div
        variants={authContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={authItem} className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("অ্যাকাউন্ট তৈরি করুন", "Create account")}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("শুরু করতে নিচের তথ্য পূরণ করুন", "Fill in the details below to get started")}
          </p>
        </motion.div>

        <motion.form variants={authItem} onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            id="register-name"
            label={t("পুরো নাম", "Full name")}
            icon={<User className="h-4 w-4" />}
            required
            value={name}
            onChange={setName}
            placeholder={t("আপনার নাম", "Your name")}
            autoComplete="name"
          />
          <AuthField
            id="register-email"
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
            id="register-phone"
            label={t("মোবাইল নম্বর", "Phone number")}
            icon={<Phone className="h-4 w-4" />}
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder={t("+৮৮০ ১৭XX-XXXXXX", "+880 17XX-XXXXXX")}
            autoComplete="tel"
          />
          <AuthField
            id="register-password"
            label={t("পাসওয়ার্ড", "Password")}
            icon={<Lock className="h-4 w-4" />}
            type="password"
            required
            minLength={6}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <div>
            <span className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
              {t("ভূমিকা (এক বা একাধিক নির্বাচন করুন)", "Role (select one or more)")}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((opt) => {
                const active = selectedRoles.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRole(opt.value)}
                    aria-pressed={active}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${
                      active
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                        : "border-[var(--border-default)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {language === "bn" ? opt.labelBn : opt.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || selectedRoles.length === 0}
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
                  {t("নিবন্ধন করুন", "Create account")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </button>
        </motion.form>

        <motion.p variants={authItem} className="text-center text-xs text-[var(--text-muted)]">
          {t("ইতিমধ্যে অ্যাকাউন্ট আছে?", "Already have an account?")}{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            {t("প্রবেশ করুন", "Sign in")}
          </Link>
        </motion.p>

        <motion.div variants={authItem}>
          <SocialButtons
            loading={socialLoading}
            onGoogle={handleGoogleSignup}
            onGitHub={handleGitHubSignup}
          />
        </motion.div>
      </motion.div>
    </AuthShell>
  );
};
