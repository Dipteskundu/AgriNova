"use client";

import { useRouter } from "next/navigation";
import { CropManagement } from "@/agriplatform/farmer/CropManagement";
import { FARMER_ROUTE_MAP } from "@/agriplatform/layout/routeMaps";

export default function Page() {
  const router = useRouter();
  return <CropManagement onNavigate={(m) => router.push(FARMER_ROUTE_MAP[m])} />;
}