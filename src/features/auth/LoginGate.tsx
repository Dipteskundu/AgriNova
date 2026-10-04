"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Redirects an anonymous visitor to `/login`, remembering where they were so
 * they land back on the page they asked for.
 *
 * Used by the two detail routes. The list pages (`/products`, `/inputs`) stay
 * open — only seeing an item's detail or ordering it needs a session, which
 * is the rule the product owner set.
 *
 * The `pathname.startsWith("/login")` guard exists because `replace()` makes
 * this component remount on the login route; without it the effect would fire
 * again and rewrite `next` to point at itself.
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || user) return;
    if (pathname.startsWith("/login")) return;
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-[#1a1a1a] rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-5 bg-slate-200 dark:bg-[#1a1a1a] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
