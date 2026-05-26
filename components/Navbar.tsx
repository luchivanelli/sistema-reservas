"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <span className="font-display text-2xl font-semibold text-[var(--navy)]">Med<span className="text-[var(--blue)]">Care</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link href="/buscar" className="px-4 py-2 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
            Buscar médicos
          </Link>
          <Link href="/mis-turnos" className="px-4 py-2 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
            Mis turnos
          </Link>
        </nav>

        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col gap-1.5 p-2 hover:bg-[var(--bg)] rounded-lg transition-colors cursor-pointer"
          aria-label="Abrir menú"
          aria-expanded={isOpen}
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden border-t border-[var(--border)] bg-white/95 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2">
            <Link
              href="/buscar"
              onClick={closeMenu}
              className="text-sm px-1 py-2 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors block"
            >
              Buscar médicos
            </Link>
            <Link
              href="/mis-turnos"
              onClick={closeMenu}
              className="text-sm px-1 py-2 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors block"
            >
              Mis turnos
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
