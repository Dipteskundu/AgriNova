"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { PortalSelector } from "@/features/auth/PortalSelector";

export default function SelectPortalPage() {
  return (
    <ToastProvider>
      <PortalSelector />
    </ToastProvider>
  );
}
