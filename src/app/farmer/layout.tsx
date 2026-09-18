import { ToastProvider } from "@/components/shared/Toast";
import { AgriPortalShell } from "@/agriplatform/layout/AgriPortalShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AgriPortalShell portal="farmer">{children}</AgriPortalShell>
    </ToastProvider>
  );
}