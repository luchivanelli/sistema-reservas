import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <span className="icon-tile tone-brand mb-5 h-14 w-14 rounded-2xl">
        <SearchX size={26} />
      </span>
      <p className="eyebrow mb-2">Error 404</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">No encontramos esta página</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-ink-3">
        Puede que el enlace esté vencido o que el profesional ya no esté disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-outline"><ArrowLeft size={15} /> Volver al inicio</Link>
        <Link href="/buscar" className="btn btn-primary">Buscar médicos</Link>
      </div>
    </div>
  );
}
