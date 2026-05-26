import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedCare — Reservá tu turno",
  description: "Conectá con los mejores profesionales médicos de tu zona.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">{children}</body>
    </html>
  );
}
