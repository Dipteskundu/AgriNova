<<<<<<< HEAD
"use client";

import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/shared/Toast";
import { LanguageProvider } from "@/agriplatform/lib/LanguageContext";
import { AuthScreen, AuthUser } from "@/agriplatform/auth/AuthScreen";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (user: AuthUser) => {
    try {
      localStorage.setItem("agriplatform_user", JSON.stringify(user));
    } catch {}
    router.push(user.portal === "farmer" ? "/farmer" : "/admin");
  };

  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthScreen onLogin={handleLogin} />
      </ToastProvider>
    </LanguageProvider>
  );
}
=======
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Login</h1>
      <form className="mt-8 w-full max-w-md space-y-4">
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
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-gray-600">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-green-600 hover:underline">
          Register
        </a>
      </p>
    </main>
  );
}
>>>>>>> origin/development
