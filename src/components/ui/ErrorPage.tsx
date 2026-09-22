"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

type ErrorCode = "404" | "500" | "generic";

interface ErrorPageProps {
  errorCode?: ErrorCode;
  errorMessage?: string;
  onRetry?: () => void;
}

function ScarecrowSVG() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
      {/* Sky */}
      <rect width="300" height="300" fill="transparent" />

      {/* Sun */}
      <g className="animate-error-sun" style={{ transformOrigin: "250px 50px" }}>
        <circle cx="250" cy="50" r="25" fill="#fbbf24" opacity="0.9" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="250"
            y1="50"
            x2={250 + 35 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 35 * Math.sin((angle * Math.PI) / 180)}
            stroke="#fbbf24"
            strokeWidth="2"
            opacity="0.6"
          />
        ))}
      </g>

      {/* Clouds */}
      <g className="animate-error-float" style={{ animationDelay: "0s" }}>
        <ellipse cx="60" cy="45" rx="25" ry="12" fill="currentColor" opacity="0.1" />
        <ellipse cx="80" cy="40" rx="20" ry="10" fill="currentColor" opacity="0.1" />
        <ellipse cx="45" cy="42" rx="18" ry="9" fill="currentColor" opacity="0.1" />
      </g>
      <g className="animate-error-float" style={{ animationDelay: "1.5s" }}>
        <ellipse cx="170" cy="60" rx="20" ry="9" fill="currentColor" opacity="0.08" />
        <ellipse cx="185" cy="55" rx="16" ry="8" fill="currentColor" opacity="0.08" />
      </g>

      {/* Ground / Field */}
      <rect x="0" y="230" width="300" height="70" fill="#22c55e" opacity="0.3" rx="4" />
      <rect x="0" y="240" width="300" height="60" fill="#16a34a" opacity="0.2" rx="4" />

      {/* Fence posts */}
      <rect x="30" y="200" width="4" height="40" fill="#92400e" opacity="0.5" rx="1" />
      <rect x="70" y="205" width="4" height="35" fill="#92400e" opacity="0.5" rx="1" />
      <rect x="230" y="200" width="4" height="40" fill="#92400e" opacity="0.5" rx="1" />
      <rect x="270" y="205" width="4" height="35" fill="#92400e" opacity="0.5" rx="1" />
      {/* Fence rails (broken) */}
      <line x1="32" y1="215" x2="72" y2="218" stroke="#92400e" strokeWidth="2" opacity="0.4" />
      <line x1="32" y1="225" x2="55" y2="227" stroke="#92400e" strokeWidth="2" opacity="0.3" />
      <line x1="232" y1="215" x2="272" y2="218" stroke="#92400e" strokeWidth="2" opacity="0.4" />

      {/* Crops swaying */}
      {[40, 90, 120, 180, 210, 260].map((x, i) => (
        <g
          key={x}
          className="animate-error-sway"
          style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${x}px 240px` }}
        >
          <line x1={x} y1="240" x2={x} y2={200 - i * 2} stroke="#15803d" strokeWidth="2" />
          <ellipse cx={x - 4} cy={205 - i * 2} rx="5" ry="3" fill="#22c55e" opacity="0.8" />
          <ellipse cx={x + 4} cy={210 - i * 2} rx="5" ry="3" fill="#22c55e" opacity="0.7" />
        </g>
      ))}

      {/* Scarecrow body */}
      <g className="animate-error-sway" style={{ transformOrigin: "150px 240px" }}>
        {/* Post */}
        <rect x="148" y="140" width="4" height="100" fill="#78350f" rx="2" />
        {/* Cross bar */}
        <rect x="120" y="155" width="60" height="3" fill="#78350f" rx="1" />
        {/* Head ( pumpkin ) */}
        <circle cx="150" cy="130" r="18" fill="#f97316" />
        <circle cx="143" cy="127" r="3" fill="#78350f" />
        <circle cx="157" cy="127" r="3" fill="#78350f" />
        <path d="M143 136 Q150 142 157 136" stroke="#78350f" strokeWidth="2" fill="none" />
        {/* Hat */}
        <rect x="132" y="108" width="36" height="6" fill="#78350f" rx="2" />
        <rect x="138" y="92" width="24" height="18" fill="#78350f" rx="2" />
        {/* Shirt flaps */}
        <polygon points="120,158 110,180 120,175" fill="#dc2626" opacity="0.8" />
        <polygon points="180,158 190,180 180,175" fill="#dc2626" opacity="0.8" />
        {/* Pants */}
        <polygon points="145,240 140,260 150,255" fill="#1e40af" opacity="0.7" />
        <polygon points="155,240 160,260 150,255" fill="#1e40af" opacity="0.7" />
      </g>

      {/* Question marks floating */}
      <text x="90" y="120" fontSize="20" fill="#eab308" opacity="0.6" className="animate-error-float" style={{ animationDelay: "0.5s" }}>?</text>
      <text x="200" y="100" fontSize="16" fill="#eab308" opacity="0.5" className="animate-error-float" style={{ animationDelay: "1s" }}>?</text>
      <text x="220" y="140" fontSize="14" fill="#eab308" opacity="0.4" className="animate-error-float" style={{ animationDelay: "2s" }}>?</text>

      {/* Bird */}
      <g className="animate-error-drift" style={{ animationDelay: "2s" }}>
        <path d="M0,70 Q8,60 16,70" stroke="#1f2937" strokeWidth="2" fill="none" opacity="0.5" />
      </g>
    </svg>
  );
}

function TractorSVG() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
      {/* Sky */}
      <rect width="300" height="300" fill="transparent" />

      {/* Sun with rays */}
      <g className="animate-error-sun" style={{ transformOrigin: "260px 40px" }}>
        <circle cx="260" cy="40" r="20" fill="#fbbf24" opacity="0.8" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={angle}
            x1="260"
            y1="40"
            x2={260 + 30 * Math.cos((angle * Math.PI) / 180)}
            y2={40 + 30 * Math.sin((angle * Math.PI) / 180)}
            stroke="#fbbf24"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      </g>

      {/* Ground */}
      <rect x="0" y="235" width="300" height="65" fill="#22c55e" opacity="0.3" rx="4" />

      {/* Tractor body */}
      <g>
        {/* Chassis */}
        <rect x="90" y="170" width="120" height="50" fill="#dc2626" rx="6" opacity="0.9" />
        {/* Hood */}
        <rect x="60" y="180" width="40" height="35" fill="#b91c1c" rx="4" opacity="0.9" />
        {/* Cab */}
        <rect x="150" y="135" width="55" height="45" fill="#1e40af" rx="4" opacity="0.8" />
        {/* Window */}
        <rect x="158" y="142" width="38" height="28" fill="#93c5fd" rx="3" opacity="0.7" />
        {/* Exhaust pipe */}
        <rect x="70" y="155" width="6" height="25" fill="#4b5563" rx="2" />
        {/* Smoke puffs */}
        <circle cx="73" cy="148" r="5" fill="#9ca3af" opacity="0.4" className="animate-error-smoke" style={{ animationDelay: "0s" }} />
        <circle cx="68" cy="140" r="4" fill="#9ca3af" opacity="0.3" className="animate-error-smoke" style={{ animationDelay: "0.7s" }} />
        <circle cx="76" cy="135" r="3" fill="#9ca3af" opacity="0.2" className="animate-error-smoke" style={{ animationDelay: "1.4s" }} />

        {/* Big rear wheel */}
        <circle cx="170" cy="220" r="30" fill="#1f2937" />
        <circle cx="170" cy="220" r="22" fill="#374151" />
        <circle cx="170" cy="220" r="8" fill="#6b7280" />
        {/* Wheel spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={angle}
            x1="170"
            y1="220"
            x2={170 + 20 * Math.cos((angle * Math.PI) / 180)}
            y2={220 + 20 * Math.sin((angle * Math.PI) / 180)}
            stroke="#6b7280"
            strokeWidth="1.5"
          />
        ))}

        {/* Small front wheel */}
        <circle cx="85" cy="225" r="18" fill="#1f2937" />
        <circle cx="85" cy="225" r="13" fill="#374151" />
        <circle cx="85" cy="225" r="5" fill="#6b7280" />
      </g>

      {/* Wrench / repair tool */}
      <g className="animate-error-float" style={{ animationDelay: "0.5s" }}>
        <rect x="225" y="160" width="4" height="30" fill="#6b7280" rx="2" transform="rotate(-30 227 175)" />
        <circle cx="222" cy="158" r="6" fill="none" stroke="#6b7280" strokeWidth="2" />
      </g>

      {/* Warning sign */}
      <g className="animate-error-float" style={{ animationDelay: "1s" }}>
        <polygon points="240,100 255,130 225,130" fill="#eab308" opacity="0.8" />
        <text x="238" y="125" fontSize="14" fill="#78350f" fontWeight="bold">!</text>
      </g>

      {/* Grass tufts */}
      {[20, 55, 130, 200, 250, 280].map((x, i) => (
        <g key={x} className="animate-error-grass" style={{ animationDelay: `${i * 0.2}s` }}>
          <line x1={x} y1="238" x2={x - 3} y2="228" stroke="#15803d" strokeWidth="1.5" />
          <line x1={x + 3} y1="238" x2={x + 6} y2="226" stroke="#15803d" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}

function WiltingPlantSVG() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="300" fill="transparent" />

      {/* Ground */}
      <rect x="0" y="240" width="300" height="60" fill="#92400e" opacity="0.2" rx="4" />

      {/* Pot */}
      <path d="M110,240 L120,280 L180,280 L190,240 Z" fill="#b45309" opacity="0.7" />
      <rect x="105" y="235" width="90" height="8" fill="#b45309" opacity="0.8" rx="3" />

      {/* Soil */}
      <ellipse cx="150" cy="242" rx="40" ry="5" fill="#78350f" opacity="0.5" />

      {/* Main stem - wilting */}
      <g className="animate-error-wilt" style={{ transformOrigin: "150px 240px" }}>
        <path d="M150,240 Q148,210 140,180 Q130,155 120,140" stroke="#15803d" strokeWidth="3" fill="none" />

        {/* Droopy leaves */}
        <ellipse cx="120" cy="140" rx="18" ry="8" fill="#22c55e" opacity="0.7" transform="rotate(-40 120 140)" />
        <ellipse cx="115" cy="155" rx="15" ry="6" fill="#16a34a" opacity="0.6" transform="rotate(-50 115 155)" />

        {/* Side branch */}
        <path d="M145,200 Q160,185 175,180" stroke="#15803d" strokeWidth="2" fill="none" />
        <ellipse cx="175" cy="178" rx="14" ry="6" fill="#22c55e" opacity="0.6" transform="rotate(20 175 178)" />

        {/* Flower bud (wilting) */}
        <circle cx="118" cy="132" r="8" fill="#ec4899" opacity="0.5" />
        <circle cx="118" cy="132" r="5" fill="#f472b6" opacity="0.6" />
      </g>

      {/* Question mark */}
      <text x="170" y="120" fontSize="32" fill="#eab308" opacity="0.6" className="animate-error-float">?</text>

      {/* Small bugs/dots */}
      <circle cx="130" cy="170" r="2" fill="#ef4444" opacity="0.5" className="animate-error-float" style={{ animationDelay: "0.5s" }} />
      <circle cx="160" cy="165" r="1.5" fill="#ef4444" opacity="0.4" className="animate-error-float" style={{ animationDelay: "1.5s" }} />

      {/* Falling leaf */}
      <g className="animate-error-float" style={{ animationDelay: "2s" }}>
        <ellipse cx="200" cy="160" rx="6" ry="3" fill="#22c55e" opacity="0.4" transform="rotate(30 200 160)" />
      </g>
    </svg>
  );
}

export default function ErrorPage({ errorCode = "404", errorMessage, onRetry }: ErrorPageProps) {
  const { t } = useLanguage();

  const config: Record<ErrorCode, { title: string; subtitle: string; message: string; illustration: React.ReactNode }> = {
    "404": {
      title: t("error404Title", "404"),
      subtitle: t("error404Subtitle", "Lost in the farm fields!"),
      message: t("error404Message", "Looks like this page wandered off into the crops. Don't worry, let's head back home!"),
      illustration: <ScarecrowSVG />,
    },
    "500": {
      title: t("error500Title", "500"),
      subtitle: t("error500Subtitle", "The tractor broke down!"),
      message: t("errorMessage", t("error500Message", "Something went wrong on our end. We're fixing it, please hold on.")),
      illustration: <TractorSVG />,
    },
    generic: {
      title: t("errorGenericTitle", "Oops!"),
      subtitle: t("errorGenericSubtitle", "Something went wrong..."),
      message: errorMessage || t("errorGenericMessage", "An unexpected error occurred. Try again or head back to the homepage."),
      illustration: <WiltingPlantSVG />,
    },
  };

  const { title, subtitle, message, illustration } = config[errorCode];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 py-8 sm:px-6 lg:px-8">
      {/* Floating background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-error-float absolute left-[10%] top-[15%] h-3 w-3 rounded-full bg-[var(--accent)] opacity-10" style={{ animationDelay: "0s" }} />
        <div className="animate-error-float absolute left-[80%] top-[20%] h-2 w-2 rounded-full bg-[var(--accent)] opacity-10" style={{ animationDelay: "1s" }} />
        <div className="animate-error-float absolute left-[60%] top-[70%] h-4 w-4 rounded-full bg-[var(--accent)] opacity-5" style={{ animationDelay: "2s" }} />
        <div className="animate-error-float absolute left-[20%] top-[80%] h-2 w-2 rounded-full bg-[var(--accent)] opacity-10" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* Illustration */}
        <div className="mb-6 h-[200px] w-[200px] sm:h-[260px] sm:w-[260px] md:h-[300px] md:w-[300px]">
          {illustration}
        </div>

        {/* Error code - bouncing in */}
        <h1
          className="animate-error-bounce-in text-7xl font-extrabold tracking-tighter sm:text-8xl md:text-9xl"
          style={{
            color: "var(--accent)",
            textShadow: "0 0 40px rgba(16, 185, 129, 0.2)",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <h2 className="animate-error-fade-in-up delay-200 mt-3 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl opacity-0">
          {subtitle}
        </h2>

        {/* Message */}
        <p className="animate-error-fade-in-up delay-400 mt-3 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base opacity-0">
          {message}
        </p>

        {/* Action buttons */}
        <div className="animate-error-fade-in-up delay-600 mt-8 flex flex-col gap-3 sm:flex-row opacity-0">
          <Link
            href="/"
            className="animate-error-pulse-glow inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-base)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {t("goBackHome", "Go Back Home")}
          </Link>

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-all hover:scale-105 hover:border-[var(--accent)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-base)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              {t("tryAgain", "Try Again")}
            </button>
          )}
        </div>

        {/* Fun farm tip */}
        <div className="animate-error-fade-in-up delay-800 mt-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-5 py-3 opacity-0">
          <p className="text-xs text-[var(--text-muted)] sm:text-sm">
            {errorCode === "404" && "🌾 " + t("errorLostScarecrow", "Lost scarecrow") + " — " + t("error404Message", "Looks like this page wandered off into the crops.")}
            {errorCode === "500" && "🚜 " + t("errorBrokenTractor", "Broken tractor") + " — " + t("error500Message", "Something went wrong on our end.")}
            {errorCode === "generic" && "🌱 " + t("errorWiltingPlant", "Wilting plant") + " — " + t("errorGenericMessage", "An unexpected error occurred.")}
          </p>
        </div>
      </div>
    </div>
  );
}
