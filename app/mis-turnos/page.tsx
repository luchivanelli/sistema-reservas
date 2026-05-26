"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Search, Calendar, Clock, MapPin, X, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buscarTurnosPorEmail, cancelarTurno } from "@/actions/turnos";

type Turno = {
  id: string;
  fecha: Date;
  cancelado: boolean;
  profesional: { nombre: string; especialidad: string; clinica: string };
};

export default function MisTurnosPage() {
  const [email, setEmail] = useState("");
  const [turnos, setTurnos] = useState<Turno[] | null>(null);
  const [buscado, setBuscado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelandoId, setCanceladoId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const buscar = () => {
    if (!email.trim()) return;
    if (!isValidEmail(email)) {
      setError("Ingresá un email con formato válido");
      setBuscado(false);
      setTurnos(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      const resultado = await buscarTurnosPorEmail(email);
      setTurnos(resultado as Turno[]);
      setBuscado(true);
    });
  };

  const cancelar = (id: string) => {
    setCanceladoId(id);
    startTransition(async () => {
      const result = await cancelarTurno(id);
      if (!result.ok) {
        setError(result.error || "No se pudo cancelar el turno.");
      } else {
        setTurnos(prev => prev ? prev.filter(t => t.id !== id) : prev);
      }
      setCanceladoId(null);
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <section className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--blue-soft)]">
            <Calendar size={24} className="text-[var(--blue)]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--navy)] mb-2">Mis turnos</h1>
          <p className="max-w-xl mx-auto text-[var(--muted)]">Ingresá tu email para ver y gestionar tus reservas activas en una sola pantalla.</p>
        </section>

        <section className="card-lg p-6">
          <div className="grid gap-4 sm:grid-cols-[1.25fr_0.75fr] items-center">
            <div className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 focus-within-within:border-[var(--blue)]">
              <Mail size={16} className="text-[var(--muted)]" />
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError(null); }}
                onKeyDown={e => e.key === "Enter" && buscar()}
                type="email"
                placeholder="tu@email.com"
                className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <button
              onClick={buscar}
              disabled={!email.trim() || isPending}
              className="btn btn-primary gap-2 px-5 py-3 w-full"
            >
              <Search size={14} />
              {isPending ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {error && (
            <p className="mt-6 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          )}
        </section>

        {buscado && turnos !== null && (
          <section className="space-y-4">
            {turnos.length === 0 ? (
              <div className="card p-10 text-center">
                <AlertCircle size={32} className="text-[var(--muted)] mx-auto mb-4" />
                <p className="font-semibold text-[var(--navy)] mb-2">Sin turnos activos</p>
                <p className="text-sm text-[var(--muted)] mb-5">No hay reservas futuras para este email.</p>
                <Link href="/buscar" className="btn btn-primary px-6 py-3">
                  Buscar un médico
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-semibold text-[var(--text)]">{turnos.length}</span>{" "}
                    turno{turnos.length !== 1 ? "s" : ""} activo{turnos.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-[var(--muted)]">Podés cancelar o revisar los detalles desde aquí.</p>
                </div>
                <div className="space-y-4">
                  {turnos.map((turno) => {
                    const fecha = new Date(turno.fecha);
                    const ahora = new Date();
                    const esPasado = fecha <= ahora;
                    const specKey = turno.profesional.especialidad.split(" ")[0];
                    return (
                      <div key={turno.id} className="card p-5 sm:flex sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 sm:gap-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--blue-soft)] text-xl">
                            📅
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-base font-semibold text-[var(--navy)] leading-tight truncate">{turno.profesional.nombre}</p>
                            <p className={`spec-pill spec-${specKey} mt-2 mb-3`}>{turno.profesional.especialidad}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                {turno.profesional.clinica}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => cancelar(turno.id)}
                          disabled={cancelandoId === turno.id || esPasado}
                          className="btn btn-danger shrink-0 gap-1.5 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4"
                        >
                          <X size={13} />
                          {cancelandoId === turno.id ? "Cancelando..." : esPasado ? "Turno vencido" : "Cancelar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
