export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Register</h1>
      <form className="mt-8 w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <select className="w-full rounded-lg border border-gray-300 px-4 py-3">
          <option value="">Select Role</option>
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
          <option value="supplier">Input Supplier</option>
        </select>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-green-600 hover:underline">
          Login
        </a>
      </p>
    </main>
  );
}
