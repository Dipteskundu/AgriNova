"use client";

import { useRouter } from "next/navigation";
import { FarmerDashboard } from "@/features/farmer/dashboard";
import { AdminDashboard } from "@/features/admin/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { getRoute } from "@/features/layout/navConfig";
import { PortalType } from "@/types";

function MarketplaceDashboard({ onNavigate }: { onNavigate: (key: string) => void }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Marketplace Dashboard</h1>
      <p className="text-slate-500 mb-6">Buy and sell produce and farming inputs.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('browse_produce')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-semibold text-sm">Browse Produce</h3>
          <p className="text-xs text-slate-500 mt-1">Find fresh produce from farmers</p>
        </button>
        <button onClick={() => onNavigate('my_orders')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🛒</div>
          <h3 className="font-semibold text-sm">My Orders</h3>
          <p className="text-xs text-slate-500 mt-1">Track your purchases</p>
        </button>
        <button onClick={() => onNavigate('my_listings')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">📦</div>
          <h3 className="font-semibold text-sm">My Listings</h3>
          <p className="text-xs text-slate-500 mt-1">Manage your products for sale</p>
        </button>
        <button onClick={() => onNavigate('payments')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">💳</div>
          <h3 className="font-semibold text-sm">Payments</h3>
          <p className="text-xs text-slate-500 mt-1">View transaction history</p>
        </button>
      </div>
    </div>
  );
}

function OperationsDashboard({ onNavigate }: { onNavigate: (key: string) => void }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Operations Dashboard</h1>
      <p className="text-slate-500 mb-6">Quality inspections and delivery tracking.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('inspections')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-semibold text-sm">Quality Inspections</h3>
          <p className="text-xs text-slate-500 mt-1">Review quality assessments</p>
        </button>
        <button onClick={() => onNavigate('deliveries')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🚚</div>
          <h3 className="font-semibold text-sm">Delivery Tracking</h3>
          <p className="text-xs text-slate-500 mt-1">Monitor shipment status</p>
        </button>
        <button onClick={() => onNavigate('reports')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold text-sm">Reports</h3>
          <p className="text-xs text-slate-500 mt-1">View inspection reports</p>
        </button>
        <button onClick={() => onNavigate('fleet')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🚛</div>
          <h3 className="font-semibold text-sm">Fleet</h3>
          <p className="text-xs text-slate-500 mt-1">Manage delivery vehicles</p>
        </button>
      </div>
    </div>
  );
}

function SupportDashboard({ onNavigate }: { onNavigate: (key: string) => void }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Support Dashboard</h1>
      <p className="text-slate-500 mb-6">Disputes, help desk, and resolution center.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('disputes')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">⚖️</div>
          <h3 className="font-semibold text-sm">Disputes</h3>
          <p className="text-xs text-slate-500 mt-1">Resolve platform disputes</p>
        </button>
        <button onClick={() => onNavigate('help_tickets')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🎧</div>
          <h3 className="font-semibold text-sm">Help Tickets</h3>
          <p className="text-xs text-slate-500 mt-1">User support requests</p>
        </button>
        <button onClick={() => onNavigate('resolution_center')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">🛠️</div>
          <h3 className="font-semibold text-sm">Resolution Center</h3>
          <p className="text-xs text-slate-500 mt-1">Manage case resolutions</p>
        </button>
        <button onClick={() => onNavigate('messages')} className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-[#222] hover:border-emerald-400 transition-colors text-left cursor-pointer">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-semibold text-sm">Messages</h3>
          <p className="text-xs text-slate-500 mt-1">Communicate with users</p>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { portal } = useAuth();
  const router = useRouter();

  const handleNavigate = (moduleKey: string) => {
    router.push(getRoute(portal!, moduleKey));
  };

  switch (portal) {
    case 'admin':
      return <AdminDashboard onNavigate={handleNavigate} />;
    case 'marketplace':
      return <MarketplaceDashboard onNavigate={handleNavigate} />;
    case 'operations':
      return <OperationsDashboard onNavigate={handleNavigate} />;
    case 'support':
      return <SupportDashboard onNavigate={handleNavigate} />;
    default:
      return <FarmerDashboard onNavigate={handleNavigate} />;
  }
}
