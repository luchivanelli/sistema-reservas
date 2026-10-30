"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight, CalendarX, CircleAlert, Clock, History, LoaderCircle, Mail, MapPin, Search, X,
} from "lucide-react";
import { buscarTurnosPorEmail, cancelarTurno, type TurnoConProfesional } from "@/actions/turnos";
import { esEmailValido } from "@/lib/texto";
import { MESES, fechaLarga, hora, relativo } from "@/lib/fechas";
import { claseTono } from "@/lib/especialidades";
import { useToast } from "@/components/ui/Toast";

const STORAGE_EMAIL = "medcare:email";
type Resultado = { proximos: TurnoConProfesional[]; historial: TurnoConProfesional[] };

export default function MisTurnosCliente() {
  const params = useSearchParams();
  const emailParam = params.get("email") ?? "";
  const toast = useToast();

  const [email, setEmail] = useState(emailParam);
  const [emailBuscado, setEmailBuscado] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscando, startBusqueda] = useTransition();
  const [, startCancelacion] = useTransition();
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoBuscado = useRef(false);

  const buscar = (valor: string) => {
    const v = valor.trim();
    if (!esEmailValido(v)) {
      setError("Ingresá un email válido, por ejemplo nombre@ejemplo.com.");
      return;
    }
    setError(null);
    startBusqueda(async () => {
      setEmail(v);
      const r = await buscarTurnosPorEmail(v);
      setResultado(r);
      setEmailBuscado(v);
      setVerHistorial(false);
      try {
        localStorage.setItem(STORAGE_EMAIL, v.toLowerCase());
      } catch {}
    });
  };

  // Búsqueda automática: email en la URL (viene de la confirmación) o recordado del último uso.
  useEffect(() => {
    if (autoBuscado.current) return;
    autoBuscado.current = true;
    let guardado = emailParam;
    if (!guardado) {
      try {
        guardado = localStorage.getItem(STORAGE_EMAIL) ?? "";
      } catch {}
    }
    if (guardado && esEmailValido(guardado)) buscar(guardado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelar = (turno: TurnoConProfesional) => {
    setCancelandoId(turno.id);
    startCancelacion(async () => {
      const r = await cancelarTurno(turno.id);
      if (r.ok) {
        setResultado((prev) =>
          prev
            ? {
                proximos: prev.proximos.filter((t) => t.id !== turno.id),
                historial: [{ ...turno, cancelado: true }, ...prev.historial],
              }
            : prev,
        );
        toast({ tono: "success", titulo: "Turno cancelado", descripcion: `${turno.profesional.nombre} · ${fechaLarga(new Date(turno.fecha))}` });
      } else {
        toast({ tono: "error", titulo: "No se pudo cancelar", descripcion: r.error });
      }
      setCancelandoId(null);
      setConfirmandoId(null);
    });
  };

  const proximos = resultado?.proximos ?? [];
  const historial = resultado?.historial ?? [];

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 text-center animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Mis turnos</h1>
          <p className="mt-2 text-sm text-ink-3 sm:text-base">Ingresá el email que usaste al reservar para ver y gestionar tus turnos.</p>
        </header>

        {/* Buscador */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            buscar(email);
          }}
          noValidate
          className="panel p-3 animate-fade-up delay-1"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className={`flex flex-1 items-center gap-2 rounded-xl border bg-canvas px-3.5 transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 ${error ? "border-red-400" : "border-line-2"}`}>
              <Mail size={16} className="shrink-0 text-ink-3" />
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="tu@email.com"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
                autoComplete="email"
                inputMode="email"
                aria-label="Email"
                aria-invalid={!!error}
              />
            </div>
            <button type="submit" disabled={buscando || !email.trim()} className="btn btn-primary h-11 px-5">
              {buscando ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
              {buscando ? "Buscando…" : "Ver turnos"}
            </button>
          </div>
          {error && <p className="field-error mt-2 px-1"><CircleAlert size={13} /> {error}</p>}
        </form>

        {/* Resultados */}
        {resultado && !buscando && (
          <section className="mt-8 animate-fade-up" aria-live="polite">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink-3">
                <span className="font-semibold text-ink">{proximos.length}</span>{" "}
                {proximos.length === 1 ? "turno próximo" : "turnos próximos"} para{" "}
                <span className="font-medium text-ink-2">{emailBuscado}</span>
              </p>
              <Link href="/buscar" className="btn btn-ghost btn-sm text-brand-600">
                Reservar otro <ArrowRight size={13} />
              </Link>
            </div>

            {proximos.length === 0 ? (
              <div className="card flex flex-col items-center p-10 text-center">
                <span className="icon-tile tone-brand mb-4 h-12 w-12"><CalendarX size={22} /></span>
                <p className="font-semibold text-ink">No tenés turnos próximos</p>
                <p className="mt-1 max-w-xs text-sm text-ink-3">Cuando reserves uno con este email, va a aparecer acá.</p>
                <Link href="/buscar" className="btn btn-primary mt-5">Buscar un médico</Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {proximos.map((t) => (
                  <li key={t.id}>
                    <TurnoItem
                      turno={t}
                      confirmando={confirmandoId === t.id}
                      cancelando={cancelandoId === t.id}
                      onPedirCancelar={() => setConfirmandoId(t.id)}
                      onDesistir={() => setConfirmandoId(null)}
                      onCancelar={() => cancelar(t)}
                    />
                  </li>
                ))}
              </ul>
            )}

            {historial.length > 0 && (
              <div className="mt-8">
                <button onClick={() => setVerHistorial((v) => !v)} className="btn btn-ghost btn-sm -ml-2 text-ink-3" aria-expanded={verHistorial}>
                  <History size={14} /> {verHistorial ? "Ocultar historial" : `Ver historial (${historial.length})`}
                </button>
                {verHistorial && (
                  <ul className="mt-3 space-y-2 animate-fade-in">
                    {historial.map((t) => (
                      <li key={t.id}>
                        <TurnoItem turno={t} historico />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function TurnoItem({
  turno,
  historico = false,
  confirmando = false,
  cancelando = false,
  onPedirCancelar,
  onDesistir,
  onCancelar,
}: {
  turno: TurnoConProfesional;
  historico?: boolean;
  confirmando?: boolean;
  cancelando?: boolean;
  onPedirCancelar?: () => void;
  onDesistir?: () => void;
  onCancelar?: () => void;
}) {
  const f = new Date(turno.fecha);
  const { profesional } = turno;

  return (
    <article className={`card p-4 sm:p-5 ${historico ? "opacity-75" : ""}`}>
      <div className="flex gap-4">
        <div className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${historico ? "bg-canvas text-ink-3" : "bg-brand-50 text-brand-700"}`}>
          <span className="text-2xl font-bold leading-none tabular-nums">{f.getDate()}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">{MESES[f.getMonth()].slice(0, 3)}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">{profesional.nombre}</p>
            {historico ? (
              <span className={`pill ${turno.cancelado ? "tone-red" : "tone-brand"}`}>{turno.cancelado ? "Cancelado" : "Finalizado"}</span>
            ) : (
              <span className="pill tone-emerald">{relativo(f)}</span>
            )}
          </div>
          <div className="mt-1">
            <span className={`pill ${claseTono(profesional.especialidad)}`}>{profesional.especialidad}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {fechaLarga(f)} · {hora(f)} hs</span>
            <span className="flex items-center gap-1.5"><MapPin size={12} /> {profesional.clinica}</span>
          </div>
        </div>
      </div>

      {!historico && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
          {confirmando ? (
            <>
              <span className="mr-auto text-xs text-ink-3">¿Seguro que querés cancelar este turno?</span>
              <button onClick={onDesistir} disabled={cancelando} className="btn btn-ghost btn-sm">Volver</button>
              <button onClick={onCancelar} disabled={cancelando} className="btn btn-danger btn-sm">
                {cancelando ? <LoaderCircle size={13} className="animate-spin" /> : <X size={13} />}
                {cancelando ? "Cancelando…" : "Sí, cancelar"}
              </button>
            </>
          ) : (
            <button onClick={onPedirCancelar} className="btn btn-outline btn-sm text-ink-3 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
              <X size={13} /> Cancelar turno
            </button>
          )}
        </div>
      )}
    </article>
  );
}
