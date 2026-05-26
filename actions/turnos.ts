"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearTurno(data: {
  profesionalId: string;
  fecha: Date;
  clienteNombre: string;
  clienteEmail: string;
}) {
  const existe = await prisma.turno.findFirst({
    where: {
      profesionalId: data.profesionalId,
      fecha: data.fecha,
      cancelado: false,
    },
  });

  if (existe) return { ok: false, error: "Ese horario ya está reservado." };

  const turno = await prisma.turno.create({ data });
  revalidatePath(`/reservar/${data.profesionalId}`);
  return { ok: true, turno };
}

export async function cancelarTurno(turnoId: string) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
  });

  if (!turno || turno.cancelado) {
    return { ok: false, error: "Turno no encontrado o ya fue cancelado." };
  }

  if (turno.fecha <= new Date()) {
    return { ok: false, error: "No se pueden cancelar turnos que ya pasaron." };
  }

  const updatedTurno = await prisma.turno.update({
    where: { id: turnoId },
    data: { cancelado: true },
  });
  revalidatePath("/mis-turnos");
  return { ok: true, turno: updatedTurno };
}

export async function obtenerTurnosOcupados(profesionalId: string, fecha: Date) {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999);

  const turnos = await prisma.turno.findMany({
    where: { profesionalId, cancelado: false, fecha: { gte: inicio, lte: fin } },
    select: { fecha: true },
  });

  return turnos.map((t) => t.fecha.toISOString());
}

export async function buscarTurnosPorEmail(email: string) {
  return prisma.turno.findMany({
    where: {
      clienteEmail: email,
      cancelado: false,
      fecha: { gt: new Date() },
    },
    include: { profesional: true },
    orderBy: { fecha: "asc" },
  });
}
