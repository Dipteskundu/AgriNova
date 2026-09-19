import { tr } from "@/agriplatform/lib/localize";
export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{tr('AI Agriculture Assistant')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">{tr('Ask me anything about agriculture, crops, or the platform!')}</p>
          <div className="mt-4">
            <input
              type="text"
              placeholder={tr('Type your question...')}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
