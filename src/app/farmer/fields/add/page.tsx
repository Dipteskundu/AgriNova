import { tr } from "@/agriplatform/lib/localize";
export default function AddFieldPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{tr('Add Field')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <form className="space-y-4">
          <input
            type="text"
            placeholder={tr('Field Name')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          <input
            type="number"
            placeholder={tr('Land Area (acres)')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          <select className="w-full rounded-lg border border-gray-300 px-4 py-3">
            <option value="">{tr('Select Season')}</option>
            <option value="spring">{tr('Spring')}</option>
            <option value="summer">{tr('Summer')}</option>
            <option value="autumn">{tr('Autumn')}</option>
            <option value="winter">{tr('Winter')}</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >{tr('Save Field')}</button>
        </form>
      </main>
    </div>
  );
}
