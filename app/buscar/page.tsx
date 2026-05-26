import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { obtenerProfesionales, obtenerEspecialidades } from "@/actions/profesionales";
import BuscarCliente from "./BuscarCliente";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string; busqueda?: string }>;
}) {
  const params = await searchParams;
  const [profesionales, especialidades] = await Promise.all([
    obtenerProfesionales({
      especialidad: params.especialidad,
      busqueda: params.busqueda,
    }),
    obtenerEspecialidades(),
  ]);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Suspense>
          <BuscarCliente
            profesionales={profesionales}
            especialidades={especialidades.map((e) => ({
              especialidad: e.especialidad,
              count: e._count.id,
            }))}
            filtroActual={params.especialidad || ""}
            busquedaActual={params.busqueda || ""}
          />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
