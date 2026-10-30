"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CornerDownLeft, LoaderCircle, Search, Users, X, type LucideIcon } from "lucide-react";
import { obtenerProfesionales, type ProfesionalDTO } from "@/actions/profesionales";
import { especialidadMeta, claseTono } from "@/lib/especialidades";
import { normalizarTexto } from "@/lib/texto";
import Avatar from "./Avatar";

// Caché en memoria: se carga una sola vez por sesión, sin importar cuántas veces se abra la paleta.
let cacheProfesionales: Promise<ProfesionalDTO[]> | null = null;
function cargarProfesionales() {
  if (!cacheProfesionales) {
    cacheProfesionales = obtenerProfesionales().catch((e) => {
      cacheProfesionales = null;
      throw e;
    });
  }
  return cacheProfesionales;
}

type Item =
  | { tipo: "accion"; key: string; titulo: string; subtitulo: string; href: string; icon: LucideIcon }
  | { tipo: "especialidad"; key: string; titulo: string; subtitulo: string; href: string; especialidad: string }
  | { tipo: "profesional"; key: string; titulo: string; subtitulo: string; href: string; profesional: ProfesionalDTO };

const ACCIONES: Item[] = [
  { tipo: "accion", key: "a-buscar", titulo: "Ver todos los profesionales", subtitulo: "Explorar por especialidad o clínica", href: "/buscar", icon: Users },
  { tipo: "accion", key: "a-turnos", titulo: "Mis turnos", subtitulo: "Ver o cancelar reservas", href: "/mis-turnos", icon: CalendarCheck },
];

/** Se monta solo mientras está abierta: el estado se reinicia en cada apertura. */
export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [profesionales, setProfesionales] = useState<ProfesionalDTO[] | null>(null);
  const [activo, setActivo] = useState(0);
  const cargando = profesionales === null;

  useEffect(() => {
    let vivo = true;
    cargarProfesionales()
      .then((p) => {
        if (vivo) setProfesionales(p);
      })
      .catch(() => {
        if (vivo) setProfesionales([]);
      });
    return () => {
      vivo = false;
    };
  }, []);

  // Foco y bloqueo de scroll mientras está abierta
  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  const especialidades = useMemo(() => {
    if (!profesionales) return [] as { nombre: string; count: number }[];
    const mapa = new Map<string, number>();
    for (const p of profesionales) mapa.set(p.especialidad, (mapa.get(p.especialidad) ?? 0) + 1);
    return [...mapa.entries()].map(([nombre, count]) => ({ nombre, count })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [profesionales]);

  const items = useMemo<Item[]>(() => {
    const q = normalizarTexto(query);
    const esp: Item[] = especialidades
      .filter((e) => !q || normalizarTexto(e.nombre).includes(q))
      .slice(0, q ? 4 : 14)
      .map((e) => ({
        tipo: "especialidad",
        key: `e-${e.nombre}`,
        titulo: e.nombre,
        subtitulo: `${e.count} ${e.count === 1 ? "profesional" : "profesionales"}`,
        href: `/buscar?especialidad=${encodeURIComponent(e.nombre)}`,
        especialidad: e.nombre,
      }));

    if (!q) return [...ACCIONES, ...esp];

    const profs: Item[] = (profesionales ?? [])
      .filter((p) => normalizarTexto(p.nombre).includes(q) || normalizarTexto(p.clinica).includes(q) || normalizarTexto(p.especialidad).includes(q))
      .slice(0, 8)
      .map((p) => ({
        tipo: "profesional",
        key: `p-${p.id}`,
        titulo: p.nombre,
        subtitulo: `${p.especialidad} · ${p.clinica}`,
        href: `/reservar/${p.id}`,
        profesional: p,
      }));

    const acciones = ACCIONES.filter((a) => normalizarTexto(a.titulo).includes(q));
    return [...profs, ...esp, ...acciones];
  }, [query, especialidades, profesionales]);

  const indiceActivo = Math.min(activo, Math.max(items.length - 1, 0));

  // Prefetch del ítem resaltado para que la navegación sea instantánea
  useEffect(() => {
    const item = items[indiceActivo];
    if (item && item.tipo === "profesional") router.prefetch(item.href);
  }, [indiceActivo, items, router]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${indiceActivo}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [indiceActivo]);

  const ir = (item: Item) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo(Math.min(indiceActivo + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo(Math.max(indiceActivo - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[indiceActivo];
      if (item) ir(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]" role="dialog" aria-modal="true" aria-label="Búsqueda rápida">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-float animate-scale-in" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          {cargando ? <LoaderCircle size={18} className="animate-spin text-ink-3" /> : <Search size={18} className="text-ink-3" />}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActivo(0);
            }}
            placeholder="Buscar médico, especialidad o clínica…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
            autoComplete="off"
            spellCheck={false}
          />
          <button onClick={onClose} className="btn btn-ghost btn-icon text-ink-3" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && !cargando && (
            <p className="px-3 py-10 text-center text-sm text-ink-3">Sin resultados para “{query}”.</p>
          )}
          {items.length === 0 && cargando && (
            <p className="px-3 py-10 text-center text-sm text-ink-3">Cargando…</p>
          )}

          {items.map((item, i) => {
            const esActivo = i === indiceActivo;
            const encabezado =
              (item.tipo === "profesional" && (i === 0 || items[i - 1].tipo !== "profesional") && "Profesionales") ||
              (item.tipo === "especialidad" && (i === 0 || items[i - 1].tipo !== "especialidad") && "Especialidades") ||
              (item.tipo === "accion" && (i === 0 || items[i - 1].tipo !== "accion") && "Accesos rápidos") ||
              null;

            return (
              <div key={item.key}>
                {encabezado && <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">{encabezado}</p>}
                <button
                  data-index={i}
                  onMouseEnter={() => setActivo(i)}
                  onClick={() => ir(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${esActivo ? "bg-brand-50" : "hover:bg-canvas"}`}
                >
                  {item.tipo === "profesional" && <Avatar nombre={item.profesional.nombre} especialidad={item.profesional.especialidad} size="sm" />}
                  {item.tipo === "especialidad" && <IconoEspecialidad nombre={item.especialidad} />}
                  {item.tipo === "accion" && (
                    <span className="icon-tile tone-brand h-9 w-9">
                      <item.icon size={16} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${esActivo ? "text-brand-700" : "text-ink"}`}>{item.titulo}</span>
                    <span className="block truncate text-xs text-ink-3">{item.subtitulo}</span>
                  </span>
                  {esActivo && <CornerDownLeft size={14} className="shrink-0 text-brand-500" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-ink-3 sm:flex">
          <span className="flex items-center gap-1"><span className="kbd">↑</span><span className="kbd">↓</span> navegar</span>
          <span className="flex items-center gap-1"><span className="kbd">↵</span> abrir</span>
          <span className="flex items-center gap-1"><span className="kbd">esc</span> cerrar</span>
        </div>
      </div>
    </div>
  );
}

function IconoEspecialidad({ nombre }: { nombre: string }) {
  const Icon = especialidadMeta(nombre).icon;
  return (
    <span className={`icon-tile h-9 w-9 ${claseTono(nombre)}`}>
      <Icon size={16} />
    </span>
  );
}
