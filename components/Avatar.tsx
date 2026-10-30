import { claseTono } from "@/lib/especialidades";
import { iniciales } from "@/lib/texto";

const TAMANOS = {
  sm: "h-9 w-9 text-xs rounded-xl",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg rounded-3xl",
  xl: "h-20 w-20 text-2xl rounded-3xl",
};

export default function Avatar({
  nombre,
  especialidad,
  size = "md",
  className = "",
}: {
  nombre: string;
  especialidad: string;
  size?: keyof typeof TAMANOS;
  className?: string;
}) {
  return (
    <span aria-hidden className={`avatar ${claseTono(especialidad)} ${TAMANOS[size]} ${className}`}>
      {iniciales(nombre)}
    </span>
  );
}
