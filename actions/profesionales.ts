"use server";

import { prisma } from "@/lib/prisma";

// Función para normalizar strings quitando acentos
function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function obtenerProfesionales(filtros?: {
  especialidad?: string;
  busqueda?: string;
}) {
  const where: any = {};

  if (filtros?.especialidad) {
    where.especialidad = filtros.especialidad;
  }

  // Obtener todos los profesionales y filtrar con normalización en JavaScript
  const todos = await prisma.profesional.findMany({
    where: filtros?.especialidad ? { especialidad: filtros.especialidad } : {},
    orderBy: { nombre: "asc" },
  });

  if (!filtros?.busqueda) {
    return todos;
  }

  const busquedaNormalizada = normalizarTexto(filtros.busqueda);

  return todos.filter((prof) => {
    const nombreNormalizado = normalizarTexto(prof.nombre);
    const especialidadNormalizada = normalizarTexto(prof.especialidad);
    const clinicaNormalizada = normalizarTexto(prof.clinica);

    return (
      nombreNormalizado.includes(busquedaNormalizada) ||
      especialidadNormalizada.includes(busquedaNormalizada) ||
      clinicaNormalizada.includes(busquedaNormalizada)
    );
  });
}

export async function obtenerProfesionalPorId(id: string) {
  return prisma.profesional.findUnique({ where: { id } });
}

export async function obtenerEspecialidades() {
  return prisma.profesional.groupBy({
    by: ["especialidad"],
    _count: { id: true },
    orderBy: { especialidad: "asc" },
  });
}

export async function obtenerDestacados() {
  const especialidades = await prisma.profesional.findMany({
    distinct: ["especialidad"],
    select: { especialidad: true },
    take: 4,
  });

  const destacados = await Promise.all(
    especialidades.map((e) =>
      prisma.profesional.findFirst({ where: { especialidad: e.especialidad } })
    )
  );

  return destacados.filter(Boolean);
}
