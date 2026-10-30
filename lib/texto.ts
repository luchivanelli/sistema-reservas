/** Quita acentos y pasa a minúsculas para comparar texto sin importar tildes. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** "Dra. María José Pérez" -> "MP" */
export function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/^(dr|dra|lic|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return "?";
  const primera = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] ?? "" : "";
  return (primera + ultima).toUpperCase();
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esEmailValido(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}
