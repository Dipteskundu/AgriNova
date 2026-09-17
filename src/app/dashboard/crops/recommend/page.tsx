export default function CropRecommendationPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Crop Recommendations
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-gray-600">
          Based on your field information, we recommend:
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Rice</h2>
            <p className="mt-2 text-gray-600">Suitable for wet season</p>
            <button className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Select
            </button>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Wheat</h2>
            <p className="mt-2 text-gray-600">Suitable for winter season</p>
            <button className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Select
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
