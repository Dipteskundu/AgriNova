"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS: { label: string; href: string; icon: IconName }[] = [
  { label: "Home", href: "/", icon: "Sprout" },
  { label: "About", href: "/about", icon: "BookOpen" },
];

interface PublicNavbarProps {
  transparent?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ transparent = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    setMobileOpen(true);
    setMounted(true);
  }, []);

  const closeMenu = useCallback(() => {
    setShow(false);
    setTimeout(() => {
      setMobileOpen(false);
      setMounted(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (mounted && mobileOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [mounted, mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  const navLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      transparent
        ? isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
        : isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a0a0a0] dark:hover:bg-[#1a1a1a] dark:hover:text-[#f0f0f0]"
    }`;
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    closeMenu();
    await logout();
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md ${
      transparent
        ? "bg-white/10 border-b border-white/10"
        : "bg-white/80 border-b border-slate-200/80 dark:bg-[#0a0a0a]/80 dark:border-[#222222]"
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="FarmPath" className="h-8 w-8 rounded-lg object-cover" />
          <span className={`text-lg font-bold tracking-tight ${
            transparent ? "text-white" : "text-slate-900 dark:text-[#f0f0f0]"
          }`}>
            FarmPath
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />

          {user ? (
            /* Profile Button */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  transparent
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                }`}
              >
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                <Icon name="ChevronRight" size={14} className={`transition-transform ${profileOpen ? "rotate-90" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#222222] shadow-xl py-2 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-[#222222]">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-[#a0a0a0] truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors"
                  >
                    <Icon name="User" size={16} className="text-slate-400 dark:text-[#666666]" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors"
                  >
                    <Icon name="LayoutDashboard" size={16} className="text-slate-400 dark:text-[#666666]" />
                    Dashboard
                  </Link>

                  <div className="my-1 h-px bg-slate-100 dark:bg-[#222222]" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full"
                  >
                    <Icon name="LogOut" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login / Register Buttons */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  transparent
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a0a0a0] dark:hover:bg-[#1a1a1a] dark:hover:text-[#f0f0f0]"
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={mobileOpen ? closeMenu : openMenu}
            className={`md:hidden rounded-lg p-2 transition-colors ${
              transparent
                ? "text-white hover:bg-white/10"
                : "text-slate-600 hover:bg-slate-100 dark:text-[#a0a0a0] dark:hover:bg-[#1a1a1a]"
            }`}
          >
            <Icon name={mobileOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Slide-in Panel */}
      {mounted && createPortal(
        <>
          <div
            onClick={closeMenu}
            className={`md:hidden fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity duration-300 ${
              show ? "opacity-100" : "opacity-0"
            }`}
            style={{ zIndex: 9998 }}
          />

          <div
            className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-[#0a0a0a] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
              show ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ zIndex: 9999 }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-[#222222]">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                <img src="/logo.png" alt="FarmPath" className="h-7 w-7 rounded-lg object-cover" />
                <span className="text-base font-bold text-slate-900 dark:text-[#f0f0f0]">FarmPath</span>
              </Link>
              <button
                onClick={closeMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1a1a1a] dark:hover:text-[#a0a0a0] transition-colors"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-[#a0a0a0] dark:hover:bg-[#111111] dark:hover:text-[#f0f0f0]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon name={link.icon} size={18} className={isActive ? "text-emerald-600 dark:text-emerald-400" : ""} />
                        {link.label}
                      </span>
                      <Icon name="ChevronRight" size={16} className="text-slate-300 dark:text-[#444444]" />
                    </Link>
                  );
                })}
                {user && (
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      pathname === "/dashboard"
                        ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-[#a0a0a0] dark:hover:bg-[#111111] dark:hover:text-[#f0f0f0]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon name="LayoutDashboard" size={18} />
                      Dashboard
                    </span>
                    <Icon name="ChevronRight" size={16} className="text-slate-300 dark:text-[#444444]" />
                  </Link>
                )}
              </div>

              <div className="my-5 h-px bg-slate-100 dark:bg-[#222222]" />

              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111]">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </nav>

            {/* Auth buttons at bottom */}
            <div className="px-5 pb-6 pt-4 border-t border-slate-100 dark:border-[#222222]">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#a0a0a0] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0a0a0a] dark:text-[#e0e0e0] dark:hover:bg-[#111111]"
                  >
                    <Icon name="User" size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0a0a0a] dark:text-[#e0e0e0] dark:hover:bg-[#111111]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};
