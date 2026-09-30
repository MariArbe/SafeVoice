import { Link, useNavigate } from "react-router-dom";

export default function LineasAyuda() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 shadow-2xs sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#DCEAF7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#1B5E9E] tracking-tight">SafeVoice</span>
        </Link>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-bold text-[#2C5F57] hover:text-[#1B5E9E] bg-slate-100/80 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          title="Volver al inicio"
        >
          <span>Inicio</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col items-center">
        {/* Navegación Superior */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/contactos")}
            className="flex items-center gap-2 text-xs font-bold text-[#2C5F57] hover:text-[#154a7d] bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Ver contactos institucionales</span>
          </button>
        </div>

        {/* Banner Motivacional */}
        <div className="text-center max-w-2xl mb-8 space-y-2">
          <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-xs border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold rounded-full uppercase tracking-wider">
            Apoyo 24/7
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E9E] leading-snug">
            Líneas Nacionales de Ayuda Inmediata
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Si estás pasando por una situación difícil o necesitas apoyo urgente, estas líneas son totalmente gratuitas y confidenciales.
          </p>
        </div>

        {/* Tarjeta de Líneas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 w-full max-w-2xl space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#2C5F57]">Atención Telefónica Directa</h2>
            <p className="text-xs text-slate-500">Haz clic en el número para realizar la llamada de forma inmediata.</p>
          </div>

          <div className="space-y-3">
            {/* Línea 141 - ICBF */}
            <a
              href="tel:141"
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-[#1B5E9E]/50 hover:bg-blue-50/30 transition-all group cursor-pointer shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1B5E9E] text-base group-hover:underline">Línea 141 — ICBF</span>
                  <span className="text-[10px] bg-emerald-100 text-[#2C5F57] font-bold px-2 py-0.5 rounded-full">Gratis</span>
                </div>
                <p className="text-xs text-slate-600">Orientación y atención prioritaria para niños, niñas y adolescentes.</p>
              </div>
              <div className="w-11 h-11 bg-[#2C5F57] group-hover:bg-[#1B5E9E] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </a>

            {/* Línea 123 - Emergencias */}
            <a
              href="tel:123"
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-[#1B5E9E]/50 hover:bg-rose-50/30 transition-all group cursor-pointer shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-700 text-base group-hover:underline">Línea 123 — Emergencias</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">24 Horas</span>
                </div>
                <p className="text-xs text-slate-600">Para situaciones de peligro inminente o riesgo físico directo.</p>
              </div>
              <div className="w-11 h-11 bg-rose-600 group-hover:bg-rose-700 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </a>

            {/* Línea 106 - Salud Mental */}
            <a
              href="tel:106"
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-[#1B5E9E]/50 hover:bg-emerald-50/30 transition-all group cursor-pointer shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2C5F57] text-base group-hover:underline">Línea 106 — Salud Mental</span>
                  <span className="text-[10px] bg-emerald-100 text-[#2C5F57] font-bold px-2 py-0.5 rounded-full">Escucha activa</span>
                </div>
                <p className="text-xs text-slate-600">Espacio seguro de escucha, apoyo psicológico y orientación emocional.</p>
              </div>
              <div className="w-11 h-11 bg-[#2C5F57] group-hover:bg-[#1B5E9E] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 px-8 py-3 flex justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80">
        <span>SafeVoice &bull; Apoyo al Estudiante</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}