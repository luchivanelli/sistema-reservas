"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, SlidersHorizontal } from "lucide-react";

type Profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  clinica: string;
};

type Especialidad = { especialidad: string; count: number };

const SPEC_EMOJIS: Record<string, string> = {
  Cardiología: "❤️", Neurología: "🧠", Pediatría: "👶", Dermatología: "✨",
  Ginecología: "🌸", "Clínica Médica": "🩺", Oftalmología: "👁️", Traumatología: "🦴",
  Psiquiatría: "💭", Psicología: "🌿", Otorrinolaringología: "👂", Neumonología: "🫁",
  Oncología: "🎗️", Nutrición: "🥗",
};

export default function BuscarCliente({
  profesionales,
  especialidades,
  filtroActual,
  busquedaActual,
}: {
  profesionales: Profesional[];
  especialidades: Especialidad[];
  filtroActual: string;
  busquedaActual: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(busquedaActual);

  const aplicarFiltro = (esp: string) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (esp) params.set("especialidad", esp);
      if (busqueda) params.set("busqueda", busqueda);
      router.push(`/buscar?${params.toString()}`);
    });
  };

  const aplicarBusqueda = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (filtroActual) params.set("especialidad", filtroActual);
      if (busqueda) params.set("busqueda", busqueda);
      router.push(`/buscar?${params.toString()}`);
    });
  };

  const limpiar = () => {
    setBusqueda("");
    startTransition(() => router.push("/buscar"));
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-[var(--navy)] mb-2">
          Encontrá el médico ideal
        </h1>
        <p className="max-w-2xl text-[var(--muted)] text-base leading-7">
          Buscá por nombre, especialidad o clínica y accedé a profesionales que te brindan atención rápida y confiable.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_180px] mb-8">
        <div className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm focus-within:border-[var(--blue)] focus-within:ring-2 focus-within:ring-[rgba(27,95,204,0.12)] transition-all">
          <Search size={18} className="text-[var(--muted)] shrink-0" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aplicarBusqueda()}
            placeholder="Nombre, especialidad o clínica..."
            className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          />
          {busqueda && (
            <button onClick={limpiar} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={aplicarBusqueda}
          disabled={isPending}
          className="btn btn-primary rounded-2xl w-full h-full"
        >
          {isPending ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <aside className="hidden xl:block xl:w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-[var(--muted)]" />
              <p className="text-sm font-semibold text-[var(--text)]">Especialidad</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => aplicarFiltro("")}
                className={`w-full cursor-pointer text-left px-4 py-2 rounded-2xl text-sm transition-colors ${
                  !filtroActual
                    ? "bg-[var(--blue-soft)] text-[var(--blue)] font-medium"
                    : "text-[var(--text-2)] hover:bg-[var(--bg)]"
                }`}
              >
                Todas
              </button>
              {especialidades.map(({ especialidad, count }) => (
                <button
                  key={especialidad}
                  onClick={() => aplicarFiltro(especialidad)}
                  className={`w-full cursor-pointer text-left px-4 py-2 rounded-2xl text-sm transition-colors flex items-center justify-between ${
                    filtroActual === especialidad
                      ? "bg-[var(--blue-soft)] text-[var(--blue)] font-medium"
                      : "text-[var(--text-2)] hover:bg-[var(--bg)]"
                  }`}
                >
                  <span>{especialidad}</span>
                  <span className={`text-xs ${filtroActual === especialidad ? "text-[var(--blue)]" : "text-[var(--muted)]"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-5 xl:hidden">
            {especialidades.map(({ especialidad }) => (
              <button
                key={especialidad}
                onClick={() => aplicarFiltro(filtroActual === especialidad ? "" : especialidad)}
                className={`text-xs cursor-pointer px-3 py-1.5 rounded-full border transition-colors ${
                  filtroActual === especialidad
                    ? "bg-[var(--blue)] text-white border-[var(--blue)]"
                    : "bg-white text-[var(--text-2)] border-[var(--border)]"
                }`}
              >
                {especialidad}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--text)]">{profesionales.length}</span>{" "}
              {filtroActual ? `profesional${profesionales.length !== 1 ? "es" : ""} en ${filtroActual}` : "profesionales encontrados"}
            </p>
            {(filtroActual || busquedaActual) && (
              <button onClick={limpiar} className="text-xs text-[var(--blue)] hover:underline flex items-center gap-1">
                <X size={11} /> Limpiar filtros
              </button>
            )}
          </div>

          {profesionales.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-semibold text-[var(--navy)] mb-1">Sin resultados</p>
              <p className="text-sm text-[var(--muted)]">Probá con otra especialidad o nombre.</p>
            </div>
          ) : (
            <div className="grid gap-2 md:gap-4 grid-cols-2 xl:grid-cols-3">
              {profesionales.map((prof) => {
                const specKey = prof.especialidad.split(" ")[0];
                return (
                  <article key={prof.id} className="card p-3 md:p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="hidden md:flex w-14 h-14 rounded-3xl bg-gradient-to-br from-[var(--blue-soft)] to-[var(--blue-mid)] items-center justify-center text-2xl shrink-0">
                        {SPEC_EMOJIS[prof.especialidad] || "👨‍⚕️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`spec-pill spec-${specKey} mb-2`}>{prof.especialidad}</p>
                        <h3 className="font-display text-base font-semibold text-[var(--navy)] leading-tight">{prof.nombre}</h3>
                      </div>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-4">
                      <MapPin size={11} className="shrink-0" />
                      {prof.clinica}
                    </p>

                    <Link href={`/reservar/${prof.id}`} className="btn btn-primary w-full !text-xs !px-1">
                      Reservar turno
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
