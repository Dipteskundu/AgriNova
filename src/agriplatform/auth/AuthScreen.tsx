import React, { useState } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  Sprout,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  Trees,
  Scale,
  Sparkles,
  Layers,
} from '@/components/icons';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { useToast } from '@/components/shared/Toast';
import { PortalType } from '@/agriplatform/types';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Farmer' | 'Platform Admin';
  avatarInitials: string;
  location: string;
  portal: PortalType;
}

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [selectedPortal, setSelectedPortal] = useState<PortalType>('farmer');

  // Farmer form state
  const [farmerIdentifier, setFarmerIdentifier] = useState('+880 1712-449821');
  const [farmerPassword, setFarmerPassword] = useState('farmer123');

  // Admin form state
  const [adminIdentifier, setAdminIdentifier] = useState('tariqul.admin@agrisystem.internal');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [loading, setLoading] = useState(false);

  const handleFarmerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: AuthUser = {
        id: 'USR-101',
        name: 'Mohiuddin Khan',
        email: 'mohiuddin.agro@krishi.gov.bd',
        phone: farmerIdentifier,
        role: 'Farmer',
        avatarInitials: 'MK',
        location: 'Sherpur, Bogura (Rajshahi)',
        portal: 'farmer',
      };
      onLogin(user);
      showToast(
        'success',
        language === 'bn'
          ? 'স্বাগতম! মোহিউদ্দিন খান হিসেবে সফলভাবে কৃষক ড্যাশবোর্ডে লগিন করেছেন।'
          : 'Welcome! Successfully signed in as Farmer Mohiuddin Khan.'
      );
    }, 400);
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: AuthUser = {
        id: 'USR-105',
        name: 'Tariqul Islam Chowdhury',
        email: adminIdentifier,
        phone: '+880 1715-998822',
        role: 'Platform Admin',
        avatarInitials: 'TI',
        location: 'DAE Headquarters, Dhaka',
        portal: 'admin',
      };
      onLogin(user);
      showToast(
        'success',
        language === 'bn'
          ? 'স্বাগতম এডমিনিস্ট্রেটর! কেন্দ্রীয় প্রশাসনিক প্যানেলে প্রবেশ করেছেন।'
          : 'Welcome Administrator! Successfully logged into Central Admin Oversight Command.'
      );
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation / Brand */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/30 shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">{tr('AgriPlatform')}</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{tr('National Agritech')}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">{tr('Government Certified Agronomy & Digital Platform')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{tr('16 Farmer Modules')}</span>
              <span>{tr('•')}</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />{tr('10 Admin Modules')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('authHeading')}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {language === 'bn'
                ? 'ফার্মার ও এডমিনের জন্য আলাদা একাউন্ট ও পৃথক ড্যাশবোর্ড সিস্টেম। আপনার পোর্টাল নির্বাচন করে লগিন করুন।'
                : 'Dedicated portals for Farmers and Platform Administrators. Select your portal to sign in.'}
            </p>
          </div>

          {/* Role / Portal Switch Tabs */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 mb-5 sm:mb-6">
            <button
              type="button"
              onClick={() => setSelectedPortal('farmer')}
              className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                selectedPortal === 'farmer'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sprout className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('farmerPortalTab')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPortal('admin')}
              className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                selectedPortal === 'admin'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('adminPortalTab')}</span>
            </button>
          </div>

          {/* Tab 1: Farmer Portal Login */}
          {selectedPortal === 'farmer' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40 text-xs text-emerald-300">
                <p className="font-semibold mb-0.5">
                  {language === 'bn' ? '🌾 কৃষক একাউন্ট সুবিধা (16 Modules):' : '🌾 Farmer Account Features (16 Modules):'}
                </p>
                <p className="text-[11px] text-emerald-400/90">
                  {language === 'bn'
                    ? 'লগিন করলেই সরাসরি আপনার ফার্মার ড্যাশবোর্ড, খামার ও মাঠ ব্যবস্থাপনা, AI ফসল পরামর্শ, ফসল ক্যালেন্ডার ও হার্ভেস্ট ব্যবস্থাপনায় নিয়ে যাবে।'
                    : 'Signing in takes you straight to your Farmer Dashboard, Farms & Field Management, AI Crop Advice, Crop Calendar, and Harvest Management.'}
                </p>
              </div>

              <form onSubmit={handleFarmerLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর অথবা জাতীয় পরিচয়পত্র (NID)' : 'Mobile Number or National ID (NID)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={farmerIdentifier}
                      onChange={(e) => setFarmerIdentifier(e.target.value)}
                      placeholder={tr('+880 17XX-XXXXXX or NID')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    গোপন পিন / পাসওয়ার্ড (Security PIN)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      placeholder={tr('••••••••')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sprout className="w-4 h-4" />
                  <span>{loading ? (language === 'bn' ? 'প্রবেশ করা হচ্ছে...' : 'Signing in...') : (language === 'bn' ? 'ফার্মার ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Farmer Dashboard')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>

              {/* 1-Click Demo Shortcut */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleFarmerLogin()}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-emerald-600/40 hover:border-emerald-500 rounded-xl text-xs text-emerald-400 font-semibold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block font-bold">{language === 'bn' ? '⚡ এক ক্লিকে ডেমো ফার্মার হিসেবে প্রবেশ করুন' : '⚡ Enter as Demo Farmer in One Click'}</span>
                    <span className="text-[10px] text-slate-400">{language === 'bn' ? 'মোহিউদ্দিন খান • শেরপুর, বগুড়া (১৮.৫ একর খামার)' : 'Mohiuddin Khan • Sherpur, Bogura (18.5-acre farm)'}</span>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md">{tr('Instant Demo')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Admin Portal Login */}
          {selectedPortal === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 text-xs text-indigo-300">
                <p className="font-semibold mb-0.5">{tr('🛡️')}{language === 'bn' ? 'কেন্দ্রীয় এডমিন কন্ট্রোল (10 Modules):' : 'Central Admin Control (10 Modules):'}</p>
                <p className="text-[11px] text-indigo-400/90">
                  {language === 'bn'
                    ? 'লগিন করলেই সরাসরি Admin Dashboard, User Management, Marketplace, Orders, Payments, Quality, Logistics, Training, Reports ও Disputes প্যানেলে নিয়ে যাবে।'
                    : 'Signing in gives immediate access to Admin Dashboard, User Management, Marketplace, Orders, Payments, Quality Control, Logistics, Training, Reports & Disputes panels.'}
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    অফিসিয়াল ইমেইল অথবা এডমিন আইডি (Official Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder={tr('admin@agrisystem.internal')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    এডমিন সিকিউরিটি পাসওয়ার্ড (Admin Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder={tr('••••••••')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? (language === 'bn' ? 'প্রবেশ করা হচ্ছে...' : 'Signing in...') : (language === 'bn' ? 'এডমিন ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Admin Dashboard')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>

              {/* 1-Click Demo Shortcut */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleAdminLogin()}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-indigo-600/40 hover:border-indigo-500 rounded-xl text-xs text-indigo-400 font-semibold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block font-bold">{language === 'bn' ? '⚡ এক ক্লিকে ডেমো এডমিন হিসেবে প্রবেশ করুন' : '⚡ Enter as Demo Admin in One Click'}</span>
                    <span className="text-[10px] text-slate-400">{language === 'bn' ? 'তারিকুল ইসলাম • সেন্ট্রাল হেডকোয়ার্টার প্ল্যাটফর্ম এডমিন' : 'Tariqul Islam • Central Headquarters Platform Admin'}</span>
                  </div>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-md">{tr('Instant Demo')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 px-6 py-4 text-center text-xs text-slate-500">
        <p>{tr('Bangladesh Digital Agriculture Platform • Secure Multi-Role Authentication System')}</p>
      </footer>
    </div>
  );
};
