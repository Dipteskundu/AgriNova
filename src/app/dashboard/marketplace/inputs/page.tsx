export default function InputMarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Input Marketplace
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Seeds</h2>
            <p className="mt-2 text-gray-600">Browse available seeds</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Fertilizers</h2>
            <p className="mt-2 text-gray-600">Browse fertilizers</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Tools & Equipment</h2>
            <p className="mt-2 text-gray-600">Browse agricultural tools</p>
          </div>
        </div>
      </main>
    </div>
  );
}
