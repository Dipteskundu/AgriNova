export default function DemandsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Demand Board</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-gray-600">No demands posted yet.</p>
        <a
          href="/farmer/demands/create"
          className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Post Demand
        </a>
      </main>
    </div>
  );
}
