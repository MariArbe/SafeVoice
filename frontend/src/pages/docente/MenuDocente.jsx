import { Link, useNavigate } from "react-router-dom";

export default function MenuDocente() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header superior */}
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
      <main className="max-w-4xl mx-auto px-6 py-8 w-full flex-1 flex flex-col items-center justify-center">
        {/* Encabezado con título e icono de logout/salida */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <div className="flex-1" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700 text-center flex-1 whitespace-nowrap">
            Panel Personal Docente
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => navigate("/docente/login")}
              className="text-[#2C5F57] hover:text-[#1F433D] transition-colors p-1"
              title="Cerrar sesión"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tarjeta Blanca Central */}
        <div className="bg-white rounded-3xl p-10 md:p-14 shadow-md border border-slate-100 w-full max-w-2xl text-center space-y-8">
          <h2 className="text-2xl font-bold text-[#2C5F57]">
            ¿Qué desea hacer hoy?
          </h2>

          <div className="flex flex-col gap-5 max-w-md mx-auto pt-2">
            <button
              onClick={() => navigate("/docente/dashboard")}
              className="w-full bg-[#008080] hover:bg-[#006666] text-white font-semibold py-3.5 px-6 rounded-2xl text-base transition-colors shadow-xs"
            >
              Ver dashvoard datos
            </button>

            <button
              onClick={() => navigate("/docente/reportes")}
              className="w-full bg-[#008080] hover:bg-[#006666] text-white font-semibold py-3.5 px-6 rounded-2xl text-base transition-colors shadow-xs"
            >
              Bandeja de reportes
            </button>
          </div>
        </div>
      </main>

      {/* Footer inferior */}
      <footer className="bg-white px-8 py-3 flex justify-end text-xs text-[#2C5F57] font-medium border-t border-slate-100">
        &copy; 2025
      </footer>
    </div>
  );
}