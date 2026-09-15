import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header superior */}
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Isotipo SafeVoice */}
          <svg className="w-8 h-8 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-xl font-bold text-[#2C5F57]">SafeVoice</span>
        </div>

        <Link
          to="/docente/login"
          className="bg-[#2C5F57] hover:bg-[#234c45] text-white text-sm font-medium px-5 py-2.5 rounded-2xl transition-colors shadow-xs"
        >
          Soy personal docente
        </Link>
      </header>

      {/* Contenido Principal (Hero Section) */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
          {/* Columna Izquierda: Mensaje Principal */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-700 leading-tight">
              Tu voz importa. Estamos aquí para escucharte.
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-md">
              Reporta situaciones de bullying o ciberbullying de forma segura y encuentra información y recursos de ayuda.
            </p>
          </div>

          {/* Columna Derecha: Ilustración */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-white/40 p-4 rounded-3xl backdrop-blur-xs border border-white/60 shadow-xs flex justify-center items-center">
              {/* SVG representando la gráfica informativa */}
              <svg className="w-full h-auto max-h-64 text-[#2C5F57]" viewBox="0 0 400 300" fill="none">
                <rect width="400" height="300" rx="16" fill="#EBF3FA" />
                <circle cx="200" cy="120" r="60" fill="#38776D" opacity="0.2" />
                <path d="M100 220 L200 100 L300 220 Z" fill="#38776D" opacity="0.4" />
                <rect x="140" y="140" width="120" height="80" rx="8" fill="#FFFFFF" shadow="md" />
                <line x1="160" y1="165" x2="220" y2="165" stroke="#2C5F57" strokeWidth="4" strokeLinecap="round" />
                <line x1="160" y1="185" x2="200" y2="185" stroke="#2C5F57" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tarjeta Inferior de Accesos Rápida */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mt-10">
          {/* Botones redondos superiores (Pills) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-200">
            <Link
              to="/reporte"
              className="text-center py-2.5 px-4 rounded-full border border-slate-400 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Quiero reportar
            </Link>
            <Link
              to="/lineas-ayuda"
              className="text-center py-2.5 px-4 rounded-full border border-slate-400 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Contactos de ayuda
            </Link>
            <Link
              to="/informacion"
              className="text-center py-2.5 px-4 rounded-full border border-slate-400 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Información
            </Link>
          </div>

          {/* Accesos informativos y buscador */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Propósito</h3>
              <p className="text-xs text-slate-500 mt-0.5">Somos un recurso para...</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">Contactos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Eres una institución</p>
            </div>

            <div className="flex justify-end">
              <Link
                to="/informacion"
                className="w-12 h-12 bg-[#2C5F57] hover:bg-[#234c45] rounded-2xl flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}