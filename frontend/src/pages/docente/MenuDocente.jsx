import { Link, useNavigate } from "react-router-dom";

export default function MenuDocente() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      
      {/* Header superior con efecto Glassmorphism */}
      <header className="bg-white/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 shadow-2xs sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-[#DCEAF7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#1B5E9E] tracking-tight">SafeVoice</span>
        </Link>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={() => navigate("/docente/login")}
          className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
          title="Cerrar sesión"
        >
          <span>Cerrar sesión</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full flex-1 flex flex-col justify-center space-y-8">
        
        {/* Encabezado del Panel */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold tracking-wide uppercase shadow-2xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sesión Activa &bull; Comité de Convivencia
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E9E]">
            ¡Hola, Docente!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            ¿Qué acción deseas realizar hoy en la plataforma?
          </p>
        </div>

        {/* Tarjetas Principales de Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          
          {/* Tarjeta 1: Dashboard Analytics */}
          <div
            onClick={() => navigate("/docente/dashboard")}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/80 hover:border-[#1B5E9E] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#DCEAF7]/60 rounded-full blur-2xl group-hover:bg-[#1B5E9E]/20 transition-all" />
            
            <div className="space-y-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#DCEAF7] text-[#1B5E9E] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1B5E9E] group-hover:text-white transition-all shadow-xs">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#1B5E9E] transition-colors">
                    Dashboard de Datos
                  </h2>
                  <span className="text-xs font-semibold text-[#1B5E9E] bg-[#DCEAF7] px-2.5 py-1 rounded-lg">
                    Estadísticas
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1">
                  Visualiza métricas, frecuencias de situaciones, sedes más afectadas y tendencias de convivencia escolar.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B5E9E]">
              <span>Ver analítica e informes</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#1B5E9E] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Bandeja de Reportes */}
          <div
            onClick={() => navigate("/docente/reportes")}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/80 hover:border-[#2C5F57] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl group-hover:bg-[#2C5F57]/20 transition-all" />
            
            <div className="space-y-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#2C5F57] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#2C5F57] group-hover:text-white transition-all shadow-xs">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#2C5F57] transition-colors">
                    Bandeja de Reportes
                  </h2>
                  <span className="text-xs font-semibold text-[#2C5F57] bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Gestión de casos
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1">
                  Revisa los casos recibidos de los estudiantes, actualiza sus estados, asigna responsables y realiza el seguimiento.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2C5F57]">
              <span>Gestionar casos recibidos</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#2C5F57] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Informatorio Inferior / Protocolos */}
        <div className="bg-white/70 rounded-2xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#1B5E9E]/10 text-[#1B5E9E] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">¿Dudas sobre la Ruta de Atención Integral?</p>
              <p className="text-[11px] text-slate-500">Recuerda aplicar los protocolos establecidos por la Ley de Convivencia Escolar.</p>
            </div>
          </div>

          <Link
            to="/informacion"
            className="text-xs font-bold text-[#1B5E9E] hover:underline whitespace-nowrap bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs"
          >
            Ver Información
          </Link>
        </div>

      </main>

      {/* Footer Unificado */}
      <footer className="bg-white/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80 gap-2">
        <span>SafeVoice &bull; Portal de Gestión Docente y Directivos</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}