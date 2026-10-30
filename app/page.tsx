import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, MapPin, Search, ShieldCheck, Zap } from "lucide-react";
import { obtenerDestacados, obtenerEspecialidades, obtenerResumen } from "@/actions/profesionales";
import { especialidadMeta, claseTono } from "@/lib/especialidades";
import { SLOTS } from "@/lib/fechas";
import HeroSearch from "@/components/HeroSearch";
import ProfesionalCard from "@/components/ProfesionalCard";
import Avatar from "@/components/Avatar";

// La home se sirve estática y se regenera cada 5 minutos para reflejar altas o bajas de profesionales.
export const revalidate = 300;

const PASOS = [
  { icon: Search, titulo: "Buscá", texto: "Filtrá por especialidad, clínica o nombre. Todo se actualiza al instante." },
  { icon: CalendarCheck, titulo: "Elegí fecha y hora", texto: "Mirá la disponibilidad real del profesional y elegí el horario que te sirva." },
  { icon: Zap, titulo: "Confirmá", texto: "Dejá tu nombre y email. El turno queda confirmado en el momento, sin registro." },
];

export default async function HomePage() {
  const [destacados, especialidades, resumen] = await Promise.all([
    obtenerDestacados(4),
    obtenerEspecialidades(),
    obtenerResumen(),
  ]);

  const populares = [...especialidades].sort((a, b) => b.count - a.count).slice(0, 4).map((e) => e.especialidad);
  const preview = destacados[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Turnos con confirmación inmediata
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Tu turno médico,{" "}
              <em className="font-display font-normal italic text-brand-600">sin vueltas.</em>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-2 sm:text-lg">
              Encontrá al profesional indicado, mirá su disponibilidad real y reservá en menos de un minuto.
            </p>

            <div className="mt-8">
              <HeroSearch sugerencias={populares} />
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { valor: resumen.profesionales, label: "Profesionales" },
                { valor: resumen.especialidades, label: "Especialidades" },
                { valor: resumen.clinicas, label: "Clínicas" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-ink-3">{s.label}</dt>
                  <dd className="text-2xl font-bold tracking-tight text-ink">{s.valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Preview de reserva */}
          {preview && (
            <div className="relative mx-auto w-full max-w-sm animate-fade-up delay-2 lg:ml-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-100/70 via-transparent to-emerald-100/60 blur-2xl" aria-hidden />
              <div className="panel relative p-5">
                <div className="flex items-center gap-3">
                  <Avatar nombre={preview.nombre} especialidad={preview.especialidad} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{preview.nombre}</p>
                    <p className="truncate text-xs text-ink-3">{preview.especialidad} · {preview.clinica}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-ink-3">
                  <span className="font-semibold text-ink-2">Horarios disponibles</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> 30 min</span>
                </div>
                <div className="mt-2.5 grid grid-cols-4 gap-2">
                  {SLOTS.slice(0, 8).map((s, i) => (
                    <span key={s} className={`slot pointer-events-none py-2 text-xs ${i === 2 ? "slot-active" : i === 5 ? "slot-taken" : ""}`}>
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">Turno confirmado</p>
                    <p className="text-[11px] text-emerald-700/80">Te llega el detalle por email</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CalendarCheck size={15} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ESPECIALIDADES */}
      <section className="container-x py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Especialidades</p>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">¿Qué necesitás?</h2>
          </div>
          <Link href="/buscar" className="btn btn-outline btn-sm w-fit">
            Ver todos los profesionales <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {especialidades.map(({ especialidad, count }) => {
            const meta = especialidadMeta(especialidad);
            const Icon = meta.icon;
            return (
              <Link
                key={especialidad}
                href={`/buscar?especialidad=${encodeURIComponent(especialidad)}`}
                className="card card-hover group flex items-center gap-3 p-3.5 sm:p-4"
              >
                <span className={`icon-tile h-10 w-10 ${claseTono(especialidad)}`}>
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand-700">{especialidad}</span>
                  <span className="block text-xs text-ink-3">{count} {count === 1 ? "profesional" : "profesionales"}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-line bg-surface py-16 sm:py-20">
        <div className="container-x">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow mb-2">Cómo funciona</p>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Tres pasos, un minuto.</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {PASOS.map((p, i) => (
              <li key={p.titulo} className="relative rounded-3xl border border-line bg-canvas p-6">
                <span className="absolute right-5 top-5 text-4xl font-bold text-line-2/80">0{i + 1}</span>
                <span className="icon-tile tone-brand h-11 w-11">
                  <p.icon size={20} />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-2">{p.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-2">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600" /> Sin registro ni contraseñas</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-emerald-600" /> Disponibilidad en tiempo real</span>
            <span className="flex items-center gap-2"><MapPin size={16} className="text-emerald-600" /> {resumen.clinicas} clínicas asociadas</span>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="container-x py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Profesionales</p>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Listos para atenderte</h2>
          </div>
          <Link href="/buscar" className="btn btn-outline btn-sm w-fit">
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((p) => (
            <ProfesionalCard key={p.id} profesional={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/40 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">¿Ya tenés un turno?</h2>
              <p className="mt-1.5 text-sm text-white/75">Consultalo o cancelalo con el email que usaste al reservar.</p>
            </div>
            <Link href="/mis-turnos" className="btn btn-lg w-fit bg-white text-brand-700 hover:bg-brand-50">
              Ver mis turnos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
