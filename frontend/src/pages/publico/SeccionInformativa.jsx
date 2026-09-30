import { Link, useNavigate } from "react-router-dom";

export default function SeccionInformativa() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header superior */}
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
          <span>Salir</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col items-center">
        {/* Banner Encabezado */}
        <div className="text-center max-w-2xl mb-8 space-y-2">
          <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-xs border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold rounded-full uppercase tracking-wider">
            Aprende e Infórmate
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B5E9E]">
            Sección Informativa
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Conocer los signos del acoso es el primer paso para detectarlo y frenarlo a tiempo.
          </p>
        </div>

        {/* Bloque 1: ¿Qué es el Bullying? */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 w-full mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#DCEAF7]/50 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEAF7] text-[#1B5E9E] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1B5E9E] mb-2">
                ¿Qué es el bullying?
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                El bullying o acoso escolar es una forma de violencia que ocurre cuando una persona es molestada, intimidada, excluida o agredida de manera <strong className="text-slate-800">intencional y repetida</strong> en el tiempo.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2: Tipos de Bullying (Grid Interactivo) */}
        <div className="w-full mb-6 space-y-3">
          <h2 className="text-lg font-bold text-[#2C5F57] px-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2C5F57]"></span>
            Tipos de bullying
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Físico */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                  Físico
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Golpes, empujones, patadas, tropezones intencionales o daño y robo de pertenencias.
              </p>
            </div>

            {/* Verbal */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                  Verbal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Insultos, gritos, amenazas, burlas constantes, apodos ofensivos o comentarios hirientes.
              </p>
            </div>

            {/* Social */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                  Social / Relacional
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Excluir intencionalmente a alguien de actividades, difundir chismes o hacer que otros se alejen.
              </p>
            </div>

            {/* Ciberbullying */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg border border-sky-200">
                  Ciberbullying
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Acoso que ocurre en redes sociales, chats, videojuegos o cualquier medio digital con mensajes o fotos sin permiso.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 3: Reconocimiento y Acciones en 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {/* Señales de alerta */}
          <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#2C5F57] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                ¿Cómo reconocerlo?
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Evitar ir al colegio o faltar a actividades habituales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Cambios repentinos de ánimo o aislamiento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Sentirse constantemente triste, temeroso o ansioso.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Miedo a revisar sus redes sociales o celular.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Bajón inesperado en el rendimiento académico.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ¿Qué hacer? */}
          <div className="bg-[#2C5F57] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-emerald-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ¿Qué hacer si vives esta situación?
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-emerald-50/90">
                <li className="flex items-start gap-2">
                  <strong className="bg-emerald-700/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</strong>
                  <span><strong>Habla con alguien:</strong> Cuéntale a un adulto o profesor de confianza.</span>
                </li>
                <li className="flex items-start gap-2">
                  <strong className="bg-emerald-700/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</strong>
                  <span><strong>Guarda evidencia:</strong> Toma capturas si es por medios digitales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <strong className="bg-emerald-700/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</strong>
                  <span><strong>No respondas con violencia:</strong> Busca ayuda de forma segura.</span>
                </li>
                <li className="flex items-start gap-2">
                  <strong className="bg-emerald-700/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</strong>
                  <span><strong>Usa SafeVoice:</strong> Envía un reporte anónimo en esta plataforma.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <div className="w-full flex justify-center pt-2">
          <button
            onClick={() => navigate("/lineas-ayuda")}
            className="w-full sm:w-auto bg-[#1B5E9E] hover:bg-[#154a7d] active:scale-[0.99] text-white font-bold text-sm px-10 py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Conocer líneas de ayuda</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </main>

      {/* Footer inferior */}
      <footer className="bg-white/80 px-8 py-3 flex justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80">
        <span>SafeVoice &bull; Plataforma Anónima Escolar</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}