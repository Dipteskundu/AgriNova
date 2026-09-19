import React, { useState } from 'react';
import { tr } from "@/agriplatform/lib/localize";
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
  Radio,
  Terminal,
  DollarSign,
  FileCheck,
  Send,
  LogOut,
  ArrowLeft,
  Grid,
} from '@/components/icons';
import { PortalType, FarmerNotification } from '@/agriplatform/types';
import { AuthUser } from '@/agriplatform/auth/AuthScreen';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export type FarmerModuleKey =
  | 'dashboard'
  | 'profile'
  | 'farms'
  | 'fields'
  | 'recommendation'
  | 'comparison'
  | 'crops'
  | 'logs'
  | 'calendar'
  | 'harvest'
  | 'expenses'
  | 'profitability'
  | 'weather'
  | 'training'
  | 'ai_result'
  | 'notifications';

export type AdminModuleKey =
  | 'admin_dashboard'
  | 'user_management'
  | 'marketplace'
  | 'orders'
  | 'payments'
  | 'quality'
  | 'logistics'
  | 'training_management'
  | 'reports'
  | 'disputes'
  | 'farm_verification'
  | 'crop_catalog'
  | 'advisory_management'
  | 'market_prices'
  | 'weather_broadcast'
  | 'platform_analytics'
  | 'system_audit';

interface AppLayoutProps {
  portal: PortalType;
  setPortal?: (portal: PortalType) => void;
  activeFarmerModule: FarmerModuleKey;
  setActiveFarmerModule: (m: FarmerModuleKey) => void;
  activeAdminModule: AdminModuleKey;
  setActiveAdminModule: (m: AdminModuleKey) => void;
  notifications: FarmerNotification[];
  onMarkNotificationRead: (id: string) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  portal,
  activeFarmerModule,
  setActiveFarmerModule,
  activeAdminModule,
  setActiveAdminModule,
  notifications,
  onMarkNotificationRead,
  currentUser,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { language, t } = useLanguage();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const farmerNavGroups = [
    {
      group: t('navCore'),
      items: [
        { key: 'dashboard' as FarmerModuleKey, label: t('modDashboard'), icon: LayoutDashboard },
        { key: 'profile' as FarmerModuleKey, label: t('modProfile'), icon: User },
        { key: 'notifications' as FarmerModuleKey, label: t('modNotifications'), icon: Bell, badge: unreadCount },
      ],
    },
    {
      group: t('navFarmCrop'),
      items: [
        { key: 'farms' as FarmerModuleKey, label: t('modFarms'), icon: Trees },
        { key: 'fields' as FarmerModuleKey, label: t('modFields'), icon: Grid3X3 },
        { key: 'crops' as FarmerModuleKey, label: t('modCrops'), icon: Sprout },
        { key: 'logs' as FarmerModuleKey, label: t('modLogs'), icon: ClipboardList },
        { key: 'calendar' as FarmerModuleKey, label: t('modCalendar'), icon: Calendar },
        { key: 'harvest' as FarmerModuleKey, label: t('modHarvest'), icon: PackageCheck },
      ],
    },
    {
      group: t('navAdvisory'),
      items: [
        { key: 'recommendation' as FarmerModuleKey, label: t('modRecommendation'), icon: Sparkles },
        { key: 'comparison' as FarmerModuleKey, label: t('modComparison'), icon: GitCompare },
        { key: 'weather' as FarmerModuleKey, label: t('modWeather'), icon: CloudSun },
        { key: 'training' as FarmerModuleKey, label: t('modTraining'), icon: GraduationCap },
        { key: 'ai_result' as FarmerModuleKey, label: t('modAiResult'), icon: BrainCircuit },
      ],
    },
    {
      group: t('navFinancials'),
      items: [
        { key: 'expenses' as FarmerModuleKey, label: t('modExpenses'), icon: Receipt },
        { key: 'profitability' as FarmerModuleKey, label: t('modProfitability'), icon: TrendingUp },
      ],
    },
  ];

