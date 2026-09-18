import { ToastProvider } from "@/components/shared/Toast";
import { AgriPortalShell } from "@/agriplatform/layout/AgriPortalShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AgriPortalShell portal="admin">{children}</AgriPortalShell>
    </ToastProvider>
  );
}