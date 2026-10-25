import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BotonSalidaRapida from "./BotonSalidaRapida";

const ENLACES_PUBLICOS = [
  { to: "/", label: "Inicio", exact: true },
  { to: "/reporte", label: "Crear Reporte", match: ["/reporte", "/reportar"] },
  { to: "/consultar", label: "Consultar Caso", match: ["/consultar", "/consultar-reporte"] },
  { to: "/informacion", label: "Información", match: ["/informacion"] },
  { to: "/contactos", label: "Contactos y Ayuda", match: ["/contactos", "/lineas-ayuda"] },
];

export default function NavbarPublico({ mostrarSalidaRapida = true }) {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esRutaActiva = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.match) return item.match.some((ruta) => location.pathname.startsWith(ruta));
    return location.pathname === item.to;
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3.5 flex items-center justify-between gap-4">
        {/* Logo Institucional */}
        <Link
          to="/"
          onClick={() => setMenuAbierto(false)}
          className="flex items-center gap-3 group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#DCEAF7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 text-[#1B5E9E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#1B5E9E] tracking-tight">SafeVoice</span>
        </Link>

        {/* Navegación Central Desktop */}
        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1.5">
          {ENLACES_PUBLICOS.map((item) => {
            const activo = esRutaActiva(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activo
                    ? "bg-[#DCEAF7] text-[#1B5E9E] shadow-2xs"
                    : "text-slate-600 hover:text-[#1B5E9E] hover:bg-slate-100/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones Derecha Desktop + Botón Menú Móvil */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/consultar"
            className="hidden sm:inline-flex lg:hidden items-center gap-1.5 text-xs font-bold text-[#1B5E9E] bg-[#DCEAF7]/60 hover:bg-[#DCEAF7] px-3.5 py-2 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Consultar Caso</span>
          </Link>

          <Link
            to="/docente/login"
            className="hidden sm:inline-flex bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Portal Docentes</span>
          </Link>

          {/* Botón Hamburguesa Responsive (< lg) */}
          <button
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-expanded={menuAbierto}
            aria-label="Abrir menú de navegación"
            className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl text-[#1B5E9E] bg-[#DCEAF7]/60 hover:bg-[#DCEAF7] transition-all cursor-pointer"
          >
            {menuAbierto ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Panel Desplegable Móvil / Tablet */}
      {menuAbierto && (
        <nav
          aria-label="Menú móvil"
          className="lg:hidden bg-white border-t border-slate-200/80 px-4 pt-3 pb-4 space-y-1.5 shadow-lg"
        >
          {ENLACES_PUBLICOS.map((item) => {
            const activo = esRutaActiva(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activo
                    ? "bg-[#DCEAF7] text-[#1B5E9E]"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{item.label}</span>
                {activo && <span className="w-2 h-2 rounded-full bg-[#1B5E9E]" />}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col sm:hidden gap-2">
            <Link
              to="/docente/login"
              onClick={() => setMenuAbierto(false)}
              className="w-full bg-[#2C5F57] hover:bg-[#234c45] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Portal Docentes</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
    {mostrarSalidaRapida && <BotonSalidaRapida />}
    </>
  );
}
