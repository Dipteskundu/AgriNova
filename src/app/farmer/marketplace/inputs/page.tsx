import { tr } from "@/agriplatform/lib/localize";
export default function InputMarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{tr('Input Marketplace')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">{tr('Seeds')}</h2>
            <p className="mt-2 text-gray-600">{tr('Browse available seeds')}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">{tr('Fertilizers')}</h2>
            <p className="mt-2 text-gray-600">{tr('Browse fertilizers')}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">{tr('Tools & Equipment')}</h2>
            <p className="mt-2 text-gray-600">{tr('Browse agricultural tools')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
