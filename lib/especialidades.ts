import {
  Apple, Baby, Bone, Brain, BrainCircuit, Ear, Eye, Flower2, Heart, Hospital,
  Leaf, Ribbon, Sparkles, Stethoscope, Wind, type LucideIcon,
} from "lucide-react";

export type Tono =
  | "rose" | "indigo" | "emerald" | "orange" | "fuchsia" | "sky" | "green"
  | "red" | "violet" | "lime" | "cyan" | "teal" | "pink" | "amber" | "brand";

export type EspecialidadMeta = { icon: LucideIcon; tono: Tono; descripcion: string };

export const ESPECIALIDADES: Record<string, EspecialidadMeta> = {
  "Cardiología": { icon: Heart, tono: "rose", descripcion: "Corazón y sistema circulatorio" },
  "Neurología": { icon: Brain, tono: "indigo", descripcion: "Sistema nervioso" },
  "Pediatría": { icon: Baby, tono: "emerald", descripcion: "Salud infantil" },
  "Dermatología": { icon: Sparkles, tono: "orange", descripcion: "Piel, cabello y uñas" },
  "Ginecología": { icon: Flower2, tono: "fuchsia", descripcion: "Salud de la mujer" },
  "Clínica Médica": { icon: Stethoscope, tono: "sky", descripcion: "Atención general" },
  "Oftalmología": { icon: Eye, tono: "green", descripcion: "Visión y ojos" },
  "Traumatología": { icon: Bone, tono: "red", descripcion: "Huesos y articulaciones" },
  "Psiquiatría": { icon: BrainCircuit, tono: "violet", descripcion: "Salud mental" },
  "Psicología": { icon: Leaf, tono: "lime", descripcion: "Bienestar emocional" },
  "Otorrinolaringología": { icon: Ear, tono: "cyan", descripcion: "Oído, nariz y garganta" },
  "Neumonología": { icon: Wind, tono: "teal", descripcion: "Pulmones y respiración" },
  "Oncología": { icon: Ribbon, tono: "pink", descripcion: "Diagnóstico y tratamiento del cáncer" },
  "Nutrición": { icon: Apple, tono: "amber", descripcion: "Alimentación y hábitos" },
};

const DEFAULT_META: EspecialidadMeta = { icon: Hospital, tono: "brand", descripcion: "Especialidad médica" };

export function especialidadMeta(nombre: string): EspecialidadMeta {
  return ESPECIALIDADES[nombre] ?? DEFAULT_META;
}

export function claseTono(nombre: string): string {
  return `tone-${especialidadMeta(nombre).tono}`;
}
