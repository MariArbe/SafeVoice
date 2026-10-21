import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

export default function LoginDocente() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/users/login/", {
        email: formData.username.trim(),
        password: formData.password,
      });

      if (response.data && response.data.access) {
        setIsLocked(false);
        localStorage.setItem("token", response.data.access);
        if (response.data.refresh) {
          localStorage.setItem("refresh_token", response.data.refresh);
        }
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/docente/menu");
      }
    } catch (err) {
      console.error("Error en login:", err);
      const isThrottle = err.response?.status === 429 || err.response?.data?.error?.code === "throttled";
      setIsLocked(isThrottle);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        "Correo electrónico o contraseña incorrectos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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

          {location.state?.message && !error && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{location.state.message}</span>
            </div>
          )}

          {error && (
            <div
              className={`border px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2.5 transition-all ${
                isLocked
                  ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {isLocked ? (
                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <div className="flex-1">
                {isLocked && <strong className="block text-amber-900 mb-0.5 font-bold">Bloqueo de Seguridad Anti Fuerza Bruta</strong>}
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo o Usuario</label>
              <input
                type="text"
                placeholder="Ingresa tu correo o usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent bg-slate-50/50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
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
              disabled={loading || isLocked}
              className={`w-full text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md mt-2 flex items-center justify-center gap-2 ${
                isLocked
                  ? "bg-slate-400 cursor-not-allowed opacity-80"
                  : "bg-[#1B5E9E] hover:bg-[#154a7d] active:scale-[0.99] hover:shadow-lg cursor-pointer disabled:opacity-50"
              }`}
            >
              <span>
                {loading
                  ? "Iniciando sesión..."
                  : isLocked
                  ? "Acceso bloqueado temporalmente"
                  : "Ingresar al Portal"}
              </span>
              {!loading && !isLocked && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
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