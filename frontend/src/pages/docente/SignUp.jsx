import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../services/userService";

export default function RegistroDocente() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    rol: "ORIENTADOR",
    password: "",
    password_confirmacion: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpia el error del campo específico si existía
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const getFieldError = (fieldName) => {
    if (!errors || !errors[fieldName]) return null;
    const fieldError = errors[fieldName];
    if (Array.isArray(fieldError)) {
      return fieldError.join(" ");
    }
    return fieldError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setSuccessMessage("");

    // Validación básica del lado del cliente
    if (formData.password !== formData.password_confirmacion) {
      setErrors({ password_confirmacion: "Las contraseñas no coinciden." });
      return;
    }

    setIsLoading(true);

    try {
      await userService.crearUsuario(formData);
      setSuccessMessage("¡Cuenta registrada con éxito! Redirigiendo al inicio de sesión...");
      
      setTimeout(() => {
        navigate("/docente/login", {
          state: { message: "Registro exitoso. Inicia sesión con tus credenciales." },
        });
      }, 1500);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data) {
          if (data.detail && typeof data.detail === "string") {
            setGeneralError(data.detail);
          } else if (data.non_field_errors) {
            setGeneralError(
              Array.isArray(data.non_field_errors)
                ? data.non_field_errors.join(" ")
                : data.non_field_errors
            );
          } else {
            // Errores de validación por campo desde Django REST Framework
            setErrors(data);
          }
        } else if (status >= 500) {
          setGeneralError("Ocurrió un error interno en el servidor. Por favor, intenta más tarde.");
        } else {
          setGeneralError(
            data?.detail || data?.message || "Ocurrió un error inesperado al procesar el registro."
          );
        }
      } else {
        setGeneralError("No fue posible conectar con el servidor. Revisa tu conexión a internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#DCEAF7] font-sans text-slate-800">
      
      {/* Columna Izquierda: Formulario Registro */}
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
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-5">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block text-xs font-bold text-[#2C5F57] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Gestión Educativa
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E9E]">Crear una cuenta</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Completa tus datos para registrarte como personal docente o directivo.
            </p>
          </div>

          {/* Mensaje global de éxito */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mensaje global de error (500 o general) */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre*</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Ej. María"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full border ${
                    getFieldError("first_name") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                  } rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-slate-400 bg-slate-50/50 focus:bg-white`}
                  required
                  disabled={isLoading}
                />
                {getFieldError("first_name") && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("first_name")}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Apellidos*</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Ej. Arbeláez"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full border ${
                    getFieldError("last_name") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                  } rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-slate-400 bg-slate-50/50 focus:bg-white`}
                  required
                  disabled={isLoading}
                />
                {getFieldError("last_name") && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("last_name")}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo electrónico*</label>
              <input
                type="email"
                name="email"
                placeholder="ejemplo@colegio.edu.co"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border ${
                  getFieldError("email") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                } rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-slate-400 bg-slate-50/50 focus:bg-white`}
                required
                disabled={isLoading}
              />
              {getFieldError("email") && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("email")}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol institucional*</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className={`w-full border ${
                  getFieldError("rol") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                } rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50/50 focus:bg-white text-slate-700 font-medium`}
                required
                disabled={isLoading}
              >
                <option value="ORIENTADOR">Orientador(a)</option>
                <option value="DIRECTIVO">Directivo / Coordinación</option>
              </select>
              {getFieldError("rol") && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("rol")}</p>
              )}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña*</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border ${
                    getFieldError("password") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                  } rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50/50 focus:bg-white`}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                {getFieldError("password") && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("password")}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar contraseña*</label>
                <input
                  type="password"
                  name="password_confirmacion"
                  placeholder="••••••••"
                  value={formData.password_confirmacion}
                  onChange={handleChange}
                  className={`w-full border ${
                    getFieldError("password_confirmacion") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                  } rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50/50 focus:bg-white`}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                {getFieldError("password_confirmacion") && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("password_confirmacion")}</p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">La contraseña debe tener al menos 8 caracteres.</p>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#1B5E9E] hover:bg-[#154a7d] active:scale-[0.99] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg mt-3 cursor-pointer flex items-center justify-center gap-2 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Comenzar Registro</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/docente/login" className="text-[#1B5E9E] font-bold hover:underline">
              Inicia sesión aquí
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