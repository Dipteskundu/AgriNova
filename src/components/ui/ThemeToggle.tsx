"use client";

import React from 'react';
import { Sun, Moon } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const toggleLabel = theme === 'light'
    ? (language === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to dark mode')
    : (language === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to light mode');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all cursor-pointer dark:bg-[#111111] dark:border-[#333333] dark:text-[#a0a0a0] dark:hover:bg-[#1a1a1a] dark:hover:text-[#f0f0f0] dark:shadow-[0_0_8px_rgba(16,185,129,0.15)] ${className}`}
      title={toggleLabel}
      aria-label={toggleLabel}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  );
};
