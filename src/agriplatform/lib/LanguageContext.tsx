"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAppLanguage } from './localize';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Top Bar & Common
    'appName': 'AgriPlatform',
    'appSub': 'জাতীয় ডিজিটাল কৃষি ও খামার প্ল্যাটফর্ম',
    'weatherLocation': 'শেরপুর, বগুড়া',
    'weatherSummary': '৩০.৫°C • রোদোজ্জ্বল • আবহাওয়া অনুকূল',
    'systemStatus': 'সিস্টেম সক্রিয় ও সুরক্ষিত',
    'logout': 'লগআউট',
    'easyView': 'সহজ ভিউ',
    'detailedView': 'বিস্তারিত ভিউ',
    'easyViewActive': '✨ সহজ ভিউ মোড (ক্লিন ও পরিষ্কার)',
    'detailedViewActive': '📊 বিস্তারিত বিশ্লেষণ মোড',
    'easyViewDesc': 'সহজভাবে জরুরি তথ্য ও কাজগুলো দেখুন',
    'detailedViewDesc': 'সকল অডিট ও বিস্তারিত রিপোর্ট বিশ্লেষণ',
    'farmerPortal': 'ফার্মার পোর্টাল',
    'adminPortal': 'এডমিন পোর্টাল',
    'farmer': 'কৃষক',
    'admin': 'এডমিন',

    // Nav Groups Farmer
    'navCore': 'মূল সেবা (Core)',
    'navFarmCrop': 'জমি ও ফসল পরিচালনা',
    'navAdvisory': 'পরামর্শ ও প্রশিক্ষণ',
    'navFinancials': 'আয়-ব্যয়ের খাতা',

    // Farmer Modules
    'modDashboard': 'ড্যাশবোর্ড (মূল পাতা)',
    'modProfile': 'আমার প্রোফাইল',
    'modNotifications': 'বার্তা ও নোটিফিকেশন',
    'modFarms': 'আমার খামার ও জমি',
    'modFields': 'প্লট ও জমির সীমানা',
    'modCrops': 'চলতি ফসলসমূহ',
    'modLogs': 'কাজের ডায়েরি (লগ)',
    'modCalendar': 'কাজের ক্যালেন্ডার',
    'modHarvest': 'ফসল সংগ্রহ ও ফলন',
    'modRecommendation': 'AI ফসল নির্বাচন',
    'modComparison': 'লাভজনক ফসল তুলনা',
    'modWeather': 'আবহাওয়ার খবর ও রাডার',
    'modTraining': 'কৃষি শিক্ষা ও টিপস',
    'modAiResult': 'AI ডায়াগনস্টিক রিপোর্ট',
    'modExpenses': 'দৈনিক খরচের হিসাব',
    'modProfitability': 'লাভ-ক্ষতির হিসাব',

    // Nav Groups Admin
    'navAdminCore': 'এডমিন কোর পোর্টাল',
    'navAdminRegulatory': 'সরকারি ও রেগুলেটরি টুলস',

    // Admin Modules
    'modAdminDashboard': 'কমান্ড সেন্টার ড্যাশবোর্ড',
    'modUserManagement': 'ব্যবহারকারী ও কৃষক তালিকা',
    'modMarketplace': 'মার্কেটপ্লেস পণ্য',
    'modOrders': 'অর্ডার ও চুক্তিপত্র',
    'modPayments': 'পেমেন্ট ও লেনদেন',
    'modQuality': 'গুণমান যাচাই (QA)',
    'modLogistics': 'পরিবহন ও লজিস্টিকস',
    'modTrainingManagement': 'প্রশিক্ষণ কোর্স পরিচালনা',
    'modReports': 'প্রতিবেদন ও অডিট',
    'modDisputes': 'অভিযোগ ও নিষ্পত্তি',
    'modFarmVerification': 'খামার ভেরিফিকেশন',
    'modCropCatalog': 'মাস্টার ফসল ক্যাটালগ',
    'modAdvisoryManagement': 'কৃষি বার্তা প্রেরণ',
    'modMarketPrices': 'বাজার দর নির্ধারণ',
    'modWeatherBroadcast': 'আবহাওয়া ব্রডকাস্ট',
    'modPlatformAnalytics': 'ম্যাক্রো অ্যানালিটিক্স',
    'modSystemAudit': 'সিকিউরিটি অডিট',

    // Dashboard Banner & Stats
    'welcomeGreeting': 'আসসালামু আলাইকুম,',
    'welcomeSub': 'আপনার {count} টি ফসলের জমি এখন স্বাস্থ্যবান ও ভালো অবস্থায় আছে। আজ সেচ দেওয়ার উপযুক্ত দিন।',
    'btnRecordLog': '+ কাজের হিসাব লিখুন',
    'btnAiRecommend': 'AI ফসল পরামর্শ',
    'statActiveCrops': 'আমার চলতি ফসল',
    'statFarmsActive': 'খামার সক্রিয়',
    'statCropsList': 'ধান, ভুট্টা, গম, সরিষা, কলা',
    'statViewCrops': 'ফসলগুলো দেখুন',
    'statTodayTasks': 'আজকের কাজ',
    'statPending': 'বাকি আছে',
    'statTasksSub': 'সেচ ও সার প্রয়োগের সময় হয়েছে',
    'statOpenCalendar': 'ক্যালেন্ডার খুলুন',
    'statWeather': 'আজকের আবহাওয়া',
    'statSunny': 'রোদোজ্জ্বল',
    'statWeatherSub': 'আজ বৃষ্টির কোনো আশঙ্কা নেই',
    'statWeather7Days': '৭ দিনের পূর্বাভাস',
    'statTotalLand': 'আমার মোট জমি',
    'statLandSub': '৩টি খামারে মোট ৭টি প্লট',
    'statViewLand': 'জমি ও প্লট দেখুন',
    'acre': 'একর',

    // Quick Actions
    'quickActionsTitle': 'সহজ কাজসমূহ (Quick Action)',
    'quickActionsSub': 'যে কাজটি করতে চান তার ওপর চাপ দিন',
    'qaLogTitle': 'কাজের হিসাব লিখুন',
    'qaLogSub': 'সার, স্প্রে বা সেচ লিখে রাখুন',
    'qaExpenseTitle': 'খরচের হিসাব যোগ করুন',
    'qaExpenseSub': 'বীজ, ডিজেল ও মজুরি হিসাব',
    'qaAiTitle': 'AI ফসল পরামর্শ',
    'qaAiSub': 'কোন ফসলে বেশি লাভ হবে?',
    'qaHarvestTitle': 'ফসল কাটা ও ফলন',
    'qaHarvestSub': 'মোট ফলন ও বিক্রয় হিসাব',

    // Sections
    'activeCropsTitle': 'আমার চলতি ফসলের অবস্থা',
    'activeCropsSub': 'প্রতিটি ফসলের বর্তমান বৃদ্ধি ও স্বাস্থ্য',
    'viewAllCrops': 'সব ফসল দেখুন',
    'todayTasksTitle': 'আজকের জরুরি কাজ',
    'todayTasksSub': 'কাজ শেষ হলে বৃত্তে চাপ দিন',
    'calendar': 'ক্যালেন্ডার',
    'completed': 'সম্পন্ন',
    'urgent': 'জরুরি',
    'helplineTitle': 'কৃষি কর্মকর্তা হটলাইন',
    'helplineSub': 'ফসলে কোনো রোগ বা সমস্যা হলে সরাসরি কল দিন',
    'tollFreeGovt': 'টোল ফ্রি সরকারি কৃষি কল সেন্টার',
    'callNow': 'কল করুন',

    // Auth Screen
    'authHeading': 'প্ল্যাটফর্মে প্রবেশ করুন • Account Sign In',
    'authSub': 'সরকারিভাবে অনুমোদিত ডিজিটাল কৃষি ও ফসল ব্যবস্থাপনা সিস্টেম',
    'farmerPortalTab': 'ফার্মার পোর্টাল (Farmer)',
    'adminPortalTab': 'এডমিন পোর্টাল (Admin)',
    'mobileOrNid': 'মোবাইল নম্বর অথবা NID',
    'emailAddress': 'অফিসিয়াল ইমেইল এড্রেস',
    'password': 'পাসওয়ার্ড (Password)',
    'signInButton': 'লগইন করুন',
    'switchLanguage': 'ভাষা পরিবর্তন (Language)',
  },
  en: {
    // Top Bar & Common
    'appName': 'AgriPlatform',
    'appSub': 'National Digital Agriculture & Agronomy Hub',
    'weatherLocation': 'Sherpur, Bogura',
    'weatherSummary': '30.5°C • Sunny • Favorable Climate',
    'systemStatus': 'System Active & Secure',
    'logout': 'Sign Out',
    'easyView': 'Simple View',
    'detailedView': 'Detailed View',
    'easyViewActive': '✨ Simple View (Clean & Focused)',
    'detailedViewActive': '📊 Detailed Analysis Mode',
    'easyViewDesc': 'See urgent updates and actionable tasks easily',
    'detailedViewDesc': 'Analyze audits, logs, and deep metrics',
    'farmerPortal': 'Farmer Portal',
    'adminPortal': 'Admin Portal',
    'farmer': 'Farmer',
    'admin': 'Admin',

    // Nav Groups Farmer
    'navCore': 'Core Services',
    'navFarmCrop': 'Farm & Crop Management',
    'navAdvisory': 'Advisory & Training',
    'navFinancials': 'Financial Records',

    // Farmer Modules
    'modDashboard': 'Farmer Dashboard',
    'modProfile': 'Farmer Profile',
    'modNotifications': 'Messages & Alerts',
    'modFarms': 'Farms & Land Holdings',
    'modFields': 'Plots & Field Boundaries',
    'modCrops': 'Active Crop Batches',
    'modLogs': 'Field Operations Journal',
    'modCalendar': 'Agronomic Calendar',
    'modHarvest': 'Harvest & Yield',
    'modRecommendation': 'AI Crop Recommendation',
    'modComparison': 'Crop Profitability Comparison',
    'modWeather': 'Weather Forecast & Radar',
    'modTraining': 'Agricultural Training & Tips',
    'modAiResult': 'AI Diagnostic Report',
    'modExpenses': 'Daily Operating Expenses',
    'modProfitability': 'Profit & Loss Ledger',

    // Nav Groups Admin
    'navAdminCore': 'Admin Core Portal',
    'navAdminRegulatory': 'DAE Regulatory Tools',

    // Admin Modules
    'modAdminDashboard': 'Command Center Dashboard',
    'modUserManagement': 'User & Farmer Directory',
    'modMarketplace': 'Marketplace Catalog',
    'modOrders': 'Orders & Contracts',
    'modPayments': 'Payments & Escrow',
    'modQuality': 'Quality Assurance (QA)',
    'modLogistics': 'Logistics & Fleet Dispatch',
    'modTrainingManagement': 'Training Management',
    'modReports': 'Audit & Macro Reports',
    'modDisputes': 'Disputes & Arbitrations',
    'modFarmVerification': 'Farm Cadastre Verification',
    'modCropCatalog': 'Master Crop Catalog',
    'modAdvisoryManagement': 'Agronomic Advisory Dispatch',
    'modMarketPrices': 'Market Price Oversight',
    'modWeatherBroadcast': 'Weather Broadcast Service',
    'modPlatformAnalytics': 'Platform Macro Analytics',
    'modSystemAudit': 'System Security & Audit',

    // Dashboard Banner & Stats
    'welcomeGreeting': 'Assalamu Alaikum,',
    'welcomeSub': 'Your {count} crop fields are in healthy condition. Today is ideal for scheduled irrigation.',
    'btnRecordLog': '+ Record Activity',
    'btnAiRecommend': 'AI Crop Advice',
    'statActiveCrops': 'Active Crops',
    'statFarmsActive': 'Active Batches',
    'statCropsList': 'Paddy, Maize, Wheat, Mustard, Banana',
    'statViewCrops': 'View Crops',
    'statTodayTasks': 'Today’s Tasks',
    'statPending': 'Pending',
    'statTasksSub': 'Irrigation & fertilizer window open',
    'statOpenCalendar': 'Open Calendar',
    'statWeather': 'Current Weather',
    'statSunny': 'Clear & Sunny',
    'statWeatherSub': 'No rainfall expected today',
    'statWeather7Days': '7-Day Forecast',
    'statTotalLand': 'Total Land',
    'statLandSub': '7 plots across 3 farms',
    'statViewLand': 'View Land & Plots',
    'acre': 'Acres',

    // Quick Actions
    'quickActionsTitle': 'Quick Actions',
    'quickActionsSub': 'Tap any button to perform key actions directly',
    'qaLogTitle': 'Log Field Activity',
    'qaLogSub': 'Record fertilizer, spray, or watering',
    'qaExpenseTitle': 'Add Expense',
    'qaExpenseSub': 'Track seeds, fuel & labor costs',
    'qaAiTitle': 'AI Crop Advice',
    'qaAiSub': 'Find most profitable crops',
    'qaHarvestTitle': 'Harvest & Yield',
    'qaHarvestSub': 'Record yield weight and revenue',

    // Sections
    'activeCropsTitle': 'Active Crops Status',
    'activeCropsSub': 'Live health status and growth progress',
    'viewAllCrops': 'View All Crops',
    'todayTasksTitle': 'Urgent Tasks Today',
    'todayTasksSub': 'Tap circle to mark task as completed',
    'calendar': 'Calendar',
    'completed': 'Done',
    'urgent': 'Urgent',
    'helplineTitle': 'Agri Extension Helpline',
    'helplineSub': 'Direct call for agronomy or pest diagnostics',
    'tollFreeGovt': 'Toll-free National Agri Call Center',
    'callNow': 'Call Now',

    // Auth Screen
    'authHeading': 'Account Sign In • প্রবেশ করুন',
    'authSub': 'National Certified Digital Agriculture & Agronomy Hub',
    'farmerPortalTab': 'Farmer Portal',
    'adminPortalTab': 'Admin Portal',
    'mobileOrNid': 'Mobile Number or NID',
    'emailAddress': 'Official Email Address',
    'password': 'Password',
    'signInButton': 'Sign In',
    'switchLanguage': 'Language (ভাষা)',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    let lang: Language = 'bn'; // Default to Bangla as primary
    try {
      const saved = localStorage.getItem('agri_language');
      if (saved === 'bn' || saved === 'en') lang = saved;
    } catch {
      // ignore
    }
    setAppLanguage(lang);
    return lang;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setAppLanguage(lang);
    try {
      localStorage.setItem('agri_language', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setAppLanguage(language);
  }, [language]);

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const fallbackDict = translations['bn'];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
