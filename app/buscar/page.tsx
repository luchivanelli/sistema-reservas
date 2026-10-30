import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerProfesionales } from "@/actions/profesionales";
import BuscarCliente from "./BuscarCliente";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Buscar médicos",
  description: "Filtrá profesionales por especialidad, clínica o nombre y reservá tu turno.",
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string; busqueda?: string; clinica?: string }>;
}) {
  const [params, profesionales] = await Promise.all([searchParams, obtenerProfesionales()]);

  return (
    <Suspense fallback={<Loading />}>
      <BuscarCliente
        profesionales={profesionales}
        inicial={{
          busqueda: params.busqueda ?? "",
          especialidad: params.especialidad ?? "",
          clinica: params.clinica ?? "",
        }}
      />
    </Suspense>
  );
}
