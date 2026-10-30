"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Activity, Menu, Search, X } from "lucide-react";
import CommandPalette from "./CommandPalette";

const LINKS = [
  { href: "/", label: "Inicio", match: (p: string) => p === "/" },
  { href: "/buscar", label: "Buscar médicos", match: (p: string) => p.startsWith("/buscar") || p.startsWith("/reservar") },
  { href: "/mis-turnos", label: "Mis turnos", match: (p: string) => p.startsWith("/mis-turnos") },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [paletaAbierta, setPaletaAbierta] = useState(false);

  const cerrarPaleta = useCallback(() => setPaletaAbierta(false), []);

  // Al navegar se cierran el menú mobile y la paleta (ajuste de estado derivado de una prop, sin efecto).
  const [rutaPrevia, setRutaPrevia] = useState(pathname);
  if (rutaPrevia !== pathname) {
    setRutaPrevia(pathname);
    setMenuAbierto(false);
    setPaletaAbierta(false);
  }

  // Atajo global Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletaAbierta((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-surface/85 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="MedCare, ir al inicio">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-brand">
              <Activity size={16} strokeWidth={2.5} />
            </span>
            <span className="text-[17px] font-bold tracking-tight text-ink">
              Med<span className="text-brand-600">Care</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {LINKS.map((l) => {
              const activo = l.match(pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={activo ? "page" : undefined}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    activo ? "bg-brand-50 text-brand-700" : "text-ink-2 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletaAbierta(true)}
              className="hidden h-9 items-center gap-2 rounded-xl border border-line-2 bg-canvas pl-3 pr-2 text-sm text-ink-3 transition-colors hover:border-brand-300 hover:text-ink md:flex"
              aria-label="Búsqueda rápida"
            >
              <Search size={15} />
              <span className="pr-4">Buscar…</span>
              <span className="kbd">Ctrl K</span>
            </button>
            <button
              onClick={() => setPaletaAbierta(true)}
              className="btn btn-ghost btn-icon md:hidden"
              aria-label="Búsqueda rápida"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="btn btn-ghost btn-icon md:hidden"
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuAbierto && (
          <nav className="border-t border-line bg-surface md:hidden animate-fade-in" aria-label="Principal móvil">
            <div className="container-x flex flex-col gap-1 py-3">
              {LINKS.map((l) => {
                const activo = l.match(pathname);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={activo ? "page" : undefined}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium ${activo ? "bg-brand-50 text-brand-700" : "text-ink-2 hover:bg-canvas"}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {paletaAbierta && <CommandPalette onClose={cerrarPaleta} />}
    </>
  );
}
