"use client";

import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/shared/Toast";
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
    <ToastProvider>
      <AuthScreen onLogin={handleLogin} />
    </ToastProvider>
  );
}