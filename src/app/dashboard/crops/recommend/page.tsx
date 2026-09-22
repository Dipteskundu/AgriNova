"use client";
import { useRouter } from "next/navigation";
import { CropRecommendation } from "@/features/farmer/crops";
import { getRoute } from "@/features/layout/navConfig";
import { useAuth } from "@/contexts/AuthContext";
export default function Page() {
  const { portal } = useAuth();
  const router = useRouter();
  return <CropRecommendation onNavigate={(m) => router.push(portal ? getRoute(portal, m) : '/dashboard')} />;
}
