import { tr } from "@/agriplatform/lib/localize";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{tr("Register")}</h1>

      <form className="mt-8 w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder={tr("Full Name")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />

        <input
          type="email"
          placeholder={tr("Email")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />

        <input
          type="password"
          placeholder={tr("Password")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />

        <select className="w-full rounded-lg border border-gray-300 px-4 py-3">
          <option value="">{tr("Select Role")}</option>
          <option value="farmer">{tr("Farmer")}</option>
          <option value="buyer">{tr("Buyer")}</option>
          <option value="supplier">{tr("Input Supplier")}</option>
        </select>

        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          {tr("Register")}
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        {tr("Already have an account?")}{" "}
        <a
          href="/login"
          className="text-green-600 hover:underline"
        >
          {tr("Login")}
        </a>
      </p>
    </main>
  );
}