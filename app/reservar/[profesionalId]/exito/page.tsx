import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const nombre = params.nombre || "Paciente";
  const fecha = params.fecha || "";
  const hora = params.hora || "";
  const clinica = params.clinica || "";
  const profesional = params.profesional || "";
  const especialidad = params.especialidad || "";

  return (
    <div>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-16 text-center">

        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--teal)", boxShadow: "0 12px 32px rgba(14,165,160,0.3)" }}
        >
          <CheckCircle size={36} className="text-white" strokeWidth={2.5} />
        </div>

        <h1 className="font-display text-3xl font-bold text-[var(--navy)] mb-3">¡Reserva exitosa!</h1>
        <p className="text-[var(--muted)] mb-8">
          Hola <span className="font-semibold text-[var(--text)]">{nombre}</span>, tu turno fue confirmado correctamente.
        </p>

        <div className="card-lg p-6 text-left mb-6">
          <h2 className="font-display text-lg font-bold text-[var(--navy)] mb-4">Detalles de la cita</h2>

          <div className="space-y-4">
            {profesional && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center shrink-0">
                  <span className="text-sm">👨‍⚕️</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-0.5">MÉDICO</p>
                  <p className="text-sm font-semibold text-[var(--navy)]">{profesional}</p>
                  {especialidad && <p className="text-xs text-[var(--muted)]">{especialidad}</p>}
                </div>
              </div>
            )}

            {fecha && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-[var(--blue)]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-0.5">FECHA Y HORA</p>
                  <p className="text-sm font-semibold text-[var(--navy)] capitalize">{fecha}</p>
                  {hora && <p className="text-xs text-[var(--muted)]">{hora} hs</p>}
                </div>
              </div>
            )}

            {clinica && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-[var(--blue)]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-0.5">UBICACIÓN</p>
                  <p className="text-sm font-semibold text-[var(--navy)]">{clinica}</p>
                  <p className="text-xs text-[var(--muted)]">Arroyo Seco, Santa Fe</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/mis-turnos" className="btn btn-primary py-3 gap-2">
            <Calendar size={15} />
            Mis turnos
          </Link>
          <Link href="/" className="btn btn-secondary py-3 gap-2">
            <Home size={15} />
            Inicio
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
