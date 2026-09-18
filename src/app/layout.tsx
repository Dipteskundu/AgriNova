import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriNova - Smart Agriculture & Farm-to-Market Platform",
  description: "A comprehensive platform for farmers to manage their agricultural journey from planning to selling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
