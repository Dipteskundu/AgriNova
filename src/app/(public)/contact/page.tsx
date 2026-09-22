import { tr } from "@/agriplatform/lib/localize";

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">
        {tr("Contact Us")}
      </h1>

      <p className="mt-4 text-xl text-gray-600">
        {tr("Get in touch with the AgriNova team")}
      </p>
    </main>
  );
}