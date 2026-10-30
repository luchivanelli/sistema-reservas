import type { Metadata } from "next";
import { Suspense } from "react";
import MisTurnosCliente from "./MisTurnosCliente";

export const metadata: Metadata = {
  title: "Mis turnos",
  description: "Consultá y cancelá tus turnos con el email que usaste al reservar.",
};

export default function MisTurnosPage() {
  return (
    <Suspense fallback={<div className="container-x py-12"><div className="skeleton mx-auto h-40 max-w-2xl rounded-3xl" /></div>}>
      <MisTurnosCliente />
    </Suspense>
  );
}
