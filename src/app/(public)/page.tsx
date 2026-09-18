export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to AgriNova</h1>
      <p className="mt-4 text-xl text-gray-600">
        Smart Agriculture & Farm-to-Market Platform
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/login"
          className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Login
        </a>
        <a
          href="/register"
          className="rounded-lg border border-green-600 px-6 py-3 text-green-600 hover:bg-green-50"
        >
          Register
        </a>
      </div>
    </main>
  );
}
