import Link from "next/link";
import { Search, CheckCircle, Clock, Shield, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { obtenerDestacados, obtenerEspecialidades } from "@/actions/profesionales";

function specClass(esp: string) {
  const key = esp.split(" ")[0];
  return `spec-${key}` in {} ? `spec-${key}` : "spec-default";
}

const SPEC_EMOJIS: Record<string, string> = {
  Cardiología: "❤️", Neurología: "🧠", Pediatría: "👶", Dermatología: "✨",
  Ginecología: "🌸", "Clínica Médica": "🩺", Oftalmología: "👁️", Traumatología: "🦴",
  Psiquiatría: "💭", Psicología: "🌿", Otorrinolaringología: "👂", Neumonología: "🫁",
  Oncología: "🎗️", Nutrición: "🥗",
};

export default async function HomePage() {
  const [destacados, especialidades] = await Promise.all([
    obtenerDestacados(),
    obtenerEspecialidades(),
  ]);

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="bg-white border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-20 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-8">
            <div className="badge badge-blue inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--teal)]" />
              Expertos en salud
            </div>

            <div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight tracking-tight text-[var(--navy)] mb-6">
                Tu salud,<br />
                en las <span className="text-[var(--blue)]">mejores manos</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[var(--text-2)]">
                Conectá con profesionales médicos confiables, agendá turnos al instante y accedé a atención segura y personalizada.
              </p>
            </div>

            {/* <div className="grid gap-4 sm:grid-cols-[1.3fr_0.7fr] items-center bg-[var(--bg)] rounded-3xl">
            </div> */}
            <Link href="/buscar" className="btn btn-primary w-full sm:w-1/3 rounded-2xl text-sm justify-center py-3 -mt-6">
              Buscar médico
            </Link>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: CheckCircle, text: "Turnos confirmados al instante" },
                { icon: Clock, text: "Disponibilidad en tiempo real" },
                { icon: Shield, text: "Datos protegidos" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--text-2)] shadow-sm">
                  <Icon size={18} className="text-[var(--teal)]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { val: `${especialidades.length}`, label: "Especialidades", sub: "médicas disponibles" },
              { val: "24/7", label: "Disponibilidad", sub: "todo el año" },
              { val: "100%", label: "Confirmación", sub: "inmediata online" },
              { val: "4", label: "Clínicas", sub: "asociadas" },
            ].map(({ val, label, sub }) => (
              <div key={label} className="card p-6">
                <p className="font-display text-3xl font-bold text-[var(--navy)] mb-1">{val}</p>
                <p className="text-sm font-semibold text-[var(--text-2)]">{label}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESPECIALIDADES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--blue)] mb-2">Especialidades</p>
            <h2 className="font-display text-3xl font-bold text-[var(--navy)]">Encontrá tu especialista</h2>
          </div>
          <Link href="/buscar" className="btn btn-ghost hidden sm:flex">
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {especialidades.slice(0, 8).map(({ especialidad, _count }) => (
            <Link
              key={especialidad}
              href={`/buscar?especialidad=${encodeURIComponent(especialidad)}`}
              className="card p-4 flex items-center gap-3 hover:border-[var(--blue)] hover:shadow-md transition-all group"
            >
              <span className="text-2xl">{SPEC_EMOJIS[especialidad] || "🏥"}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--blue)] transition-colors leading-tight">{especialidad}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{_count.id} profesional{_count.id !== 1 ? "es" : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="bg-white border-t border-[var(--border)] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--blue)] mb-2">Especialistas destacados</p>
              <h2 className="font-display text-3xl font-bold text-[var(--navy)]">
                Profesionales listos<br />
                <span className="italic text-[var(--blue)]">para atenderte</span>
              </h2>
            </div>
            <Link href="/buscar" className="btn btn-ghost">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destacados.map((doc) => {
              if (!doc) return null;
              const specKey = doc.especialidad.split(" ")[0];
              return (
                <article key={doc.id} className="card overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
                  <div className="h-28 sm:h-40 bg-gradient-to-br from-[var(--blue-soft)] to-[var(--blue-mid)] flex items-center justify-center text-3xl md:text-5xl">
                    {SPEC_EMOJIS[doc.especialidad] || "👨‍⚕️"}
                  </div>
                  <div className="p-4">
                    <p className={`spec-pill inline-block spec-${specKey} mb-2`}>{doc.especialidad}</p>
                    <h3 className="font-display text-base font-semibold text-[var(--navy)] leading-tight mb-1">{doc.nombre}</h3>
                    <p className="flex items-center gap-1 text-xs text-[var(--muted)] mb-4">
                      <MapPin size={11} />{doc.clinica}
                    </p>
                    <Link href={`/reservar/${doc.id}`} className="btn btn-secondary w-full text-sm py-2.5">
                      Reservar turno
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
