<<<<<<< HEAD
"use client";

import { useRouter } from "next/navigation";
import { FarmerDashboard } from "@/agriplatform/farmer/FarmerDashboard";
import { FARMER_ROUTE_MAP } from "@/agriplatform/layout/routeMaps";

export default function Page() {
  const router = useRouter();
  return <FarmerDashboard onNavigate={(m) => router.push(FARMER_ROUTE_MAP[m])} />;
}
=======
export default function farmer() {
  return (
    <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-gray-600">Farmer dashboard will be displayed here.</p>
      </main>
    </div>
  );
}
>>>>>>> origin/development
