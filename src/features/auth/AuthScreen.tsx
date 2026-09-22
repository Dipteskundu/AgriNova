"use client";

import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  Lock,
  ArrowRight,
  Mail,
} from '@/components/icons';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import Link from 'next/link';

export const AuthScreen: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const { login, loginWithGoogle, loginWithGitHub } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showToast('success', language === 'bn' ? 'সফলভাবে লগিন হয়েছে।' : 'Signed in successfully.');
    } catch (err: any) {
      showToast('error', err.message || 'Login failed. Please check your credentials.');
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
      showToast('success', language === 'bn' ? 'সফলভাবে লগিন হয়েছে।' : 'Signed in successfully.');
    } catch (err: any) {
      showToast('error', err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      await loginWithGoogle();
      showToast('success', language === 'bn' ? 'সফলভাবে লগিন হয়েছে।' : 'Signed in successfully.');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast('error', err.message || 'Google sign-in failed.');
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setSocialLoading(true);
    try {
      await loginWithGitHub();
      showToast('success', language === 'bn' ? 'সফলভাবে লগিন হয়েছে।' : 'Signed in successfully.');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast('error', err.message || 'GitHub sign-in failed.');
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat text-white flex flex-col antialiased selection:bg-emerald-500 selection:text-white" style={{ backgroundImage: 'url(/auth-bg-login.jpg)' }}>
      <div className="fixed inset-0 bg-black/30" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <PublicNavbar transparent />

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {language === 'bn' ? 'স্বাগতম' : 'Welcome back'}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                {language === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to your account'}
              </p>
            </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                    {language === 'bn' ? 'প্রবেশ করুন' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-white/50 text-center">
                {language === 'bn' ? 'ডেমো অ্যাকাউন্ট দিয়ে চেষ্টা করুন:' : 'Try a demo account:'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('farmer@demo.com', 'demo123')}
                  disabled={loading}
                  className="py-2 px-3 border border-white/20 text-white/70 text-xs font-medium rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('multi@demo.com', 'demo123')}
                  disabled={loading}
                  className="py-2 px-3 border border-white/20 text-white/70 text-xs font-medium rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  Multi-Role
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@demo.com', 'demo123')}
                  disabled={loading}
                  className="py-2 px-3 border border-white/20 text-white/70 text-xs font-medium rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('buyer@demo.com', 'demo123')}
                  disabled={loading}
                  className="py-2 px-3 border border-white/20 text-white/70 text-xs font-medium rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  🛒 Buyer
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-white/50">
              <Link href="/forgot-password" className="hover:text-white/80 transition-colors">
                {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </Link>
              <span className="mx-2">·</span>
              <Link href="/register" className="hover:text-white/80 transition-colors">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account'}
              </Link>
            </div>

            {/* Social Login Divider */}
            <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-xs text-white/40">{language === 'bn' ? 'অথবা' : 'or'}</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Social Login Buttons */}
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={socialLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {socialLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  language === 'bn' ? 'গুগল দিয়ে চালিয়ে যান' : 'Continue with Google'
                )}
              </button>
              <button
                type="button"
                onClick={handleGitHubLogin}
                disabled={socialLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                {socialLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  language === 'bn' ? 'গিটহাব দিয়ে চালিয়ে যান' : 'Continue with GitHub'
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
