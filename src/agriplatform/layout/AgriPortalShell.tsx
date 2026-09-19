"use client";

import React, { useState, useEffect, useCallback } from "react";
import { tr } from "@/agriplatform/lib/localize";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Trees,
  Grid3X3,
  Sparkles,
  GitCompare,
  Sprout,
  ClipboardList,
  Calendar,
  PackageCheck,
  Receipt,
  TrendingUp,
  CloudSun,
  GraduationCap,
  BrainCircuit,
  Bell,
  ShieldCheck,
  Users,
  Store,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Truck,
  BookOpen,
  FileBarChart,
  Scale,
  Menu,
  X,
  Grid,
  ArrowLeft,
  Radio,
  Terminal,
  DollarSign,
  FileCheck,
  Send,
  LogOut,
} from "@/components/icons";
import { FarmerNotification, PortalType } from "@/agriplatform/types";
import { getFarmerNotifications, markNotificationAsRead } from "@/agriplatform/lib/farmerApi";
import {
  FARMER_ROUTE_MAP,
  ADMIN_ROUTE_MAP,
  farmerActiveKey,
  adminActiveKey,
} from "@/agriplatform/layout/routeMaps";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/agriplatform/lib/LanguageContext";

const FARMER_ROUTES: Record<string, string> = { ...FARMER_ROUTE_MAP };
const ADMIN_ROUTES: Record<string, string> = { ...ADMIN_ROUTE_MAP };

function moduleKeyFromPath(portal: PortalType, pathname: string): string {
  return portal === "farmer" ? farmerActiveKey(pathname) : adminActiveKey(pathname);
}

interface AuthProfileCard {
  name: string;
  role: string;
  location: string;
  avatarInitials: string;
  portal: PortalType;
}

interface AgriPortalShellProps {
  portal: PortalType;
  children: React.ReactNode;
}

