"use client";

import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/agriplatform/admin/AdminDashboard";
import { ADMIN_ROUTE_MAP } from "@/agriplatform/layout/routeMaps";

export default function Page() {
  const router = useRouter();

  return (
    <AdminDashboard
      onNavigate={(m) => router.push(ADMIN_ROUTE_MAP[m])}
    />
  );
}