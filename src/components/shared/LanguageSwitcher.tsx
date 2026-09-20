import React from 'react';
import { tr } from "@/agriplatform/lib/localize";
import { Globe } from '@/components/icons';
import { useLanguage, Language } from '@/agriplatform/lib/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'minimal' | 'button' | 'pill';
  responsive?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'pill',
  responsive = false,
}) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer ${className}`}
        title="ভাষা পরিবর্তন / Switch Language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
      </button>
    );
  }

  // Compact icon-only toggle below `sm`, full segmented pill on larger screens
  if (responsive) {
    return (
      <>
        <button
          type="button"
          onClick={toggleLanguage}
          className={`sm:hidden flex items-center justify-center p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer ${className}`}
          title="ভাষা পরিবর্তন / Switch Language"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
        </button>
        <div
          className={`hidden sm:inline-flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200 shadow-2xs ${className}`}
          role="group"
          aria-label={tr('Language Selector')}
        >
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              language === 'bn'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>বাংলা</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              language === 'en'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>EN</span>
          </button>
        </div>
      </>
    );
  }

  // Segmented Pill Control: [বাংলা | English]
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200 shadow-2xs ${className}`}
      role="group"
      aria-label={tr('Language Selector')}
    >
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'bn'
            ? 'bg-emerald-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>বাংলা</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-emerald-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>EN</span>
      </button>
    </div>
  );
};
