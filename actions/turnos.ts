"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { esEmailValido } from "@/lib/texto";
import type { ProfesionalDTO } from "./profesionales";

export type TurnoConProfesional = {
  id: string;
  fecha: Date;
  cancelado: boolean;
  clienteNombre: string;
  clienteEmail: string;
  profesional: ProfesionalDTO;
};

type ResultadoCrear =
  | { ok: true; turnoId: string }
  | { ok: false; error: string; codigo: "VALIDACION" | "PASADO" | "OCUPADO" | "NO_ENCONTRADO" };

const incluirProfesional = {
  profesional: { select: { id: true, nombre: true, especialidad: true, clinica: true } },
} as const;

export async function crearTurno(data: {
  profesionalId: string;
  fecha: Date;
  clienteNombre: string;
  clienteEmail: string;
}): Promise<ResultadoCrear> {
  const nombre = data.clienteNombre.trim();
  const email = data.clienteEmail.trim().toLowerCase();
  const fecha = new Date(data.fecha);

  if (nombre.length < 2 || nombre.length > 80) {
    return { ok: false, codigo: "VALIDACION", error: "Ingresá tu nombre completo." };
  }
  if (!esEmailValido(email)) {
    return { ok: false, codigo: "VALIDACION", error: "El email no tiene un formato válido." };
  }
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, codigo: "VALIDACION", error: "La fecha del turno no es válida." };
  }
  if (fecha.getTime() <= Date.now()) {
    return { ok: false, codigo: "PASADO", error: "Ese horario ya pasó. Elegí otro." };
  }

  const profesional = await prisma.profesional.findUnique({ where: { id: data.profesionalId }, select: { id: true } });
  if (!profesional) {
    return { ok: false, codigo: "NO_ENCONTRADO", error: "El profesional no existe." };
  }

  const existe = await prisma.turno.findFirst({
    where: { profesionalId: data.profesionalId, fecha, cancelado: false },
    select: { id: true },
  });
  if (existe) {
    return { ok: false, codigo: "OCUPADO", error: "Ese horario acaba de ser reservado por otra persona." };
  }

  const turno = await prisma.turno.create({
    data: { profesionalId: data.profesionalId, fecha, clienteNombre: nombre, clienteEmail: email },
    select: { id: true },
  });

  revalidatePath(`/reservar/${data.profesionalId}`);
  return { ok: true, turnoId: turno.id };
}

export async function cancelarTurno(turnoId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const turno = await prisma.turno.findUnique({ where: { id: turnoId } });

  if (!turno || turno.cancelado) {
    return { ok: false, error: "El turno no existe o ya fue cancelado." };
  }
  if (turno.fecha <= new Date()) {
    return { ok: false, error: "No se pueden cancelar turnos que ya pasaron." };
  }

  await prisma.turno.update({ where: { id: turnoId }, data: { cancelado: true } });
  revalidatePath(`/reservar/${turno.profesionalId}`);
  return { ok: true };
}

/** Instantes (ISO) ocupados para un profesional entre dos fechas. */
export async function obtenerTurnosOcupados(profesionalId: string, desde: Date, hasta: Date): Promise<string[]> {
  const turnos = await prisma.turno.findMany({
    where: { profesionalId, cancelado: false, fecha: { gte: new Date(desde), lte: new Date(hasta) } },
    select: { fecha: true },
  });
  return turnos.map((t) => t.fecha.toISOString());
}

const DIA_MS = 86_400_000;

/** Ocupados desde ayer hasta `dias` días adelante. Devuelve también el límite cubierto (ISO). */
export async function obtenerOcupadosProximos(
  profesionalId: string,
  dias = 70,
): Promise<{ ocupados: string[]; cubiertoHasta: string }> {
  const ahora = Date.now();
  const hasta = new Date(ahora + dias * DIA_MS);
  const ocupados = await obtenerTurnosOcupados(profesionalId, new Date(ahora - DIA_MS), hasta);
  return { ocupados, cubiertoHasta: hasta.toISOString() };
}

export async function obtenerTurnoPorId(id: string): Promise<TurnoConProfesional | null> {
  return prisma.turno.findUnique({ where: { id }, include: incluirProfesional });
}

export async function buscarTurnosPorEmail(
  email: string,
): Promise<{ proximos: TurnoConProfesional[]; historial: TurnoConProfesional[] }> {
  const limpio = email.trim();
  if (!esEmailValido(limpio)) return { proximos: [], historial: [] };

  const ahora = new Date();
  const [proximos, historial] = await Promise.all([
    prisma.turno.findMany({
      where: { clienteEmail: { equals: limpio, mode: "insensitive" }, cancelado: false, fecha: { gt: ahora } },
      include: incluirProfesional,
      orderBy: { fecha: "asc" },
    }),
    prisma.turno.findMany({
      where: {
        clienteEmail: { equals: limpio, mode: "insensitive" },
        OR: [{ cancelado: true }, { fecha: { lte: ahora } }],
      },
      include: incluirProfesional,
      orderBy: { fecha: "desc" },
      take: 20,
    }),
  ]);

  return { proximos, historial };
}
