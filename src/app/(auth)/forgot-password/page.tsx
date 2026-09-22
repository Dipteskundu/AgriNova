"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { Mail, ArrowRight, CheckCircle2 } from "@/components/icons";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat text-white flex flex-col antialiased selection:bg-emerald-500 selection:text-white" style={{ backgroundImage: 'url(/auth-bg-login.jpg)' }}>
      {/* Light overlay */}
      <div className="fixed inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <PublicNavbar transparent />

        {/* Centered Card */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset password'}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                {language === 'bn' ? 'আপনার ইমেইল ঠিকানা দিন' : 'Enter your email address'}
              </p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm text-white/70">
                  {language === 'bn'
                    ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'
                    : 'A password reset link has been sent to your email.'}
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:underline font-medium"
                >
                  {language === 'bn' ? 'প্রবেশ পাতায় ফিরুন' : 'Back to sign in'}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      {language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send reset link'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {!sent && (
              <div className="mt-6 text-center text-xs text-white/50">
                <Link href="/login" className="hover:text-white/80 transition-colors">
                  {language === 'bn' ? 'প্রবেশ পাতায় ফিরুন' : 'Back to sign in'}
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
