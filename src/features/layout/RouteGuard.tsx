"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getActiveKey, ROUTE_MAP } from '@/features/layout/navConfig';
import { PortalType } from '@/types';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, selectedPortal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!selectedPortal) {
      if (pathname !== '/select-portal') {
        router.push('/select-portal');
      }
      return;
    }

    const routeMap = ROUTE_MAP[selectedPortal as PortalType];
    if (routeMap) {
      const validPaths = Object.values(routeMap);
      if (pathname !== '/dashboard' && !validPaths.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, selectedPortal, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#000000] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!selectedPortal) return null;

  return <>{children}</>;
}
