export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <a
            href="/dashboard/marketplace/inputs"
            className="rounded-lg bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Input Marketplace</h2>
            <p className="mt-2 text-gray-600">
              Buy seeds, fertilizers, and agricultural supplies
            </p>
          </a>
          <a
            href="/dashboard/marketplace/produce"
            className="rounded-lg bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Produce Marketplace</h2>
            <p className="mt-2 text-gray-600">
              Sell your harvested products
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
