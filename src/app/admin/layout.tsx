import { ToastProvider } from "@/components/shared/Toast";
import { LanguageProvider } from "@/agriplatform/lib/LanguageContext";
import { AgriPortalShell } from "@/agriplatform/layout/AgriPortalShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AgriPortalShell portal="admin">{children}</AgriPortalShell>
      </ToastProvider>
    </LanguageProvider>
  );
}