import { tr } from "@/agriplatform/lib/localize";
export default function AddFarmPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{tr('Add Farm')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <form className="space-y-4">
          <input
            type="text"
            placeholder={tr('Farm Name')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          <textarea
            placeholder={tr('Farm Description')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            rows={4}
          />
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >{tr('Save Farm')}</button>
        </form>
      </main>
    </div>
  );
}
