import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginDocente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", rememberMe: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navegación al panel principal tras autenticarse
    navigate("/docente/menu");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#DCEAF7] font-sans text-slate-800">
      
      {/* Columna Izquierda: Formulario Login */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-10 md:p-14 shadow-md md:shadow-none z-10">
        
        {/* Barra superior con botón para devolverse */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2C5F57] hover:text-[#1B5E9E] bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#DCEAF7] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="text-lg font-extrabold text-[#1B5E9E]">SafeVoice</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block text-xs font-bold text-[#1B5E9E] bg-[#DCEAF7] px-3 py-1 rounded-full border border-[#1B5E9E]/20">
              Acceso Institucional
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E9E]">Iniciar sesión</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              ¡Bienvenido/a de nuevo! Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Usuario</label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent bg-slate-50/50 focus:bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-slate-300 text-[#1B5E9E] focus:ring-[#1B5E9E] w-4 h-4 cursor-pointer accent-[#1B5E9E]"
                />
                Recordarme
              </label>
              <a href="#" className="text-[#1B5E9E] font-bold hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B5E9E] hover:bg-[#154a7d] active:scale-[0.99] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ingresar al Portal</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            ¿No tienes una cuenta?{" "}
            <Link to="/docente/registro" className="text-[#1B5E9E] font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Footer pequeño */}
        <p className="text-[11px] text-slate-400 text-center">
          SafeVoice &bull; Sistema Institucional de Convivencia
        </p>
      </div>

      {/* Columna Derecha: Panel Lateral Ilustrado */}
      <div className="w-full md:w-1/2 bg-[#DCEAF7] flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#1B5E9E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8 max-w-sm z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E9E]">
            Portal de <span className="text-slate-800">Docentes y Orientación</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Gestión confidencial de reportes, seguimiento de casos e informes de convivencia escolar.
          </p>
        </div>

        {/* Ilustración SVG Moderna */}
        <div className="w-full max-w-md bg-white/70 p-6 rounded-3xl backdrop-blur-md border border-white/80 shadow-sm flex justify-center z-10">
          <svg className="w-full h-auto max-h-72 text-[#1B5E9E]" viewBox="0 0 400 300" fill="none">
            <rect x="30" y="30" width="340" height="240" rx="20" fill="#FFFFFF" />
            <rect x="30" y="30" width="340" height="40" fill="#1B5E9E" rx="8" />
            <circle cx="55" cy="50" r="5" fill="#FF5F56" />
            <circle cx="70" cy="50" r="5" fill="#FFBD2E" />
            <circle cx="85" cy="50" r="5" fill="#27C93F" />
            
            {/* Gráficas e indicadores */}
            <rect x="60" y="100" width="120" height="70" rx="12" fill="#DCEAF7" />
            <rect x="75" y="120" width="60" height="8" rx="4" fill="#1B5E9E" />
            <rect x="75" y="136" width="85" height="6" rx="3" fill="#2C5F57" fillOpacity="0.5" />
            <rect x="75" y="148" width="40" height="6" rx="3" fill="#2C5F57" fillOpacity="0.3" />

            <rect x="200" y="100" width="140" height="130" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
            <path d="M220 200 L250 160 L280 180 L320 130" stroke="#2C5F57" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="320" cy="130" r="5" fill="#1B5E9E" />

            <rect x="60" y="185" width="120" height="45" rx="12" fill="#2C5F57" />
            <rect x="75" y="200" width="70" height="6" rx="3" fill="#FFFFFF" />
            <rect x="75" y="212" width="45" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  );
}