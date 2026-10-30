"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

type Tono = "success" | "error" | "info";
type Toast = { id: number; titulo: string; descripcion?: string; tono: Tono };
type ToastInput = { titulo: string; descripcion?: string; tono?: Tono };

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

const ICONOS = { success: CircleCheck, error: CircleAlert, info: Info };
const COLORES = {
  success: "text-emerald-600",
  error: "text-red-600",
  info: "text-brand-600",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const contador = useRef(0);

  const cerrar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (t: ToastInput) => {
      const id = ++contador.current;
      setToasts((prev) => [...prev.slice(-3), { id, tono: t.tono ?? "info", titulo: t.titulo, descripcion: t.descripcion }]);
      window.setTimeout(() => cerrar(id), 4500);
    },
    [cerrar],
  );

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
      >
        {toasts.map((t) => {
          const Icon = ICONOS[t.tono];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 pr-2 shadow-float animate-slide-up"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${COLORES[t.tono]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.titulo}</p>
                {t.descripcion && <p className="mt-0.5 text-xs leading-5 text-ink-3">{t.descripcion}</p>}
              </div>
              <button onClick={() => cerrar(t.id)} className="btn btn-ghost btn-icon -my-1 text-ink-3" aria-label="Cerrar">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
