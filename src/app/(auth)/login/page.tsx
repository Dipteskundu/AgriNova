"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthScreen } from "@/features/auth";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    // `?next=` carries the page that bounced the visitor here — e.g. an
    // anonymous click through to `/products/:id` or `/inputs/:id`. Only
    // same-origin paths are honoured: `//evil.example` starts with a slash
    // too and would otherwise be an open redirect.
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

    router.replace(safeNext);
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/40 backdrop-blur-md flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return null;

  return <AuthScreen />;
}