export const AgriPortalShell: React.FC<AgriPortalShellProps> = ({ portal, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<FarmerNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthProfileCard | null>(null);
  const { language } = useLanguage();

  const navigate = useCallback(
    (route: string) => {
      setMobileMenuOpen(false);
      setNotificationsOpen(false);
      router.push(route);
    },
    [router]
  );

  const navigateByModule = useCallback(
    (key: string) => {
      const route = portal === "farmer" ? FARMER_ROUTES[key] : ADMIN_ROUTES[key];
      if (route) navigate(route);
    },
    [portal, navigate]
  );

  const navigateHome = useCallback(() => {
    navigate(portal === "farmer" ? "/farmer" : "/admin");
  }, [portal, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("agriplatform_user");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    const res = await getFarmerNotifications();
    if (res.success) setNotifications(res.data);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, pathname]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("agriplatform_user");
    } catch {}
    router.push("/login");
  }, [router]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markNotificationAsRead(id);
      loadNotifications();
    },
    [loadNotifications]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const activeModule = moduleKeyFromPath(portal, pathname);
  const isHomePage = portal === "farmer" ? pathname === "/farmer" : pathname === "/admin";

  const farmerNavGroups = [
    {
      group: "Overview & Profile",
      items: [
        { key: "dashboard", label: "1. Farmer Dashboard", icon: LayoutDashboard },
        { key: "profile", label: "2. Profile", icon: User },
      ],
    },
    {
      group: "Farm & Field Infrastructure",
      items: [
        { key: "farms", label: "3. Farm Management", icon: Trees },
        { key: "fields", label: "4. Field Management", icon: Grid3X3 },
      ],
    },
    {
      group: "Crop Planning & Comparison",
      items: [
        { key: "recommendation", label: "5. Crop Recommendation", icon: Sparkles },
        { key: "comparison", label: "6. Crop Comparison", icon: GitCompare },
      ],
    },
    {
      group: "Crop Operations & Lifecycle",
      items: [
        { key: "crops", label: "7. Crop Management", icon: Sprout },
        { key: "logs", label: "8. Crop Logs", icon: ClipboardList },
        { key: "calendar", label: "9. Crop Calendar", icon: Calendar },
        { key: "harvest", label: "10. Harvest Management", icon: PackageCheck },
      ],
    },
    {
      group: "Farm Financials",
      items: [
        { key: "expenses", label: "11. Farm Expenses", icon: Receipt },
        { key: "profitability", label: "12. Profitability", icon: TrendingUp },
      ],
    },
    {
      group: "Agritech Intelligence & Training",
      items: [
        { key: "weather", label: "13. Weather & Alerts", icon: CloudSun },
        { key: "training", label: "14. Agricultural Training", icon: GraduationCap },
        { key: "ai_result", label: "15. AI Recommendation UI", icon: BrainCircuit },
        { key: "notifications", label: "16. Farmer Notifications", icon: Bell, badge: unreadCount },
      ],
    },
  ];

  const adminNavGroups = [
    {
      group: "Admin Core Portal (10 Modules)",
      items: [
        { key: "admin_dashboard", label: "1. Admin Dashboard", icon: ShieldCheck },
        { key: "user_management", label: "2. User Management", icon: Users },
        { key: "marketplace", label: "3. Marketplace Management", icon: Store },
        { key: "orders", label: "4. Orders", icon: ShoppingCart },
        { key: "payments", label: "5. Payments", icon: CreditCard },
        { key: "quality", label: "6. Quality Management", icon: CheckCircle },
        { key: "logistics", label: "7. Logistics", icon: Truck },
        { key: "training_management", label: "8. Training Management", icon: BookOpen },
        { key: "reports", label: "9. Reports", icon: FileBarChart },
        { key: "disputes", label: "10. Disputes", icon: Scale },
      ],
    },
    {
      group: "DAE Cadastre & Regulatory Tools",
      items: [
        { key: "farm_verification", label: "11. Farm Verification", icon: FileCheck },
        { key: "crop_catalog", label: "12. Master Crop Catalog", icon: Sprout },
        { key: "advisory_management", label: "13. Agronomic Advisory", icon: Send },
        { key: "market_prices", label: "14. Market Price Command", icon: DollarSign },
        { key: "weather_broadcast", label: "15. Weather Broadcast", icon: Radio },
        { key: "platform_analytics", label: "16. Platform Macro Analytics", icon: Terminal },
        { key: "system_audit", label: "17. Security & System Audit", icon: Terminal },
      ],
    },
  ];

  const activeTitle =
    portal === "farmer"
      ? farmerNavGroups.flatMap((g) => g.items).find((i) => i.key === activeModule)?.label ||
        "Farmer Portal"
      : adminNavGroups.flatMap((g) => g.items).find((i) => i.key === activeModule)?.label ||
        "Admin Portal";

  const navRenderer = (groups: typeof farmerNavGroups | typeof adminNavGroups) =>
    groups.map((group) => (
      <div key={group.group}>
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          {group.group}
        </p>
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => navigateByModule(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? portal === "farmer"
                      ? "bg-emerald-700 text-white font-semibold shadow-xs"
                      : "bg-indigo-700 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {(item as { badge?: number }).badge !== undefined &&
                  (item as { badge?: number }).badge! > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-white text-emerald-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {(item as { badge?: number }).badge}
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Ultra-Minimalist Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={navigateHome}
              className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
              title="হোম পেজ / Home"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">
                {tr('AgriPlatform')}
              </span>
            </button>

            {/* If NOT on home page: clean Back to Home button */}
            {!isHomePage && (
              <button
                onClick={navigateHome}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "হোম" : "Home"}</span>
              </button>
            )}

            {!isHomePage && (
              <span className="hidden md:inline-block text-xs font-semibold text-slate-500 border-l border-slate-200 pl-3 truncate max-w-xs">
                {activeTitle}
              </span>
            )}
          </div>

          {/* Right Action: Language Switcher, Services Drawer, Notifications & User */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Minimal Language Switcher */}
            <LanguageSwitcher />

            {/* All Services Drawer Trigger (Icon-driven) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
              title={language === "bn" ? "সকল সেবা দেখুন" : "All Services"}
            >
              <Grid className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">
                {language === "bn" ? "সকল সেবা" : "Services"}
              </span>
            </button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
                aria-label={tr('View notifications')}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {language === "bn"
                        ? `বিজ্ঞপ্তি ও বার্তা (${unreadCount} টি নতুন)`
                        : `Notifications (${unreadCount} Unread)`}
                    </h4>
                    <button
                      onClick={() => {
                        navigateByModule("notifications");
                        setNotificationsOpen(false);
                      }}
                      className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      {language === "bn" ? "সব দেখুন" : "View All"}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          handleMarkRead(notif.id);
                          if (notif.actionLink) {
                            navigateByModule(notif.actionLink);
                          }
                          setNotificationsOpen(false);
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          notif.isRead
                            ? "bg-white border-slate-100 text-slate-600"
                            : "bg-emerald-50/50 border-emerald-100 text-slate-800 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{notif.title}</span>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {notif.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Logout */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={() => {
                  if (portal === "farmer") navigateByModule("profile");
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                title="প্রোফাইল / Profile"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  {currentUser
                    ? currentUser.avatarInitials
                    : portal === "farmer"
                    ? "MK"
                    : "TI"}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800">
                  {currentUser ? currentUser.name.split(" ")[0] : "মহিউদ্দীন"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                title="লগআউট / Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container (Center Stage) */}
      <div className="flex-1 max-w-screen-2xl w-full mx-auto px-3 sm:px-6 py-5">
        {/* All Services Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl p-4 overflow-y-auto flex flex-col z-10">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {tr('AgriPlatform')}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {language === "bn"
                        ? portal === "farmer"
                          ? "ফার্মার সুইট (১৬ মডিউল)"
                          : "এডমিন ওভারসাইট (১৭ মডিউল)"
                        : portal === "farmer"
                        ? "Farmer Suite (16 Modules)"
                        : "Admin Oversight (17 Modules)"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label={tr('Close drawer')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Identity Card inside Drawer */}
              {currentUser && (
                <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                      {currentUser.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {currentUser.role}{tr('•')}{currentUser.location.split(",")[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={tr('Sign Out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Module Nav Links */}
              <div className="space-y-4 flex-1 pb-6">
                {navRenderer(portal === "farmer" ? farmerNavGroups : adminNavGroups)}
              </div>

              {/* Bottom Sign Out in Drawer */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === "bn" ? "অ্যাকাউন্ট থেকে লগআউট" : "Sign Out of Account"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center Main Stage Content */}
        <main className="w-full pb-20 sm:pb-8">
          {!isHomePage && (
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={navigateHome}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "হোম পেজ" : "Home"}</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-800">{activeTitle}</span>
              </div>
            </div>
          )}

          {/* Module Content */}
          <div key={language} className="space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Persistent Thumb-Nav for Phone Screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
        {portal === "farmer" ? (
          <>
            <button
              onClick={() => navigateByModule("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "dashboard"
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
            </button>
            <button
              onClick={() => navigateByModule("farms")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "farms"
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Trees className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "খামার" : "Farms"}</span>
            </button>
            <button
              onClick={() => navigateByModule("recommendation")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "recommendation"
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-amber-600" />
              <span>{language === "bn" ? "AI ফসল" : "AI Crop"}</span>
            </button>
            <button
              onClick={() => navigateByModule("harvest")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "harvest"
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <PackageCheck className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "হার্ভেস্ট" : "Harvest"}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-emerald-700"
            >
              <div className="relative">
                <Menu className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] px-1 rounded-full font-bold">
                  16
                </span>
              </div>
              <span>{language === "bn" ? "সব মেনু" : "All Menu"}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigateByModule("admin_dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "admin_dashboard"
                  ? "text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "কমান্ড" : "Command"}</span>
            </button>
            <button
              onClick={() => navigateByModule("marketplace")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "marketplace"
                  ? "text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "মার্কেট" : "Market"}</span>
            </button>
            <button
              onClick={() => navigateByModule("orders")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "orders"
                  ? "text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "অর্ডার" : "Orders"}</span>
            </button>
            <button
              onClick={() => navigateByModule("payments")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeModule === "payments"
                  ? "text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CreditCard className="w-5 h-5 mb-0.5" />
              <span>{language === "bn" ? "পেমেন্ট" : "Payments"}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-indigo-700"
            >
              <div className="relative">
                <Menu className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] px-1 rounded-full font-bold">
                  17
                </span>
              </div>
              <span>{language === "bn" ? "সব মেনু" : "All Menu"}</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};