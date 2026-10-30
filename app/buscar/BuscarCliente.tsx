"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Funnel, Search, SearchX, X } from "lucide-react";
import type { ProfesionalDTO } from "@/actions/profesionales";
import { especialidadMeta, claseTono } from "@/lib/especialidades";
import { normalizarTexto } from "@/lib/texto";
import ProfesionalCard from "@/components/ProfesionalCard";

type Filtros = { busqueda: string; especialidad: string; clinica: string };
type Orden = "nombre" | "especialidad";

export default function BuscarCliente({ profesionales, inicial }: { profesionales: ProfesionalDTO[]; inicial: Filtros }) {
  const [q, setQ] = useState(inicial.busqueda);
  const [especialidad, setEspecialidad] = useState(inicial.especialidad);
  const [clinica, setClinica] = useState(inicial.clinica);
  const [orden, setOrden] = useState<Orden>("nombre");
  const inputRef = useRef<HTMLInputElement>(null);

  // Listas para los filtros (calculadas una vez sobre el total)
  const especialidades = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of profesionales) mapa.set(p.especialidad, (mapa.get(p.especialidad) ?? 0) + 1);
    return [...mapa.entries()].map(([nombre, count]) => ({ nombre, count })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [profesionales]);

  const clinicas = useMemo(() => [...new Set(profesionales.map((p) => p.clinica))].sort((a, b) => a.localeCompare(b)), [profesionales]);

  // Filtrado instantáneo en el cliente
  const resultados = useMemo(() => {
    const nq = normalizarTexto(q);
    const lista = profesionales.filter((p) => {
      if (especialidad && p.especialidad !== especialidad) return false;
      if (clinica && p.clinica !== clinica) return false;
      if (!nq) return true;
      return normalizarTexto(p.nombre).includes(nq) || normalizarTexto(p.especialidad).includes(nq) || normalizarTexto(p.clinica).includes(nq);
    });
    return lista.sort((a, b) =>
      orden === "especialidad"
        ? a.especialidad.localeCompare(b.especialidad) || a.nombre.localeCompare(b.nombre)
        : a.nombre.localeCompare(b.nombre),
    );
  }, [profesionales, q, especialidad, clinica, orden]);

  // Mantener la URL compartible sin ir al servidor
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("busqueda", q.trim());
    if (especialidad) params.set("especialidad", especialidad);
    if (clinica) params.set("clinica", clinica);
    const qs = params.toString();
    const url = qs ? `/buscar?${qs}` : "/buscar";
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [q, especialidad, clinica]);

  // Atajo "/" para enfocar la búsqueda
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hayFiltros = Boolean(q.trim() || especialidad || clinica);
  const limpiar = () => {
    setQ("");
    setEspecialidad("");
    setClinica("");
  };

  return (
    <div className="container-x py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Encontrá tu médico</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-3 sm:text-base">
          Buscá por nombre, especialidad o clínica. Los resultados se actualizan mientras escribís.
        </p>
      </header>

      {/* Búsqueda */}
      <div className="flex items-center gap-2 rounded-2xl border border-line-2 bg-surface px-4 shadow-card transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
        <Search size={18} className="shrink-0 text-ink-3" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, especialidad o clínica…"
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
          aria-label="Buscar profesional"
          autoComplete="off"
        />
        {q ? (
          <button onClick={() => setQ("")} className="btn btn-ghost btn-icon text-ink-3" aria-label="Borrar búsqueda">
            <X size={16} />
          </button>
        ) : (
          <span className="kbd hidden sm:inline-flex">/</span>
        )}
      </div>

      {/* Chips mobile */}
      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        <button onClick={() => setEspecialidad("")} className={`chip ${!especialidad ? "chip-active" : ""}`}>
          Todas
        </button>
        {especialidades.map((e) => (
          <button
            key={e.nombre}
            onClick={() => setEspecialidad(especialidad === e.nombre ? "" : e.nombre)}
            className={`chip ${especialidad === e.nombre ? "chip-active" : ""}`}
          >
            {e.nombre}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:mt-8 lg:flex-row lg:items-start">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <section>
              <h2 className="mb-2 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-ink-3">
                <Funnel size={13} /> Especialidad
              </h2>
              <div className="space-y-0.5">
                <FiltroItem activo={!especialidad} onClick={() => setEspecialidad("")} label="Todas" count={profesionales.length} />
                {especialidades.map((e) => {
                  const Icon = especialidadMeta(e.nombre).icon;
                  return (
                    <FiltroItem
                      key={e.nombre}
                      activo={especialidad === e.nombre}
                      onClick={() => setEspecialidad(especialidad === e.nombre ? "" : e.nombre)}
                      label={e.nombre}
                      count={e.count}
                      icono={
                        <span className={`icon-tile h-6 w-6 rounded-md ${claseTono(e.nombre)}`}>
                          <Icon size={12} />
                        </span>
                      }
                    />
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-ink-3">
                <Building2 size={13} /> Clínica
              </h2>
              <div className="space-y-0.5">
                <FiltroItem activo={!clinica} onClick={() => setClinica("")} label="Todas" />
                {clinicas.map((c) => (
                  <FiltroItem key={c} activo={clinica === c} onClick={() => setClinica(clinica === c ? "" : c)} label={c} />
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* Resultados */}
        <section className="min-w-0 flex-1" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-3">
              <span className="font-semibold text-ink">{resultados.length}</span>{" "}
              {resultados.length === 1 ? "profesional" : "profesionales"}
              {especialidad && <> en <span className="font-medium text-ink-2">{especialidad}</span></>}
              {clinica && <> · <span className="font-medium text-ink-2">{clinica}</span></>}
            </p>

            <div className="flex items-center gap-2">
              <select
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                className="input h-9 w-auto rounded-lg py-0 pr-8 text-xs lg:hidden"
                aria-label="Filtrar por clínica"
              >
                <option value="">Todas las clínicas</option>
                {clinicas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="input h-9 w-auto rounded-lg py-0 pr-8 text-xs"
                aria-label="Ordenar resultados"
              >
                <option value="nombre">Nombre A–Z</option>
                <option value="especialidad">Especialidad</option>
              </select>
              {hayFiltros && (
                <button onClick={limpiar} className="btn btn-ghost btn-sm text-brand-600">
                  <X size={12} /> Limpiar
                </button>
              )}
            </div>
          </div>

          {resultados.length === 0 ? (
            <div className="card flex flex-col items-center p-12 text-center">
              <span className="icon-tile tone-brand mb-4 h-12 w-12">
                <SearchX size={22} />
              </span>
              <p className="font-semibold text-ink">No encontramos profesionales</p>
              <p className="mt-1 max-w-xs text-sm text-ink-3">Probá con otro nombre o quitá algún filtro.</p>
              <button onClick={limpiar} className="btn btn-secondary mt-5">Limpiar filtros</button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {resultados.map((p) => (
                <ProfesionalCard key={p.id} profesional={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FiltroItem({
  activo,
  onClick,
  label,
  count,
  icono,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icono?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={activo}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
        activo ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-2 hover:bg-surface hover:text-ink"
      }`}
    >
      {icono}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" && (
        <span className={`text-xs tabular-nums ${activo ? "text-brand-600" : "text-ink-4"}`}>{count}</span>
      )}
    </button>
  );
}
