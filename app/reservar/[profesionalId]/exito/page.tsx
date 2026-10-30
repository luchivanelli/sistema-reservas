import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, CalendarPlus, Check, CircleAlert, Clock, Mail, MapPin } from "lucide-react";
import { obtenerTurnoPorId } from "@/actions/turnos";
import { APP_TZ, fechaLarga, hora, urlGoogleCalendar } from "@/lib/fechas";
import { claseTono } from "@/lib/especialidades";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Turno confirmado" };

export default async function ExitoPage({
  params,
  searchParams,
}: {
  params: Promise<{ profesionalId: string }>;
  searchParams: Promise<{ turno?: string }>;
}) {
  const [{ profesionalId }, { turno: turnoId }] = await Promise.all([params, searchParams]);
  const turno = turnoId ? await obtenerTurnoPorId(turnoId) : null;

  if (!turno) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <span className="icon-tile tone-amber mb-5 h-14 w-14 rounded-2xl"><CircleAlert size={26} /></span>
        <h1 className="text-2xl font-bold tracking-tight text-ink">No encontramos ese turno</h1>
        <p className="mt-2 max-w-md text-sm text-ink-3">Si ya reservaste, podés verlo desde “Mis turnos” con tu email.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/mis-turnos" className="btn btn-primary">Mis turnos</Link>
          <Link href={`/reservar/${profesionalId}`} className="btn btn-outline">Reservar de nuevo</Link>
        </div>
      </div>
    );
  }

  const { profesional } = turno;
  const fechaTxt = fechaLarga(turno.fecha, APP_TZ);
  const horaTxt = hora(turno.fecha, APP_TZ);
  const gcal = urlGoogleCalendar({
    titulo: `Turno con ${profesional.nombre}`,
    inicio: turno.fecha,
    detalles: `${profesional.especialidad} · Reservado en MedCare`,
    ubicacion: profesional.clinica,
  });

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="text-center animate-fade-up">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)]">
            <Check size={30} strokeWidth={3} />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">
            {turno.cancelado ? "Este turno fue cancelado" : "¡Turno confirmado!"}
          </h1>
          <p className="mt-2 text-ink-3">
            {turno.cancelado ? (
              <>Podés reservar uno nuevo cuando quieras.</>
            ) : (
              <>Listo, <span className="font-semibold text-ink">{turno.clienteNombre}</span>. Te esperamos.</>
            )}
          </p>
        </div>

        <div className="panel mt-8 overflow-hidden animate-fade-up delay-1">
          <div className="flex items-center gap-3 border-b border-line bg-canvas/60 p-5">
            <Avatar nombre={profesional.nombre} especialidad={profesional.especialidad} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{profesional.nombre}</p>
              <span className={`pill mt-1 ${claseTono(profesional.especialidad)}`}>{profesional.especialidad}</span>
            </div>
          </div>

          <dl className="grid gap-4 p-5 sm:grid-cols-2">
            <Dato icon={Calendar} label="Fecha" valor={fechaTxt} />
            <Dato icon={Clock} label="Hora" valor={`${horaTxt} hs · 30 min`} />
            <Dato icon={MapPin} label="Clínica" valor={profesional.clinica} />
            <Dato icon={Mail} label="Email" valor={turno.clienteEmail} />
          </dl>

          {!turno.cancelado && (
            <div className="border-t border-line p-5">
              <a href={gcal} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                <CalendarPlus size={16} /> Agregar a Google Calendar
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 animate-fade-up delay-2">
          <Link href={`/mis-turnos?email=${encodeURIComponent(turno.clienteEmail)}`} className="btn btn-primary btn-lg">
            Ver mis turnos <ArrowRight size={16} />
          </Link>
          <Link href="/buscar" className="btn btn-secondary btn-lg">
            Reservar otro turno
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-ink-3">
          Guardá este email: lo vas a necesitar para consultar o cancelar el turno.
        </p>
      </div>
    </div>
  );
}

function Dato({ icon: Icon, label, valor }: { icon: typeof Calendar; label: string; valor: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="icon-tile tone-brand h-9 w-9"><Icon size={15} /></span>
      <div className="min-w-0">
        <dt className="text-xs text-ink-3">{label}</dt>
        <dd className="truncate text-sm font-semibold text-ink">{valor}</dd>
      </div>
    </div>
  );
}
