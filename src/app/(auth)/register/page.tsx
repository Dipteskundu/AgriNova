<<<<<<< HEAD
import { tr } from "@/agriplatform/lib/localize";
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{tr('Register')}</h1>
      <form className="mt-8 w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder={tr('Full Name')}
=======
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Register</h1>
      <form className="mt-8 w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Full Name"
>>>>>>> origin/development
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <input
          type="email"
<<<<<<< HEAD
          placeholder={tr('Email')}
=======
          placeholder="Email"
>>>>>>> origin/development
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <input
          type="password"
<<<<<<< HEAD
          placeholder={tr('Password')}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <select className="w-full rounded-lg border border-gray-300 px-4 py-3">
          <option value="">{tr('Select Role')}</option>
          <option value="farmer">{tr('Farmer')}</option>
          <option value="buyer">{tr('Buyer')}</option>
          <option value="supplier">{tr('Input Supplier')}</option>
=======
          placeholder="Password"
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <select className="w-full rounded-lg border border-gray-300 px-4 py-3">
          <option value="">Select Role</option>
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
          <option value="supplier">Input Supplier</option>
>>>>>>> origin/development
        </select>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
<<<<<<< HEAD
        >{tr('Register')}</button>
      </form>
      <p className="mt-4 text-gray-600">{tr('Already have an account?')}{" "}
        <a href="/login" className="text-green-600 hover:underline">{tr('Login')}</a>
=======
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-green-600 hover:underline">
          Login
        </a>
>>>>>>> origin/development
      </p>
    </main>
  );
}
