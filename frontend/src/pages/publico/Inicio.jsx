import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header superior */}
      <header className="bg-white/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 shadow-2xs sticky top-0 z-20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-[#DCEAF7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#1B5E9E] tracking-tight">SafeVoice</span>
        </div>

        <Link
          to="/docente/login"
          className="bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Portal Docentes</span>
        </Link>
      </header>

      {/* Contenido Principal (Hero Section) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1 flex flex-col justify-between space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
          
          {/* Columna Izquierda: Mensaje Principal + Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold tracking-wide uppercase shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#2C5F57] animate-pulse" />
              Plataforma Escolar Anónima y Confidencial
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1B5E9E] leading-tight tracking-tight">
              Tu voz importa. <br className="hidden sm:inline" />
              <span className="text-slate-800 font-extrabold">Estamos aquí para escucharte y ayudarte.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Reporta situaciones de bullying o ciberbullying de forma <strong className="text-slate-800">100% segura y anónima</strong>. Encuentra orientación, recursos y contactos institucionales cuando más lo necesites.
            </p>

            {/* Botón Principal Destacado */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/reporte"
                className="w-full sm:w-auto bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.98] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group cursor-pointer"
              >
                <svg className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Crear Reporte Anónimo</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Ilustración SVG Estilo Vectorial */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white/60 p-6 rounded-3xl backdrop-blur-md border border-white/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#1B5E9E]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#2C5F57]/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Ilustración de Escudo y Acompañamiento */}
              <svg className="w-full h-auto max-h-72 text-[#1B5E9E] drop-shadow-xs" viewBox="0 0 400 320" fill="none">
                {/* Fondo Decorativo */}
                <rect x="20" y="20" width="360" height="280" rx="24" fill="#FFFFFF" fillOpacity="0.8" />
                
                {/* Globo de mensaje de apoyo */}
                <rect x="50" y="50" width="180" height="60" rx="16" fill="#DCEAF7" />
                <path d="M70 110 L60 125 L90 110 Z" fill="#DCEAF7" />
                <circle cx="90" cy="80" r="10" fill="#1B5E9E" />
                <rect x="110" y="72" width="90" height="6" rx="3" fill="#1B5E9E" fillOpacity="0.6" />
                <rect x="110" y="84" width="60" height="6" rx="3" fill="#1B5E9E" fillOpacity="0.4" />

                {/* Escudo Seguro de SafeVoice */}
                <g transform="translate(210, 100)">
                  <path d="M60 10 S110 20 110 70 C110 130 60 160 60 160 C60 160 10 130 10 70 S60 10 60 10 Z" fill="#2C5F57" />
                  <path d="M60 25 S100 33 100 70 C100 120 60 145 60 145 C60 145 20 120 20 70 S60 25 60 25 Z" fill="#38776D" />
                  <path d="m45 75 10 10 20-20" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>

                {/* Tarjeta inferior con candado */}
                <rect x="50" y="160" width="170" height="80" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                <circle cx="85" cy="200" r="18" fill="#DCEAF7" />
                <path d="M81 200 v-4 a4 4 0 0 1 8 0 v4 m-10 0 h12 v10 h-12 z" fill="none" stroke="#1B5E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="115" y="190" width="80" height="8" rx="4" fill="#334155" />
                <rect x="115" y="204" width="55" height="6" rx="3" fill="#94A3B8" />
              </svg>
            </div>
          </div>

        </div>

        {/* Tarjeta Inferior de Accesos Rápidos */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#2C5F57] uppercase tracking-wider">¿En qué podemos ayudarte hoy?</h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Explora las opciones de ayuda</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Opción 1: Reportar */}
            <Link
              to="/reporte"
              className="group p-5 rounded-2xl border border-slate-200 hover:border-[#2C5F57] bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex items-start gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2C5F57] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#2C5F57] transition-colors">Quiero reportar</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Envía un caso de bullying de forma 100% segura y confidencial.</p>
              </div>
            </Link>

            {/* Opción 2: Contactos de ayuda */}
            <Link
              to="/lineas-ayuda"
              className="group p-5 rounded-2xl border border-slate-200 hover:border-[#1B5E9E] bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-start gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1B5E9E] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#1B5E9E] transition-colors">Contactos y líneas</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Accede a números de orientación, emergencias e ICBF.</p>
              </div>
            </Link>

            {/* Opción 3: Información */}
            <Link
              to="/informacion"
              className="group p-5 rounded-2xl border border-slate-200 hover:border-amber-500 bg-slate-50/50 hover:bg-amber-50/30 transition-all flex items-start gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">Aprende sobre acoso</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Conoce los tipos de bullying y qué hacer ante un caso.</p>
              </div>
            </Link>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80 gap-2">
        <span>SafeVoice &bull; Plataforma Anónima de Convivencia Escolar</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}