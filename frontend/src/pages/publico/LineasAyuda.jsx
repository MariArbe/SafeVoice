import { Link, useNavigate } from "react-router-dom";

export default function LineasAyuda() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100 shadow-2xs">
        <Link to="/" className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-xl font-bold text-[#2C5F57]">SafeVoice</span>
        </Link>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-6 py-6 w-full flex-1 flex flex-col items-center">
        {/* Navegación */}
        <div className="w-full flex items-center justify-between mb-4">
          <button onClick={() => navigate("/contactos")} className="text-[#2C5F57] hover:text-[#1F433D] p-1">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => navigate("/")} className="text-[#2C5F57] hover:text-[#1F433D] p-1">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-700 text-center max-w-2xl mb-8 leading-snug">
          Si estás pasando por una situación difícil o necesitas hablar con alguien, aquí puedes encontrar personas que pueden escucharte y ayudarte.
        </h1>

        {/* Tarjeta */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-full max-w-2xl space-y-6">
          <div>
            <h2 className="text-[#2C5F57] font-bold text-lg mb-1">Lineas de ayuda</h2>
            <p className="text-xs text-slate-500 max-w-md">
              Aquí encontrarás líneas y servicios donde puedes recibir orientación, apoyo y acompañamiento frente a situaciones de bullying, ciberbullying o violencia.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Línea 141 — ICBF</p>
                <p className="text-xs text-slate-700 font-bold italic">Orientación y atención para niños, niñas y adolescentes.</p>
              </div>
              <span className="p-2 bg-emerald-500 text-white rounded-md shrink-0">📞</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Línea 123 — Emergencias</p>
                <p className="text-xs text-slate-700 font-bold italic">Para situaciones de emergencia o peligro inmediato.</p>
              </div>
              <span className="p-2 bg-emerald-500 text-white rounded-md shrink-0">📞</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Línea 106 — Salud mental</p>
                <p className="text-xs text-slate-700 font-bold italic">Espacio de orientación y apoyo emocional.</p>
              </div>
              <span className="p-2 bg-emerald-500 text-white rounded-md shrink-0">📞</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white px-8 py-3 flex justify-end text-xs text-[#2C5F57] font-medium border-t border-slate-100">
        &copy; 2025
      </footer>
    </div>
  );
}