  const adminNavGroups = [
    {
      group: t('navAdminCore'),
      items: [
        { key: 'admin_dashboard' as AdminModuleKey, label: t('modAdminDashboard'), icon: ShieldCheck },
        { key: 'user_management' as AdminModuleKey, label: t('modUserManagement'), icon: Users },
        { key: 'marketplace' as AdminModuleKey, label: t('modMarketplace'), icon: Store },
        { key: 'orders' as AdminModuleKey, label: t('modOrders'), icon: ShoppingCart },
        { key: 'payments' as AdminModuleKey, label: t('modPayments'), icon: CreditCard },
        { key: 'quality' as AdminModuleKey, label: t('modQuality'), icon: CheckCircle },
        { key: 'logistics' as AdminModuleKey, label: t('modLogistics'), icon: Truck },
        { key: 'training_management' as AdminModuleKey, label: t('modTrainingManagement'), icon: BookOpen },
        { key: 'reports' as AdminModuleKey, label: t('modReports'), icon: FileBarChart },
        { key: 'disputes' as AdminModuleKey, label: t('modDisputes'), icon: Scale },
      ],
    },
    {
      group: t('navAdminRegulatory'),
      items: [
        { key: 'farm_verification' as AdminModuleKey, label: t('modFarmVerification'), icon: FileCheck },
        { key: 'crop_catalog' as AdminModuleKey, label: t('modCropCatalog'), icon: Sprout },
        { key: 'advisory_management' as AdminModuleKey, label: t('modAdvisoryManagement'), icon: Send },
        { key: 'market_prices' as AdminModuleKey, label: t('modMarketPrices'), icon: DollarSign },
        { key: 'weather_broadcast' as AdminModuleKey, label: t('modWeatherBroadcast'), icon: Radio },
        { key: 'platform_analytics' as AdminModuleKey, label: t('modPlatformAnalytics'), icon: FileBarChart },
        { key: 'system_audit' as AdminModuleKey, label: t('modSystemAudit'), icon: Terminal },
      ],
    },
  ];

  const isFarmerHomePage = portal === 'farmer' && activeFarmerModule === 'dashboard';
  const isAdminHomePage = portal === 'admin' && activeAdminModule === 'admin_dashboard';
  const isHomePage = isFarmerHomePage || isAdminHomePage;

