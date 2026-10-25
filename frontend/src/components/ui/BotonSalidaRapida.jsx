import { useEffect, useRef, useState, useCallback } from "react";

const SAFE_REDIRECT_URL = "https://www.google.com";
const DOUBLE_ESC_WINDOW_MS = 1200;

export default function BotonSalidaRapida() {
  const [escPreaviso, setEscPreaviso] = useState(false);
  const ultimoEscRef = useRef(0);
  const timerRef = useRef(null);

  const ejecutarSalidaRapida = useCallback(() => {
    try {
      // Limpiar título de la pestaña inmediatamente antes de redirigir
      document.title = "Google";
      // Reemplaza la entrada actual del historial para que el botón "Atrás" no regrese al formulario
      window.location.replace(SAFE_REDIRECT_URL);
    } catch {
      window.location.href = SAFE_REDIRECT_URL;
    }
  }, []);

  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        const ahora = Date.now();
        if (ahora - ultimoEscRef.current <= DOUBLE_ESC_WINDOW_MS) {
          e.preventDefault();
          ejecutarSalidaRapida();
          return;
        }

        ultimoEscRef.current = ahora;
        setEscPreaviso(true);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setEscPreaviso(false);
        }, DOUBLE_ESC_WINDOW_MS);
      }
    };

    window.addEventListener("keydown", manejarTecla);
    return () => {
      window.removeEventListener("keydown", manejarTecla);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ejecutarSalidaRapida]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      {escPreaviso && (
        <div
          role="status"
          aria-live="polite"
          className="bg-slate-900/95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg border border-slate-700 animate-bounce"
        >
          Presiona <kbd className="px-1.5 py-0.5 bg-rose-600 rounded text-[11px] font-mono font-bold mx-0.5">ESC</kbd> otra vez para salir de inmediato
        </div>
      )}

      <button
        type="button"
        onClick={ejecutarSalidaRapida}
        title="Ocultar esta página inmediatamente e ir a Google (o presiona ESC 2 veces)"
        aria-label="Salida rápida de emergencia: oculta esta página y abre Google sin dejar historial"
        className="group flex items-center gap-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-lg shadow-rose-900/25 border-2 border-white/90 transition-all cursor-pointer"
      >
        <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <div className="flex flex-col items-start leading-tight text-left">
          <span className="tracking-tight">Salida Rápida</span>
          <span className="text-[10px] font-medium text-rose-100 hidden sm:inline">
            Ocultar pantalla
          </span>
        </div>
        <kbd className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-rose-800/90 border border-rose-400/40 text-[10px] font-mono font-bold text-rose-100 tracking-wider">
          2× ESC
        </kbd>
      </button>
    </div>
  );
}
