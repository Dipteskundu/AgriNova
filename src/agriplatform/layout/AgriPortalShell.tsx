"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Check,
  Truck,
  BookOpen,
  FileBarChart,
  Scale,
  Menu,
  X,
  SunMedium,
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
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base truncate">
                    AgriPlatform
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${
                      portal === "farmer"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {portal === "farmer" ? "Farmer" : "Admin"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block truncate">
                  Mohiuddin Khan Agricultural Ecosystem
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-900">
            <SunMedium className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold">Sherpur, Bogura:</span>
            <span>30.5°C • 74% Humidity • Microclimate Advisory Active</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                portal === "farmer"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-indigo-50 text-indigo-900 border-indigo-200"
              }`}
            >
              {portal === "farmer" ? (
                <>
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Farmer Portal</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin Command</span>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Notifications ({unreadCount} Unread)
                    </h4>
                    <button
                      onClick={() => navigateByModule("notifications")}
                      className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      View All
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

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700">
                {currentUser
                  ? currentUser.avatarInitials
                  : portal === "farmer"
                  ? "MK"
                  : "TI"}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">
                  {currentUser
                    ? currentUser.name
                    : portal === "farmer"
                    ? "Mohiuddin Khan"
                    : "Tariqul Islam"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentUser
                    ? `${currentUser.role} (${currentUser.location.split(",")[0]})`
                    : portal === "farmer"
                    ? "Lead Farmer (Bogura)"
                    : "Platform Admin HQ"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out of account"
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container with Sidebar & Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="px-3 py-2.5 mb-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {portal === "farmer" ? "Farmer Modules (16)" : "Admin Modules (17)"}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {currentUser?.role || (portal === "farmer" ? "Farmer" : "Admin")}
              </span>
            </div>

            <nav className="space-y-4">{navRenderer(portal === "farmer" ? farmerNavGroups : adminNavGroups)}</nav>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl p-4 overflow-y-auto flex flex-col z-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      AgriPlatform
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {portal === "farmer"
                        ? "Farmer Suite (16 Modules)"
                        : "Admin Oversight (17 Modules)"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                        {currentUser.role} • {currentUser.location.split(",")[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-4 flex-1 pb-6">
                {navRenderer(portal === "farmer" ? farmerNavGroups : adminNavGroups)}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center Main Stage Content */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>{portal === "farmer" ? "Farmer Portal" : "Admin Portal"}</span>
                <span>/</span>
                <span className="text-slate-700 font-medium">{activeTitle}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{activeTitle}</h1>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium">
                <Check className="w-3 h-3" />
                Backend Sync: Simulated Live
              </span>
            </div>
          </div>

          <div className="space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
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
              <span>ড্যাশবোর্ড</span>
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
              <span>খামার</span>
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
              <span>AI ফসল</span>
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
              <span>হার্ভেস্ট</span>
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
              <span>সব মেনু</span>
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
              <span>কমান্ড</span>
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
              <span>মার্কেট</span>
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
              <span>অর্ডার</span>
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
              <span>পেমেন্ট</span>
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
              <span>সব মেনু</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};