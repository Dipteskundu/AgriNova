"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

const FOOTER_LINKS = {
  platform: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Crop Suggestion", href: "/farmer/crops/recommend" },
    { label: "Login", href: "/login" },
  ],
  resources: [
    { label: "Farmer Portal", href: "/farmer" },
    { label: "Admin Portal", href: "/admin" },
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white dark:bg-[#0a0a0a] dark:border-[#222222]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="FarmPath" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#f0f0f0]">
                FarmPath
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-[#a0a0a0] max-w-xs leading-relaxed">
              National Digital Agriculture & Farm-to-Market Platform. Connecting farmers with precision intelligence and instant markets.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="text-slate-400 hover:text-emerald-600 dark:text-[#666666] dark:hover:text-emerald-400 transition-colors">
                <Icon name="Globe" size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-emerald-600 dark:text-[#666666] dark:hover:text-emerald-400 transition-colors">
                <Icon name="Mail" size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-emerald-600 dark:text-[#666666] dark:hover:text-emerald-400 transition-colors">
                <Icon name="Phone" size={18} />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3">Platform</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-emerald-600 dark:text-[#a0a0a0] dark:hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3">Resources</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-emerald-600 dark:text-[#a0a0a0] dark:hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3">Stay Updated</h3>
            <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mb-3">
              Get the latest market prices and farming tips.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-[#111111] dark:border-[#333333] dark:text-[#f0f0f0] dark:placeholder:text-[#666666]"
              />
              <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200/80 dark:border-[#222222] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-[#666666]">
            &copy; 2026 FarmPath. All rights reserved. Ministry of Agriculture, Bangladesh.
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LINKS.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-slate-400 hover:text-emerald-600 dark:text-[#666666] dark:hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
