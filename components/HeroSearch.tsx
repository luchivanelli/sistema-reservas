"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";

export default function HeroSearch({ sugerencias }: { sugerencias: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/buscar?busqueda=${encodeURIComponent(v)}` : "/buscar");
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={buscar}
        className="flex items-center gap-2 rounded-2xl border border-line-2 bg-surface p-1.5 pl-4 shadow-card transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10"
      >
        <Search size={18} className="shrink-0 text-ink-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => router.prefetch("/buscar")}
          placeholder="Especialidad, médico o clínica"
          className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
          aria-label="Buscar profesional"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary h-10 rounded-xl px-4 sm:px-5">
          Buscar <ArrowRight size={15} className="hidden sm:block" />
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
        <span className="mr-1">Populares:</span>
        {sugerencias.map((s) => (
          <Link key={s} href={`/buscar?especialidad=${encodeURIComponent(s)}`} className="chip">
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
