"use client";

import { useRouter } from "next/navigation";
import { FarmerDashboard } from "@/agriplatform/farmer/FarmerDashboard";
import { FARMER_ROUTE_MAP } from "@/agriplatform/layout/routeMaps";

export default function Page() {
  const router = useRouter();

  return (
    <FarmerDashboard
      onNavigate={(m) => router.push(FARMER_ROUTE_MAP[m])}
    />
  );
}