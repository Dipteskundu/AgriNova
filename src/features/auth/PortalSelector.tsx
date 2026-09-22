"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { PortalType } from "@/types";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { ArrowRight } from "@/components/icons";

const PORTAL_CONFIG: Record<
  PortalType,
  { icon: string; label: Record<string, string>; description: Record<string, string>; color: string }
> = {
  farmer: {
    icon: "🌾",
    label: { en: "Farmer", bn: "কৃষক" },
    description: {
      en: "Manage your farms, fields, crops, and harvests",
      bn: "আপনার খামার, ক্ষেত, ফসল এবং ফসল তোলা পরিচালনা করুন",
    },
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400",
  },
  marketplace: {
    icon: "🛒",
    label: { en: "Marketplace", bn: "বাজার" },
    description: {
      en: "Buy and sell produce and farming inputs",
      bn: "উৎপাদন এবং কৃষি উপকরণ কিনুন এবং বিক্রি করুন",
    },
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400",
  },
  operations: {
    icon: "🔍",
    label: { en: "Operations", bn: "পরিচালনা" },
    description: {
      en: "Quality inspections and delivery tracking",
      bn: "মান পরীক্ষা এবং ডেলিভারি ট্র্যাকিং",
    },
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400",
  },
  support: {
    icon: "🎧",
    label: { en: "Support", bn: "সহায়তা" },
    description: {
      en: "Disputes, help desk, and resolution center",
      bn: "বিরোধ, সহায়তা ডেস্ক এবং সমাধান কেন্দ্র",
    },
    color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400",
  },
  admin: {
    icon: "🛡️",
    label: { en: "Admin", bn: "এডমিন" },
    description: {
      en: "Full platform administration and control",
      bn: "সম্পূর্ণ প্ল্যাটফর্ম প্রশাসন এবং নিয়ন্ত্রণ",
    },
    color: "from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400",
  },
};

export const PortalSelector: React.FC = () => {
  const { user, availablePortals, selectPortal, getPortalLabel, logout, isLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat text-white flex flex-col antialiased selection:bg-emerald-500 selection:text-white" style={{ backgroundImage: "url(/auth-bg-login.jpg)" }}>
      <div className="fixed inset-0 bg-black/30" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <PublicNavbar transparent />

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {language === "bn" ? "আপনার কাজের স্থান বাছাই করুন" : "Choose your workspace"}
              </h1>
              <p className="text-sm text-white/60 mt-2">
                {language === "bn"
                  ? `স্বাগতম, ${user.name}! আপনি কোন পোর্টালে প্রবেশ করতে চান?`
                  : `Welcome back, ${user.name}! Which portal would you like to enter?`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePortals.map((portal) => {
                const config = PORTAL_CONFIG[portal];
                return (
                  <button
                    key={portal}
                    onClick={() => selectPortal(portal)}
                    className={`group p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] ${config.color}`}
                  >
                    <div className="text-4xl mb-3">{config.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {language === "bn" ? config.label.bn : config.label.en}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {language === "bn" ? config.description.bn : config.description.en}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-white/40 group-hover:text-white/70 transition-colors">
                      {language === "bn" ? "প্রবেশ করুন" : "Enter"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={logout}
                className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                {language === "bn" ? "অন্য অ্যাকাউন্ট দিয়ে লগিন করুন" : "Sign in with a different account"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
