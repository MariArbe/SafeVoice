import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginDocente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", rememberMe: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí conectaremos con la API más adelante
    navigate("/docente/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Columna Izquierda: Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16">
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Logo SafeVoice */}
          <div className="flex justify-center mb-6">
            <svg className="w-12 h-12 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Log in to your account</h1>
            <p className="text-sm text-slate-500">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0088CC] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0088CC] focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-slate-300 text-[#0088CC] focus:ring-[#0088CC]"
                />
                Remember Me
              </label>
              <a href="#" className="text-[#0088CC] font-medium hover:underline">
                Forgot password
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0088CC] hover:bg-[#0077B5] text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don’t have an account?{" "}
            <Link to="/docente/registro" className="text-[#0088CC] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha: Hero / Ilustración */}
      <div className="w-full md:w-1/2 bg-[#DCEAF7] flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[#1B5E9E]">
            Welcome to <span className="text-slate-800">Teacher’s Portal</span>
          </h2>
          <p className="text-sm font-semibold text-[#2C5F57]">SafeVoice</p>
        </div>

        {/* Ilustración SVG estilo Figma */}
        <div className="w-full max-w-lg bg-white/40 p-6 rounded-3xl backdrop-blur-xs border border-white/60 shadow-xs flex justify-center">
          <svg className="w-full h-auto max-h-80 text-[#1B5E9E]" viewBox="0 0 400 300" fill="none">
            <rect x="50" y="30" width="300" height="220" rx="12" fill="#FFFFFF" />
            <rect x="50" y="30" width="300" height="24" fill="#0A2540" rx="4" />
            <circle cx="70" cy="42" r="4" fill="#FF5F56" />
            <circle cx="85" cy="42" r="4" fill="#FFBD2E" />
            <circle cx="100" cy="42" r="4" fill="#27C93F" />
            {/* Personaje docente con lápiz */}
            <path d="M220 120 L300 220 L280 230 L200 130 Z" fill="#E63946" />
            <path d="M190 230 C190 170 230 150 250 140 C270 170 250 230 250 230 Z" fill="#2A6FDB" />
            <circle cx="250" cy="120" r="16" fill="#1D2A44" />
          </svg>
        </div>
      </div>
    </div>
  );
}