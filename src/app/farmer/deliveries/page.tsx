import { tr } from "@/agriplatform/lib/localize";
export default function DeliveriesPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{tr('Deliveries')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-gray-600">{tr('No deliveries in progress.')}</p>
      </main>
    </div>
  );
}
