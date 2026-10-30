/** Zona horaria en la que operan las clínicas. Se usa para formatear fechas en el servidor. */
export const APP_TZ = "America/Argentina/Buenos_Aires";

/** Horarios de atención disponibles por día (duración 30 min). */
export const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"] as const;
export const DURACION_TURNO_MIN = 30;

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
export const DIAS_CORTOS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export function inicioDeDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function mismaFecha(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Combina un día (fecha local) con un slot "HH:MM". */
export function fechaConSlot(dia: Date, slot: string): Date {
  const [h, m] = slot.split(":").map(Number);
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m, 0, 0);
}

/** Clave "YYYY-MM-DD" en hora local, útil para agrupar. */
export function claveDia(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const fmtLarga = (tz?: string) =>
  new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: tz });
const fmtCorta = (tz?: string) =>
  new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: tz });
const fmtHora = (tz?: string) =>
  new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Lunes 3 de noviembre". Pasá `tz` cuando formatees en el servidor. */
export function fechaLarga(d: Date, tz?: string): string {
  return capitalizar(fmtLarga(tz).format(d));
}

/** "3 nov 2026" */
export function fechaCorta(d: Date, tz?: string): string {
  return fmtCorta(tz).format(d).replace(".", "");
}

/** "09:30" */
export function hora(d: Date, tz?: string): string {
  return fmtHora(tz).format(d);
}

/** Texto relativo breve: "Hoy", "Mañana", "En 5 días", "Pasado". */
export function relativo(d: Date, ahora = new Date()): string {
  const diff = Math.round((inicioDeDia(d).getTime() - inicioDeDia(ahora).getTime()) / 86_400_000);
  if (diff < 0) return "Pasado";
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff < 7) return `En ${diff} días`;
  if (diff < 30) return `En ${Math.round(diff / 7)} sem.`;
  return `En ${Math.round(diff / 30)} mes${Math.round(diff / 30) > 1 ? "es" : ""}`;
}

function aFormatoGoogle(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Link para agregar el turno a Google Calendar. */
export function urlGoogleCalendar(opts: { titulo: string; inicio: Date; detalles?: string; ubicacion?: string }): string {
  const fin = new Date(opts.inicio.getTime() + DURACION_TURNO_MIN * 60_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.titulo,
    dates: `${aFormatoGoogle(opts.inicio)}/${aFormatoGoogle(fin)}`,
  });
  if (opts.detalles) p.set("details", opts.detalles);
  if (opts.ubicacion) p.set("location", opts.ubicacion);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
