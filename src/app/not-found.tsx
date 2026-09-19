import { tr } from "@/agriplatform/lib/localize";
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">{tr('Page Not Found')}</p>
      <a href="/" className="mt-6 text-blue-500 hover:underline">{tr('Go back home')}</a>
    </div>
  );
}
