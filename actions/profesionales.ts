"use server";

import { prisma } from "@/lib/prisma";
import { normalizarTexto } from "@/lib/texto";

export type ProfesionalDTO = {
  id: string;
  nombre: string;
  especialidad: string;
  clinica: string;
};

export type EspecialidadConteo = { especialidad: string; count: number };

const seleccion = { id: true, nombre: true, especialidad: true, clinica: true } as const;

export async function obtenerProfesionales(filtros?: {
  especialidad?: string;
  busqueda?: string;
}): Promise<ProfesionalDTO[]> {
  const todos = await prisma.profesional.findMany({
    where: filtros?.especialidad ? { especialidad: filtros.especialidad } : undefined,
    orderBy: { nombre: "asc" },
    select: seleccion,
  });

  if (!filtros?.busqueda?.trim()) return todos;

  const q = normalizarTexto(filtros.busqueda);
  return todos.filter(
    (p) =>
      normalizarTexto(p.nombre).includes(q) ||
      normalizarTexto(p.especialidad).includes(q) ||
      normalizarTexto(p.clinica).includes(q),
  );
}

export async function obtenerProfesionalPorId(id: string): Promise<ProfesionalDTO | null> {
  return prisma.profesional.findUnique({ where: { id }, select: seleccion });
}

export async function obtenerEspecialidades(): Promise<EspecialidadConteo[]> {
  const grupos = await prisma.profesional.groupBy({
    by: ["especialidad"],
    _count: { id: true },
    orderBy: { especialidad: "asc" },
  });
  return grupos.map((g) => ({ especialidad: g.especialidad, count: g._count.id }));
}

/** Un profesional por especialidad, hasta 4, en una sola consulta. */
export async function obtenerDestacados(cantidad = 4): Promise<ProfesionalDTO[]> {
  const todos = await prisma.profesional.findMany({
    orderBy: [{ especialidad: "asc" }, { nombre: "asc" }],
    select: seleccion,
  });
  const vistos = new Set<string>();
  const destacados: ProfesionalDTO[] = [];
  for (const p of todos) {
    if (vistos.has(p.especialidad)) continue;
    vistos.add(p.especialidad);
    destacados.push(p);
    if (destacados.length === cantidad) break;
  }
  return destacados;
}

export async function obtenerResumen(): Promise<{ profesionales: number; especialidades: number; clinicas: number }> {
  const [profesionales, especialidades, clinicas] = await Promise.all([
    prisma.profesional.count(),
    prisma.profesional.findMany({ distinct: ["especialidad"], select: { especialidad: true } }),
    prisma.profesional.findMany({ distinct: ["clinica"], select: { clinica: true } }),
  ]);
  return { profesionales, especialidades: especialidades.length, clinicas: clinicas.length };
}
