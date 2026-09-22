"use client";

import React, { useState, useEffect, useCallback } from "react";
import { tr } from "@/lib/localize";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ArrowLeft,
  Bell,
  LogOut,
  LayoutDashboard,
  Trees,
  Sparkles,
  PackageCheck,
  Store,
  ShoppingCart,
  CreditCard,
} from "@/components/icons";
import { FarmerNotification } from "@/types";
import { getFarmerNotifications, markNotificationAsRead } from "@/lib/farmerApi";
import {
  getNavGroups,
  getRoute,
  getActiveKey,
} from "@/features/layout/navConfig";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface AgriPortalShellProps {
  children: React.ReactNode;
}

export const AgriPortalShell: React.FC<AgriPortalShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, portal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<FarmerNotification[]>([]);
  const { language } = useLanguage();

  const navigate = useCallback(
    (route: string) => {
      setMobileMenuOpen(false);
      setNotificationsOpen(false);
      router.push(route);
    },
    [router]
  );

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setDrawerClosing(false);
    }, 250);
  }, []);

  const navigateByModule = useCallback(
    (key: string) => {
      if (!portal) return;
      const route = getRoute(portal, key);
      if (route) navigate(route);
    },
    [portal, navigate]
  );

  const navigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const navigateToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const loadNotifications = useCallback(async () => {
    const res = await getFarmerNotifications();
    if (res.success) setNotifications(res.data);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, pathname]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markNotificationAsRead(id);
      loadNotifications();
    },
    [loadNotifications]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const activeModule = portal ? getActiveKey(portal, pathname) : 'dashboard';
  const isHomePage = pathname === "/dashboard";

  const navGroups = portal ? getNavGroups(portal) : [];

  const activeTitle =
    navGroups.flatMap((g) => g.items).find((i) => i.key === activeModule)?.label ||
    (portal === "farmer" ? "Farmer Portal" : portal === "admin" ? "Admin Portal" : portal === "marketplace" ? "Marketplace" : portal === "operations" ? "Operations" : "Support");

  const navRenderer = (groups: typeof navGroups) =>
    groups.map((group) => (
      <div key={group.group}>
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#666666] mb-1">
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? portal === "farmer"
                      ? "bg-emerald-700 text-white font-semibold shadow-xs"
                      : "bg-indigo-700 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a0a0a0] dark:hover:bg-[#111111] dark:hover:text-[#f0f0f0]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-[#666666]"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white text-emerald-800"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ));

  const mobileNavItems = portal === "farmer"
    ? [
        { key: "dashboard", label: language === "bn" ? "ড্যাশবোর্ড" : "Dashboard", Icon: LayoutDashboard },
        { key: "farms", label: language === "bn" ? "খামার" : "Farms", Icon: Trees },
        { key: "recommendation", label: language === "bn" ? "AI ফসল" : "AI Crop", Icon: Sparkles },
        { key: "harvest", label: language === "bn" ? "হার্ভেস্ট" : "Harvest", Icon: PackageCheck },
      ]
    : [
        { key: "admin_dashboard", label: language === "bn" ? "কমান্ড" : "Command", Icon: LayoutDashboard },
        { key: "marketplace", label: language === "bn" ? "মার্কেট" : "Market", Icon: Store },
        { key: "orders", label: language === "bn" ? "অর্ডার" : "Orders", Icon: ShoppingCart },
        { key: "payments", label: language === "bn" ? "পেমেন্ট" : "Payments", Icon: CreditCard },
      ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] flex flex-col antialiased text-slate-900 dark:text-slate-100">
      {/* Ultra-Minimalist Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 dark:backdrop-blur-xl backdrop-blur-md border-b border-slate-200/80 dark:border-[#222222] shadow-2xs">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 dark:text-[#a0a0a0] hover:bg-slate-100 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer shrink-0"
              title={language === "bn" ? "মেনু খুলুন" : "Open menu"}
              aria-label="Open navigation menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={navigateHome}
              className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
              title="Dashboard"
            >
              <img src="/logo.png" alt="FarmPath" className="w-8 h-8 rounded-xl object-cover shrink-0" />
              <span className="hidden sm:inline font-black text-slate-900 dark:text-[#f0f0f0] tracking-tight text-sm sm:text-base">
                {tr('FarmPath')}
              </span>
            </button>

            {/* Role Badge */}
            <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              portal === "farmer"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
            }`}>
              {portal === "farmer" ? (language === "bn" ? "কৃষক" : "Farmer") : (language === "bn" ? "এডমিন" : "Admin")}
            </span>
          </div>

          {/* Right Action: Language Switcher, Services Drawer, Notifications & User */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher responsive />
            <ThemeToggle />

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
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
                <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222] shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#e0e0e0]">
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
                            ? "bg-white dark:bg-[#1a1a1a] border-slate-100 dark:border-[#333333] text-slate-600 dark:text-[#999999]"
                            : "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-slate-800 dark:text-[#e0e0e0] font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</span>
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

            {/* Profile Avatar */}
            <button
              onClick={() => {
                if (portal === "farmer") navigateByModule("profile");
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer shrink-0"
              title="Profile"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container (Center Stage) */}
      <div className="flex-1 max-w-screen-2xl w-full mx-auto px-3 sm:px-6 py-5">
        {/* All Services Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs ${
                drawerClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
              }`}
              onClick={closeDrawer}
            />
            <div className={`relative w-72 max-w-[85vw] bg-white dark:bg-[#0a0a0a] h-full shadow-2xl p-3.5 overflow-y-auto flex flex-col z-10 ${
              drawerClosing ? 'animate-drawer-out' : 'animate-drawer-in'
            }`}>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#222222] mb-2.5">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="FarmPath" className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm leading-tight">
                      {tr('FarmPath')}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label={tr('Close drawer')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Module Nav Links */}
              <div className="space-y-3 flex-1 pb-5">
                {navRenderer(navGroups)}
              </div>

              {/* Bottom Sign Out in Drawer */}
              <div className="pt-2.5 border-t border-slate-200 dark:border-[#222222]">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer dark:border-rose-500/20 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300"
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
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-[#222222]/60 pb-3">
              <div className="flex items-center gap-2">
                <button
        onClick={navigateToDashboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === "bn" ? "হোম পেজ" : "Home"}</span>
                </button>
                <span className="text-slate-300 dark:text-[#333333]">/</span>
                <span className="text-xs font-bold text-slate-800 dark:text-[#e0e0e0]">{activeTitle}</span>
              </div>
            </div>
          )}

          {/* Module Content */}
          <div key={language} className="space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 dark:backdrop-blur-xl backdrop-blur-md border-t border-slate-200 dark:border-[#222222] px-1 py-1.5 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigateByModule(item.key)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              activeModule === item.key
                ? portal === "farmer" ? "text-emerald-700 font-bold" : "text-indigo-700 font-bold"
                : "text-slate-500 dark:text-[#a0a0a0] hover:text-slate-800"
            }`}
          >
            <item.Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:${portal === "farmer" ? "text-emerald-700" : "text-indigo-700"}`}
        >
          <div className="relative">
            <Menu className="w-5 h-5 mb-0.5" />
            <span className={`absolute -top-1 -right-2 text-white text-[9px] px-1 rounded-full font-bold ${
              portal === "farmer" ? "bg-emerald-600" : "bg-indigo-600"
            }`}>
              {portal === "farmer" ? "16" : "17"}
            </span>
          </div>
          <span>{language === "bn" ? "সব মেনু" : "All Menu"}</span>
        </button>
      </nav>
    </div>
  );
};
