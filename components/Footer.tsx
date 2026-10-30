import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Activity size={16} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">MedCare</p>
            <p className="text-xs text-ink-3">Turnos médicos sin vueltas.</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
          <Link href="/buscar" className="hover:text-brand-600">Buscar médicos</Link>
          <Link href="/mis-turnos" className="hover:text-brand-600">Mis turnos</Link>
          <Link href="/#como-funciona" className="hover:text-brand-600">Cómo funciona</Link>
        </nav>

        <p className="text-xs text-ink-3">© {new Date().getFullYear()} MedCare. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
