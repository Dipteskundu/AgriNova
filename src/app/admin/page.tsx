<<<<<<< HEAD
"use client";

import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/agriplatform/admin/AdminDashboard";
import { ADMIN_ROUTE_MAP } from "@/agriplatform/layout/routeMaps";

export default function Page() {
  const router = useRouter();
  return <AdminDashboard onNavigate={(m) => router.push(ADMIN_ROUTE_MAP[m])} />;
}
=======
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/users"
            className="rounded-lg bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="mt-2 text-gray-600">Manage platform users</p>
          </a>
          <a
            href="/admin/products"
            className="rounded-lg bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="mt-2 text-gray-600">Manage marketplace products</p>
          </a>
          <a
            href="/admin/orders"
            className="rounded-lg bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Orders</h2>
            <p className="mt-2 text-gray-600">Manage all orders</p>
          </a>
          <a
            href="/admin/reports"
            className="rounded-lg bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Reports</h2>
            <p className="mt-2 text-gray-600">View platform reports</p>
          </a>
        </div>
      </main>
    </div>
  );
}
>>>>>>> origin/development
