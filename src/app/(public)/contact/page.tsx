"use client";

import { tr } from "@/lib/localize";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-[#000000]">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('Contact Us')}</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-[#a0a0a0]">{tr('Get in touch with the FarmPath team')}</p>
    </main>
  );
}
