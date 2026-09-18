export default function HarvestPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Harvest</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-gray-600">No harvest lots created yet.</p>
        <a
          href="/dashboard/harvest/create"
          className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Create Harvest Lot
        </a>
      </main>
    </div>
  );
}
