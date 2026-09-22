import { ToastProvider } from "@/components/ui/Toast";
import { AgriPortalShell } from "@/features/layout";
import { RouteGuard } from "@/features/layout/RouteGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <RouteGuard>
        <AgriPortalShell>{children}</AgriPortalShell>
      </RouteGuard>
    </ToastProvider>
  );
}
