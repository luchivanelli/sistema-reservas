"use client";

import Link from "next/link";
import { CircleAlert, RotateCcw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <span className="icon-tile tone-red mb-5 h-14 w-14 rounded-2xl">
        <CircleAlert size={26} />
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-ink-3">
        No pudimos cargar esta sección. Probá de nuevo en unos segundos.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary"><RotateCcw size={15} /> Reintentar</button>
        <Link href="/" className="btn btn-outline">Ir al inicio</Link>
      </div>
    </div>
  );
}
