import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { obtenerProfesionalPorId } from "@/actions/profesionales";
import { obtenerOcupadosProximos } from "@/actions/turnos";
import CalendarioReserva from "./CalendarioReserva";

const getProfesional = cache((id: string) => obtenerProfesionalPorId(id));

type Props = { params: Promise<{ profesionalId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profesionalId } = await params;
  const profesional = await getProfesional(profesionalId);
  return { title: profesional ? `Reservar con ${profesional.nombre}` : "Profesional no encontrado" };
}

export default async function ReservarPage({ params }: Props) {
  const { profesionalId } = await params;
  const profesional = await getProfesional(profesionalId);
  if (!profesional) notFound();

  // Se precargan ~70 días de disponibilidad para que elegir día y horario sea instantáneo.
  const { ocupados, cubiertoHasta } = await obtenerOcupadosProximos(profesional.id);

  return (
    <div className="container-x py-6 pb-28 sm:py-10 lg:pb-10">
      <CalendarioReserva profesional={profesional} ocupadosIniciales={ocupados} cubiertoHasta={cubiertoHasta} />
    </div>
  );
}