  const activeTitle =
    portal === 'farmer'
      ? farmerNavGroups.flatMap((g) => g.items).find((i) => i.key === activeFarmerModule)?.label || 'Farmer Portal'
      : adminNavGroups.flatMap((g) => g.items).find((i) => i.key === activeAdminModule)?.label || 'Admin Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Ultra-Minimalist Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={() => {
                if (portal === 'farmer') setActiveFarmerModule('dashboard');
                else setActiveAdminModule('admin_dashboard');
              }}
              className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
              title="à¦¹à§‹à¦® à¦ªà§‡à¦œ / Home"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">{tr('AgriPlatform')}</span>
            </button>

            {/* If NOT on home page: clean Back to Home button */}
            {!isHomePage && (
              <button
                onClick={() => {
                  if (portal === 'farmer') setActiveFarmerModule('dashboard');
                  else setActiveAdminModule('admin_dashboard');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'à¦¹à§‹à¦®' : 'Home'}</span>
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

            {/* All Services Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
              title={language === 'bn' ? 'à¦¸à¦•à¦² à¦¸à§‡à¦¬à¦¾ à¦¦à§‡à¦–à§à¦¨' : 'All Services'}
            >
              <Grid className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">{language === 'bn' ? 'à¦¸à¦•à¦² à¦¸à§‡à¦¬à¦¾' : 'Services'}</span>
            </button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
                aria-label={tr('View notifications')}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {language === 'bn' ? `à¦¬à¦¿à¦œà§à¦žà¦ªà§à¦¤à¦¿ (${unreadCount} à¦Ÿà¦¿ à¦¨à¦¤à§à¦¨)` : `Notifications (${unreadCount})`}
                    </h4>
                    <button
                      onClick={() => {
                        setActiveFarmerModule('notifications');
                        setNotificationsOpen(false);
                      }}
                      className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      {language === 'bn' ? 'à¦¸à¦¬ à¦¦à§‡à¦–à§à¦¨' : 'View All'}
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.actionLink) {
                            setActiveFarmerModule(notif.actionLink as FarmerModuleKey);
                          }
                          setNotificationsOpen(false);
                        }}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          notif.isRead
                            ? 'bg-white border-slate-100 text-slate-600'
                            : 'bg-emerald-50/50 border-emerald-100 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{notif.title}</span>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
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
                  if (portal === 'farmer') setActiveFarmerModule('profile');
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                title="à¦ªà§à¦°à§‹à¦«à¦¾à¦‡à¦² / Profile"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  {currentUser ? currentUser.avatarInitials : portal === 'farmer' ? 'MK' : 'TI'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800">
                  {currentUser ? currentUser.name.split(' ')[0] : 'à¦®à¦¹à¦¿à¦‰à¦¦à§à¦¦à§€à¦¨'}
                </span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title={tr('Sign out of account')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  aria-label={tr('Sign out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
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
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{tr('AgriPlatform')}</h3>
                    <p className="text-[10px] text-slate-500">
                      {portal === 'farmer' ? 'Farmer Suite (16 Modules)' : 'Admin Oversight (10 Modules)'}
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
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.role} {tr('â€¢')} {currentUser.location.split(',')[0]}</p>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title={tr('Sign Out')}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Module Nav Links */}
              <div className="space-y-4 flex-1 pb-6">
                {portal === 'farmer'
                  ? farmerNavGroups.map((group) => (
                      <div key={group.group}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                          {group.group}
                        </p>
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeFarmerModule === item.key;
                            return (
                              <button
                                key={item.key}
                                onClick={() => {
                                  setActiveFarmerModule(item.key);
                                  setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                                  isActive
                                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-emerald-100 text-emerald-800'
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
                    ))
                  : adminNavGroups.map((group) => (
                      <div key={group.group}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                          {group.group}
                        </p>
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeAdminModule === item.key;
                            return (
                              <button
                                key={item.key}
                                onClick={() => {
                                  setActiveAdminModule(item.key);
                                  setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                                  isActive
                                    ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                                  <span className="truncate">{item.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
              </div>

              {/* Bottom Sign Out in Drawer */}
              {onLogout && (
                <div className="pt-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Main Stage Content */}
        <main className="w-full pb-20 sm:pb-8">
          {!isHomePage && (
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (portal === 'farmer') setActiveFarmerModule('dashboard');
                    else setActiveAdminModule('admin_dashboard');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'à¦¹à§‹à¦® à¦ªà§‡à¦œ' : 'Home'}</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-800">{activeTitle}</span>
              </div>
            </div>
          )}

          {/* Module Content */}
          <div key={language} className="space-y-5">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Persistent Thumb-Nav for Phone Screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
        {portal === 'farmer' ? (
          <>
            <button
              onClick={() => setActiveFarmerModule('dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeFarmerModule === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡' : 'Dashboard'}</span>
            </button>
            <button
              onClick={() => setActiveFarmerModule('farms')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeFarmerModule === 'farms' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trees className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦–à¦¾à¦®à¦¾à¦°' : 'Farms'}</span>
            </button>
            <button
              onClick={() => setActiveFarmerModule('recommendation')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeFarmerModule === 'recommendation' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-amber-600" />
              <span>{language === 'bn' ? 'AI à¦«à¦¸à¦²' : 'AI Crop'}</span>
            </button>
            <button
              onClick={() => setActiveFarmerModule('harvest')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeFarmerModule === 'harvest' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PackageCheck className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦¹à¦¾à¦°à§à¦­à§‡à¦¸à§à¦Ÿ' : 'Harvest'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-emerald-700"
            >
              <div className="relative">
                <Menu className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] px-1 rounded-full font-bold">16</span>
              </div>
              <span>{language === 'bn' ? 'à¦¸à¦¬ à¦®à§‡à¦¨à§' : 'All Menu'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveAdminModule('admin_dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeAdminModule === 'admin_dashboard' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦•à¦®à¦¾à¦¨à§à¦¡' : 'Command'}</span>
            </button>
            <button
              onClick={() => setActiveAdminModule('marketplace')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeAdminModule === 'marketplace' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦®à¦¾à¦°à§à¦•à§‡à¦Ÿ' : 'Market'}</span>
            </button>
            <button
              onClick={() => setActiveAdminModule('orders')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeAdminModule === 'orders' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦…à¦°à§à¦¡à¦¾à¦°' : 'Orders'}</span>
            </button>
            <button
              onClick={() => setActiveAdminModule('payments')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                activeAdminModule === 'payments' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-0.5" />
              <span>{language === 'bn' ? 'à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ' : 'Payments'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-indigo-700"
            >
              <div className="relative">
                <Menu className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] px-1 rounded-full font-bold">10</span>
              </div>
              <span>{language === 'bn' ? 'à¦¸à¦¬ à¦®à§‡à¦¨à§' : 'All Menu'}</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};
