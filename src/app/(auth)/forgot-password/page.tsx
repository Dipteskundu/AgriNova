<<<<<<< HEAD
import { tr } from "@/agriplatform/lib/localize";
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{tr('Forgot Password')}</h1>
      <form className="mt-8 w-full max-w-md space-y-4">
        <input
          type="email"
          placeholder={tr('Enter your email')}
=======
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Forgot Password</h1>
      <form className="mt-8 w-full max-w-md space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
>>>>>>> origin/development
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
<<<<<<< HEAD
        >{tr('Send Reset Link')}</button>
      </form>
      <p className="mt-4 text-gray-600">{tr('Remember your password?')}{" "}
        <a href="/login" className="text-green-600 hover:underline">{tr('Login')}</a>
=======
        >
          Send Reset Link
        </button>
      </form>
      <p className="mt-4 text-gray-600">
        Remember your password?{" "}
        <a href="/login" className="text-green-600 hover:underline">
          Login
        </a>
>>>>>>> origin/development
      </p>
    </main>
  );
}
