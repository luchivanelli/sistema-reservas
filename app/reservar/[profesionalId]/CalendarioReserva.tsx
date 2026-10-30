"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, CircleAlert, Clock, LoaderCircle, MapPin, Pencil, Sun, Sunset,
} from "lucide-react";
import { crearTurno, obtenerTurnosOcupados } from "@/actions/turnos";
import type { ProfesionalDTO } from "@/actions/profesionales";
import { DIAS_CORTOS, MESES, SLOTS, fechaConSlot, fechaLarga, inicioDeDia, mismaFecha } from "@/lib/fechas";
import { claseTono } from "@/lib/especialidades";
import { esEmailValido } from "@/lib/texto";
import { useToast } from "@/components/ui/Toast";
import Avatar from "@/components/Avatar";

const PASOS = ["Fecha y hora", "Tus datos", "Confirmación"];
const STORAGE_PACIENTE = "medcare:paciente";
const STORAGE_EMAIL = "medcare:email";

/** Hora actual en ms. Se usa solo en inicializadores y handlers, nunca durante el render. */
const tiempoActual = () => Date.now();

type Props = {
  profesional: ProfesionalDTO;
  ocupadosIniciales: string[];
  cubiertoHasta: string;
};

export default function CalendarioReserva({ profesional, ocupadosIniciales, cubiertoHasta }: Props) {
  const router = useRouter();
  const toast = useToast();
  // Instante de referencia: se fija al montar y se refresca en cada interacción.
  const [ahora, setAhora] = useState(() => tiempoActual());
  const [hoy] = useState(() => inicioDeDia(new Date()));

  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [dia, setDia] = useState<Date | null>(null);
  const [slot, setSlot] = useState("");
  const [ocupados, setOcupados] = useState<Set<number>>(() => new Set(ocupadosIniciales.map((s) => new Date(s).getTime())));
  const [cubierto, setCubierto] = useState(() => new Date(cubiertoHasta).getTime());
  const [cargandoMes, startCargaMes] = useTransition();

  const [paso, setPaso] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [errores, setErrores] = useState<{ nombre?: string; email?: string; general?: string }>({});
  const [enviando, startEnvio] = useTransition();

  const slotsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /* ───────── Disponibilidad ───────── */
  const libresEnDia = (d: Date) =>
    SLOTS.filter((s) => {
      const t = fechaConSlot(d, s).getTime();
      return t > ahora && !ocupados.has(t);
    });

  const asegurarCobertura = (nuevoAnio: number, nuevoMes: number) => {
    const finMes = new Date(nuevoAnio, nuevoMes + 1, 0, 23, 59, 59, 999).getTime();
    if (finMes <= cubierto) return;
    const desde = new Date(cubierto);
    const hasta = new Date(finMes);
    startCargaMes(async () => {
      const nuevos = await obtenerTurnosOcupados(profesional.id, desde, hasta);
      setOcupados((prev) => {
        const next = new Set(prev);
        for (const iso of nuevos) next.add(new Date(iso).getTime());
        return next;
      });
      setCubierto(finMes);
    });
  };

  const cambiarMes = (delta: 1 | -1) => {
    let m = mes + delta;
    let a = anio;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMes(m);
    setAnio(a);
    setAhora(tiempoActual());
    if (dia && (dia.getMonth() !== m || dia.getFullYear() !== a)) {
      setDia(null);
      setSlot("");
    }
    asegurarCobertura(a, m);
  };

  const esMesActual = anio === hoy.getFullYear() && mes === hoy.getMonth();

  /* ───────── Celdas del calendario ───────── */
  const celdas = useMemo(() => {
    const primerDia = new Date(anio, mes, 1).getDay();
    const offset = primerDia === 0 ? 6 : primerDia - 1;
    const total = new Date(anio, mes + 1, 0).getDate();
    return [...Array<null>(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  }, [anio, mes]);

  const seleccionarDia = (numero: number) => {
    const fecha = new Date(anio, mes, numero);
    setDia(fecha);
    setSlot("");
    setAhora(tiempoActual());
    if (window.innerWidth < 1024) {
      window.setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  };

  const slotsDelDia = dia ? SLOTS.map((s) => {
    const t = fechaConSlot(dia, s).getTime();
    return { s, disponible: t > ahora && !ocupados.has(t) };
  }) : [];
  const manana = slotsDelDia.filter((x) => Number(x.s.split(":")[0]) < 13);
  const tarde = slotsDelDia.filter((x) => Number(x.s.split(":")[0]) >= 13);
  const libresHoy = slotsDelDia.filter((x) => x.disponible).length;

  /* ───────── Pasos ───────── */
  const continuar = () => {
    if (!dia || !slot) return;
    if (!nombre && !email) {
      try {
        const raw = localStorage.getItem(STORAGE_PACIENTE);
        if (raw) {
          const d = JSON.parse(raw) as { nombre?: string; email?: string };
          if (d.nombre) setNombre(d.nombre);
          if (d.email) setEmail(d.email);
        }
      } catch {}
    }
    setPaso(2);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const confirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dia || !slot) return;
    const n = nombre.trim();
    const m = email.trim();
    const nuevos: typeof errores = {};
    if (n.length < 2) nuevos.nombre = "Ingresá tu nombre completo.";
    if (!esEmailValido(m)) nuevos.email = "Ingresá un email válido, por ejemplo nombre@ejemplo.com.";
    setErrores(nuevos);
    if (nuevos.nombre || nuevos.email) return;

    const fecha = fechaConSlot(dia, slot);
    startEnvio(async () => {
      const r = await crearTurno({ profesionalId: profesional.id, fecha, clienteNombre: n, clienteEmail: m });
      if (r.ok) {
        try {
          localStorage.setItem(STORAGE_PACIENTE, JSON.stringify({ nombre: n, email: m }));
          localStorage.setItem(STORAGE_EMAIL, m.toLowerCase());
        } catch {}
        router.push(`/reservar/${profesional.id}/exito?turno=${r.turnoId}`);
        return;
      }
      if (r.codigo === "OCUPADO" || r.codigo === "PASADO") {
        setOcupados((prev) => new Set(prev).add(fecha.getTime()));
        setSlot("");
        setPaso(1);
        toast({ tono: "error", titulo: "Ese horario ya no está disponible", descripcion: "Elegí otro horario para continuar." });
        return;
      }
      setErrores({ general: r.error });
    });
  };

  const fechaTxt = dia ? fechaLarga(dia) : null;
  const listoParaContinuar = Boolean(dia && slot);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
      {/* ───────── Columna principal ───────── */}
      <div className="min-w-0 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/buscar" className="btn btn-ghost btn-sm -ml-2 text-ink-3">
            <ChevronLeft size={15} /> Profesionales
          </Link>
          <Stepper actual={paso} />
        </div>

        {/* Encabezado mobile del profesional */}
        <div className="card flex items-center gap-3 p-4 lg:hidden">
          <Avatar nombre={profesional.nombre} especialidad={profesional.especialidad} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{profesional.nombre}</p>
            <p className="truncate text-xs text-ink-3">{profesional.especialidad} · {profesional.clinica}</p>
          </div>
        </div>

        {paso === 1 ? (
          <>
            {/* Calendario */}
            <section className="panel p-5 sm:p-6 animate-fade-up">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-ink sm:text-xl">Elegí una fecha</h1>
                  <p className="text-xs text-ink-3">Los días con punto verde tienen horarios libres.</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => cambiarMes(-1)} disabled={esMesActual} className="btn btn-outline btn-icon" aria-label="Mes anterior">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="min-w-[120px] text-center text-sm font-semibold text-ink">
                    {MESES[mes]} {anio}
                  </span>
                  <button onClick={() => cambiarMes(1)} className="btn btn-outline btn-icon" aria-label="Mes siguiente">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {DIAS_CORTOS.map((d) => (
                  <div key={d} className="pb-2 text-center text-[11px] font-bold uppercase tracking-wider text-ink-4">{d}</div>
                ))}
                {celdas.map((numero, i) => {
                  if (!numero) return <div key={`v-${i}`} />;
                  const fecha = new Date(anio, mes, numero);
                  const pasado = fecha < hoy;
                  const esHoy = mismaFecha(fecha, hoy);
                  const activo = !!dia && mismaFecha(fecha, dia);
                  const libres = pasado ? 0 : libresEnDia(fecha).length;
                  const completo = !pasado && libres === 0;
                  const deshabilitado = pasado || completo;
                  return (
                    <button
                      key={numero}
                      disabled={deshabilitado}
                      onClick={() => seleccionarDia(numero)}
                      aria-label={`${numero} de ${MESES[mes]}${completo ? ", sin horarios" : ""}`}
                      aria-pressed={activo}
                      className={`cal-day ${activo ? "cal-day-active" : ""} ${esHoy && !activo ? "cal-day-today" : ""} ${pasado ? "cal-day-disabled" : ""} ${completo ? "cal-day-full" : ""}`}
                    >
                      {numero}
                      {!deshabilitado && !activo && <span className="cal-dot bg-emerald-500" aria-hidden />}
                    </button>
                  );
                })}
              </div>

              {cargandoMes && (
                <p className="mt-3 flex items-center gap-2 text-xs text-ink-3">
                  <LoaderCircle size={13} className="animate-spin" /> Actualizando disponibilidad…
                </p>
              )}
            </section>

            {/* Horarios */}
            <section ref={slotsRef} className="panel scroll-mt-20 p-5 sm:p-6 animate-fade-up delay-1">
              {!dia ? (
                <div className="flex items-center gap-3 text-sm text-ink-3">
                  <span className="icon-tile tone-brand h-9 w-9"><Clock size={16} /></span>
                  Seleccioná un día para ver los horarios disponibles.
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-base font-bold text-ink">{fechaTxt}</h2>
                    <span className={`text-xs font-medium ${libresHoy ? "text-emerald-700" : "text-ink-3"}`}>
                      {libresHoy} de {SLOTS.length} horarios libres
                    </span>
                  </div>

                  <GrupoSlots titulo="Mañana" icon={Sun} items={manana} activo={slot} onPick={setSlot} />
                  <GrupoSlots titulo="Tarde" icon={Sunset} items={tarde} activo={slot} onPick={setSlot} className="mt-4" />
                </>
              )}
            </section>
          </>
        ) : (
          /* ───────── Paso 2: datos ───────── */
          <section ref={formRef} className="panel scroll-mt-20 p-5 sm:p-8 animate-fade-up">
            <button onClick={() => setPaso(1)} className="btn btn-ghost btn-sm -ml-2 mb-4 text-ink-3">
              <ChevronLeft size={15} /> Cambiar fecha u horario
            </button>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Tus datos</h1>
            <p className="mt-1 text-sm text-ink-3">Sin registro. Solo necesitamos saber a quién reservarle el turno.</p>

            <form onSubmit={confirmar} noValidate className="mt-6 max-w-md space-y-5">
              <div>
                <label htmlFor="nombre" className="label">Nombre completo</label>
                <input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); if (errores.nombre) setErrores((p) => ({ ...p, nombre: undefined })); }}
                  className={`input ${errores.nombre ? "input-error" : ""}`}
                  placeholder="Juan Pérez"
                  autoComplete="name"
                  autoFocus
                  aria-invalid={!!errores.nombre}
                />
                {errores.nombre && <p className="field-error"><CircleAlert size={13} /> {errores.nombre}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errores.email) setErrores((p) => ({ ...p, email: undefined })); }}
                  className={`input ${errores.email ? "input-error" : ""}`}
                  placeholder="juan@ejemplo.com"
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!errores.email}
                />
                {errores.email
                  ? <p className="field-error"><CircleAlert size={13} /> {errores.email}</p>
                  : <p className="hint">Con este email vas a poder ver y cancelar tus turnos.</p>}
              </div>

              {errores.general && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  <CircleAlert size={16} className="mt-0.5 shrink-0" /> {errores.general}
                </div>
              )}

              <button type="submit" disabled={enviando} className="btn btn-primary btn-lg w-full">
                {enviando ? <><LoaderCircle size={18} className="animate-spin" /> Confirmando…</> : <><Check size={18} /> Confirmar turno</>}
              </button>
            </form>
          </section>
        )}
      </div>

      {/* ───────── Resumen (desktop) ───────── */}
      <aside className="hidden lg:block">
        <div className="panel sticky top-24 p-6">
          <div className="flex items-center gap-3">
            <Avatar nombre={profesional.nombre} especialidad={profesional.especialidad} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{profesional.nombre}</p>
              <span className={`pill mt-1 ${claseTono(profesional.especialidad)}`}>{profesional.especialidad}</span>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-ink-3" />
              <div>
                <dt className="text-xs text-ink-3">Clínica</dt>
                <dd className="font-medium text-ink">{profesional.clinica}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="mt-0.5 shrink-0 text-ink-3" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-ink-3">Fecha y hora</dt>
                {dia && slot ? (
                  <dd className="flex items-center justify-between gap-2 font-medium text-ink">
                    <span>{fechaTxt} · {slot} hs</span>
                    {paso === 2 && (
                      <button onClick={() => setPaso(1)} className="btn btn-ghost btn-icon -my-1 text-ink-3" aria-label="Cambiar fecha u horario">
                        <Pencil size={13} />
                      </button>
                    )}
                  </dd>
                ) : (
                  <dd className="text-ink-4">{dia ? "Elegí un horario" : "Elegí un día"}</dd>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="mt-0.5 shrink-0 text-ink-3" />
              <div>
                <dt className="text-xs text-ink-3">Duración</dt>
                <dd className="font-medium text-ink">30 minutos</dd>
              </div>
            </div>
          </dl>

          {paso === 1 && (
            <button onClick={continuar} disabled={!listoParaContinuar} className="btn btn-primary mt-6 w-full">
              Continuar <ArrowRight size={15} />
            </button>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Confirmación inmediata, sin registro.
          </p>
        </div>
      </aside>

      {/* ───────── Barra inferior (mobile) ───────── */}
      {paso === 1 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 backdrop-blur-md lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="container-x flex items-center justify-between gap-3 px-0">
            <div className="min-w-0 text-sm">
              {dia && slot ? (
                <>
                  <p className="truncate font-semibold text-ink">{fechaTxt}</p>
                  <p className="text-xs text-ink-3">{slot} hs · {profesional.nombre}</p>
                </>
              ) : (
                <p className="text-ink-3">{dia ? "Elegí un horario" : "Elegí un día del calendario"}</p>
              )}
            </div>
            <button onClick={continuar} disabled={!listoParaContinuar} className="btn btn-primary shrink-0">
              Continuar <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ actual }: { actual: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Progreso de la reserva">
      {PASOS.map((nombre, i) => {
        const n = i + 1;
        const estado = n < actual ? "hecho" : n === actual ? "actual" : "pendiente";
        return (
          <li key={nombre} className="flex items-center gap-2">
            <span
              className={`step-dot ${
                estado === "hecho" ? "border-emerald-500 bg-emerald-500 text-white"
                : estado === "actual" ? "border-brand-600 bg-brand-600 text-white"
                : "border-line-2 bg-surface text-ink-4"
              }`}
              aria-current={estado === "actual" ? "step" : undefined}
            >
              {estado === "hecho" ? <Check size={13} /> : n}
            </span>
            <span className={`hidden text-xs font-medium sm:block ${estado === "pendiente" ? "text-ink-4" : "text-ink"}`}>{nombre}</span>
            {i < PASOS.length - 1 && <span className="hidden h-px w-6 bg-line-2 sm:block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function GrupoSlots({
  titulo,
  icon: Icon,
  items,
  activo,
  onPick,
  className = "",
}: {
  titulo: string;
  icon: typeof Sun;
  items: { s: string; disponible: boolean }[];
  activo: string;
  onPick: (s: string) => void;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-3">
        <Icon size={13} /> {titulo}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {items.map(({ s, disponible }) => (
          <button
            key={s}
            disabled={!disponible}
            onClick={() => onPick(s)}
            aria-pressed={activo === s}
            className={`slot ${activo === s ? "slot-active" : ""} ${!disponible ? "slot-taken" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
