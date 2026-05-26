import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { obtenerProfesionalPorId } from "@/actions/profesionales";
import CalendarioReserva from "./CalendarioReserva";

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ profesionalId: string }>;
}) {
  const { profesionalId } = await params;
  const profesional = await obtenerProfesionalPorId(profesionalId);
  if (!profesional) notFound();

  return (
    <div className="h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <CalendarioReserva profesional={profesional} />
      </div>
    </div>
  );
}
