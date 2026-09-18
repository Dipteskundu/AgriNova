"use client";

import { useRouter } from "next/navigation";
import { CropRecommendation } from "@/agriplatform/farmer/CropRecommendation";
import { FARMER_ROUTE_MAP } from "@/agriplatform/layout/routeMaps";

export default function Page() {
  const router = useRouter();
  return <CropRecommendation onNavigate={(m) => router.push(FARMER_ROUTE_MAP[m])} />;
}