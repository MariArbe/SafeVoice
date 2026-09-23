import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegistroDocente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", username: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tras registrarse, redirige al login
    navigate("/docente/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Columna Izquierda: Formulario Registro */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16">
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Logo SafeVoice */}
          <div className="flex justify-center mb-4">
            <Link to="/" className="flex items-center gap-3 group">
              <svg className="w-12 h-12 text-[#1B5E9E] group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </Link>
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900">Crear una cuenta</h1>
            <p className="text-sm text-slate-500">Completa tus datos para registrarte como docente.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nombre completo*</label>
              <input
                type="text"
                placeholder="Ej. María Arbeláez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nombre de usuario*</label>
              <input
                type="text"
                placeholder="Ej. marbelarez"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contraseña*</label>
              <input
                type="password"
                placeholder="Crea una contraseña segura"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-[11px] text-slate-400 mt-1">Debe contener al menos 8 caracteres.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B5E9E] hover:bg-[#154a7d] active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm mt-4 cursor-pointer"
            >
              Comenzar
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/docente/login" className="text-[#1B5E9E] font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha: Panel Lateral */}
      <div className="w-full md:w-1/2 bg-[#DCEAF7] flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[#1B5E9E]">
            Portal de <span className="text-slate-800">Docentes y Directivos</span>
          </h2>
          <p className="text-sm font-semibold text-[#2C5F57]">SafeVoice</p>
        </div>

        {/* Ilustración SVG */}
        <div className="w-full max-w-lg bg-white/50 p-6 rounded-3xl backdrop-blur-xs border border-white/60 shadow-sm flex justify-center">
          <svg className="w-full h-auto max-h-80 text-[#1B5E9E]" viewBox="0 0 400 300" fill="none">
            <rect x="50" y="30" width="300" height="220" rx="12" fill="#FFFFFF" />
            <rect x="50" y="30" width="300" height="24" fill="#0A2540" rx="4" />
            <circle cx="70" cy="42" r="4" fill="#FF5F56" />
            <circle cx="85" cy="42" r="4" fill="#FFBD2E" />
            <circle cx="100" cy="42" r="4" fill="#27C93F" />
            <path d="M220 120 L300 220 L280 230 L200 130 Z" fill="#E63946" />
            <path d="M190 230 C190 170 230 150 250 140 C270 170 250 230 250 230 Z" fill="#2A6FDB" />
            <circle cx="250" cy="120" r="16" fill="#1D2A44" />
          </svg>
        </div>
      </div>
    </div>
  );
}