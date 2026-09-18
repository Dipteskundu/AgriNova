export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">My Farms</h2>
            <p className="mt-2 text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Active Crops</h2>
            <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Pending Orders</h2>
            <p className="mt-2 text-3xl font-bold text-orange-600">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="mt-2 text-3xl font-bold text-purple-600">$0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
