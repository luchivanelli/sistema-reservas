import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import Avatar from "./Avatar";
import { claseTono } from "@/lib/especialidades";
import type { ProfesionalDTO } from "@/actions/profesionales";

export default function ProfesionalCard({
  profesional,
  className = "",
}: {
  profesional: ProfesionalDTO;
  className?: string;
}) {
  const href = `/reservar/${profesional.id}`;
  return (
    <article className={`card card-hover group relative flex flex-col p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3.5">
        <Avatar nombre={profesional.nombre} especialidad={profesional.especialidad} size="md" />
        <div className="min-w-0 flex-1">
          <span className={`pill ${claseTono(profesional.especialidad)}`}>{profesional.especialidad}</span>
          <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-tight text-ink">
            <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              {profesional.nombre}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{profesional.clinica}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <span className="flex items-center gap-1.5 text-xs text-ink-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Turnos disponibles
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition-transform group-hover:translate-x-0.5">
          Reservar <ArrowRight size={14} />
        </span>
      </div>
    </article>
  );
}
