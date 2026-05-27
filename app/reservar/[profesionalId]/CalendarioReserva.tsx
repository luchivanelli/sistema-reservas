"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle, Calendar } from "lucide-react";
import { obtenerTurnosOcupados, crearTurno } from "@/actions/turnos";

type Profesional = { id: string; nombre: string; especialidad: string; clinica: string };

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS = ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];

const SPEC_EMOJIS: Record<string, string> = {
  Cardiología: "❤️", Neurología: "🧠", Pediatría: "👶", Dermatología: "✨",
  Ginecología: "🌸", "Clínica Médica": "🩺", Oftalmología: "👁️", Traumatología: "🦴",
  Psiquiatría: "💭", Psicología: "🌿", Otorrinolaringología: "👂", Neumonología: "🫁",
  Oncología: "🎗️", Nutrición: "🥗",
};

export default function CalendarioReserva({ profesional }: { profesional: Profesional }) {
  const router = useRouter();
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [anio, setAnio] = useState(today.getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [slotSeleccionado, setSlotSeleccionado] = useState("");
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [paso, setPaso] = useState<"calendario" | "datos">("calendario");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const slotsRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLDivElement>(null);

  // Build calendar cells
  const primerDia = new Date(anio, mes, 1).getDay();
  const offset = primerDia === 0 ? 6 : primerDia - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const celdas: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];
  const diaSeleccionado = fechaSeleccionada ? fechaSeleccionada.getDate() : null;

  useEffect(() => {
    if (!fechaSeleccionada) return;
    const fechaActualizada = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate());
    const fechaHoy = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (
      fechaSeleccionada.getMonth() !== mes ||
      fechaSeleccionada.getFullYear() !== anio ||
      fechaActualizada < fechaHoy
    ) {
      setFechaSeleccionada(null);
      setSlotSeleccionado("");
      setOcupados([]);
    }
  }, [mes, anio, fechaSeleccionada, today]);

  const seleccionarDia = (dia: number) => {
    const fecha = new Date(anio, mes, dia);
    setFechaSeleccionada(fecha);
    setSlotSeleccionado("");
    startTransition(async () => {
      const ocu = await obtenerTurnosOcupados(profesional.id, fecha);
      setOcupados(ocu);
      // Scroll a los horarios después de cargar
      setTimeout(() => {
        slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  };

  const slotOcupado = (slot: string) => {
    if (!fechaSeleccionada) return false;
    const [h, m] = slot.split(":").map(Number);
    const fecha = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate(), h, m);
    return ocupados.includes(fecha.toISOString());
  };

  const fechaAhora = new Date();
  const esHoySeleccionado = !!fechaSeleccionada &&
    fechaSeleccionada.getFullYear() === fechaAhora.getFullYear() &&
    fechaSeleccionada.getMonth() === fechaAhora.getMonth() &&
    fechaSeleccionada.getDate() === fechaAhora.getDate();

  const slotYaPasado = (slot: string) => {
    if (!fechaSeleccionada || !esHoySeleccionado) return false;
    const [h, m] = slot.split(":").map(Number);
    const fecha = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate(), h, m);
    return fecha < fechaAhora;
  };

  const confirmarTurno = () => {
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio);

    if (!nombreLimpio || !emailLimpio) {
      setError("Por favor completá el nombre y el email.");
      return;
    }

    if (!emailValido) {
      setError("El email no es válido. Usá un formato como nombre@ejemplo.com.");
      return;
    }

    if (!fechaSeleccionada || !slotSeleccionado) return;
    const [h, m] = slotSeleccionado.split(":").map(Number);
    const fecha = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate(), h, m);

    if (fecha < new Date()) {
      setError("El turno seleccionado ya pasó.");
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await crearTurno({
        profesionalId: profesional.id,
        fecha,
        clienteNombre: nombreLimpio,
        clienteEmail: emailLimpio,
      });
      if (result.ok) {
        router.push(
          `/reservar/${profesional.id}/exito?nombre=${encodeURIComponent(nombre)}&fecha=${encodeURIComponent(
            fechaSeleccionada.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
          )}&hora=${encodeURIComponent(slotSeleccionado)}&clinica=${encodeURIComponent(profesional.clinica)}&profesional=${encodeURIComponent(profesional.nombre)}&especialidad=${encodeURIComponent(profesional.especialidad)}`
        );
      } else {
        setError(result.error || "No se pudo crear el turno.");
      }
    });
  };

  const fechaTexto = fechaSeleccionada
    ? fechaSeleccionada.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    : "";

  const specKey = profesional.especialidad.split(" ")[0];

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8">
      {/* LEFT — Doctor info */}
      <aside>
        <div className="card-lg p-6 sticky top-24">
          <Link href="/buscar" className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] mb-5 transition-colors">
            <ChevronLeft size={14} /> Volver
          </Link>

          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--blue-soft)] to-[var(--blue-mid)] flex items-center justify-center text-4xl mx-auto mb-4">
              {SPEC_EMOJIS[profesional.especialidad] || "👨‍⚕️"}
            </div>
            <h2 className="font-display text-xl font-bold text-[var(--navy)]">{profesional.nombre}</h2>
            <p className={`spec-pill spec-${specKey} mt-2`}>{profesional.especialidad}</p>
          </div>

          <div className="border-t border-[var(--border)] pt-5 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-[var(--muted)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{profesional.clinica}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={14} className="text-[var(--teal)] shrink-0" />
              <p className="text-sm text-[var(--text-2)]">Confirmación inmediata</p>
            </div>
          </div>

          {/* Selected summary */}
          {diaSeleccionado && slotSeleccionado && (
            <div className="mt-5 p-3 rounded-xl bg-[var(--blue-soft)] border border-[var(--blue-mid)]">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={13} className="text-[var(--blue)]" />
                <p className="text-xs font-semibold text-[var(--blue)]">Turno seleccionado</p>
              </div>
              <p className="text-sm font-semibold text-[var(--navy)] capitalize">{fechaTexto}</p>
              <p className="text-sm text-[var(--text-2)]">{slotSeleccionado} hs</p>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT */}
      <div className="space-y-5">
        {paso === "calendario" ? (
          <>
            {/* Calendar */}
            <div className="card-lg p-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="font-display mb-4 text-xl font-bold text-[var(--navy)]">Seleccioná una fecha</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a - 1); } else setMes(m => m - 1); }}
                    className="btn btn-ghost p-2 rounded-lg"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-sm font-semibold text-[var(--text)] min-w-[130px] text-center">
                    {MESES[mes]} {anio}
                  </span>
                  <button
                    onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a + 1); } else setMes(m => m + 1); }}
                    className="btn btn-ghost p-2 rounded-lg"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-3">
                {DIAS.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-[var(--muted)] py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {celdas.map((dia, i) => {
                  if (!dia) return <div key={i} />;
                  const fechaActual = new Date(anio, mes, dia);
                  const esPasado = fechaActual < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const esHoy = dia === today.getDate() && mes === today.getMonth() && anio === today.getFullYear();
                  const esSeleccionado = !!fechaSeleccionada && fechaSeleccionada.getDate() === dia && fechaSeleccionada.getMonth() === mes && fechaSeleccionada.getFullYear() === anio;
                  return (
                    <button
                      key={i}
                      disabled={esPasado}
                      onClick={() => seleccionarDia(dia)}
                      className={`cal-day mx-auto
                        ${esPasado ? "cal-disabled" : ""}
                        ${esSeleccionado ? "cal-active" : ""}
                        ${esHoy && !esSeleccionado ? "cal-today" : ""}
                      `}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots */}
            {diaSeleccionado && (
              <div className="card-lg p-6" ref={slotsRef}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={15} className="text-[var(--muted)]" />
                  <h3 className="font-semibold text-[var(--text)]">Horarios disponibles</h3>
                  {isPending && <span className="text-xs text-[var(--muted)]">Cargando...</span>}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {SLOTS.map((slot) => {
                    const ocu = slotOcupado(slot);
                    const pasado = slotYaPasado(slot);
                    const activo = slotSeleccionado === slot;
                    return (
                      <button
                        key={slot}
                        disabled={ocu || pasado}
                        onClick={() => {
                          setSlotSeleccionado(slot);
                          // Scroll al botón de continuar después de seleccionar
                          setTimeout(() => {
                            continueRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                          }, 50);
                        }}
                        className={`slot-btn ${ocu || pasado ? "slot-taken" : ""} ${activo ? "slot-active" : ""}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {diaSeleccionado && slotSeleccionado && (
              <div className="flex justify-end" ref={continueRef}>
                <button onClick={() => setPaso("datos")} className="btn btn-primary px-8">
                  Continuar →
                </button>
              </div>
            )}
          </>
        ) : (
          /* PASO 2 — Datos del paciente */
          <div className="card-lg p-8">
            <button
              onClick={() => setPaso("calendario")}
              className="cursor-pointer flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] mb-6 transition-colors"
            >
              <ChevronLeft size={14} /> Volver al calendario
            </button>

            <h2 className="font-display sm:text-center text-2xl font-bold text-[var(--navy)] mb-1">Tus datos</h2>
            <p className="text-sm sm:text-center text-[var(--muted)] mb-7">Completá tu información para confirmar el turno.</p>

            <div className="space-y-5 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-2)] mb-1.5">Nombre completo</label>
                <input
                  value={nombre}
                  onChange={e => {
                    setNombre(e.target.value);
                    if (error) setError("");
                  }}
                  className="input"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-2)] mb-1.5">Email</label>
                <input
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  type="email"
                  className="input"
                  placeholder="juan@ejemplo.com"
                />
                <p className="text-xs text-[var(--muted)] mt-1">Usarás este email para ver y cancelar tus turnos.</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
              )}

              <button
                onClick={confirmarTurno}
                disabled={!nombre.trim() || !email.trim() || isPending}
                className="btn btn-primary w-full py-3.5 text-base"
              >
                {isPending ? "Confirmando..." : "Confirmar turno"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
