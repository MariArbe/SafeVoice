import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import institucionService from "../../services/institucionService";

export default function RegistroDocente() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    rol: "ORIENTADOR",
    institution_id: "",
    password: "",
    password_confirmacion: "",
  });

  const [instituciones, setInstituciones] = useState([]);
  const [cargandoInstituciones, setCargandoInstituciones] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cargarInstituciones = async () => {
      try {
        const data = await institucionService.listarInstitucionesActivas();
        if (isMounted) {
          const lista = Array.isArray(data) ? data : (data.results || []);
          setInstituciones(lista);
          if (lista.length > 0) {
            setFormData(prev => ({
              ...prev,
              institution_id: prev.institution_id || String(lista[0].id)
            }));
          }
        }
      } catch (err) {
        console.warn("No se pudo cargar el catálogo de instituciones:", err);
        if (isMounted) {
          const fallback = [{ id: 1, nombre: "Colegio de la UPB", ciudad: "Medellín" }];
          setInstituciones(fallback);
          setFormData(prev => ({
            ...prev,
            institution_id: prev.institution_id || "1"
          }));
        }
      } finally {
        if (isMounted) setCargandoInstituciones(false);
      }
    };

    cargarInstituciones();
    return () => { isMounted = false; };
  }, []);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpia el error del campo específico si existía
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    // Limpia el mensaje global para que no quede un error obsoleto visible
    if (generalError) {
      setGeneralError("");
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
      const payload = {
        ...formData,
        institution_id: formData.institution_id ? parseInt(formData.institution_id, 10) : undefined,
      };
      await userService.crearUsuario(payload);
      setSuccessMessage("¡Cuenta registrada con éxito! Redirigiendo al inicio de sesión...");
      
      setTimeout(() => {
        navigate("/docente/login", {
          state: { message: "Registro exitoso. Inicia sesión con tus credenciales." },
        });
      }, 1500);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        const errorObj = data?.error || data;
        const fieldDetails = errorObj?.details || (typeof data === "object" && !data?.error ? data : null);
        const generalMsg = errorObj?.message || data?.detail || data?.message;

        if (fieldDetails && typeof fieldDetails === "object" && Object.keys(fieldDetails).length > 0) {
          setErrors(fieldDetails);
          if (fieldDetails.non_field_errors) {
            setGeneralError(
              Array.isArray(fieldDetails.non_field_errors)
                ? fieldDetails.non_field_errors.join(" ")
                : fieldDetails.non_field_errors
            );
          } else if (generalMsg) {
            setGeneralError(generalMsg);
          }
        } else if (generalMsg && typeof generalMsg === "string") {
          setGeneralError(generalMsg);
        } else if (status >= 500) {
          setGeneralError("Ocurrió un error interno en el servidor. Por favor, intenta más tarde.");
        } else {
          setGeneralError("Ocurrió un error inesperado al procesar el registro.");
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

            {/* Institución Educativa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institución Educativa*</label>
              <div className="relative">
                <select
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleChange}
                  required
                  disabled={isLoading || cargandoInstituciones}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] focus:border-transparent bg-slate-50/50 focus:bg-white text-slate-800 appearance-none cursor-pointer pr-10"
                >
                  <option value="" disabled>
                    {cargandoInstituciones ? "Cargando instituciones..." : "Selecciona tu institución educativa..."}
                  </option>
                  {instituciones.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nombre} {inst.ciudad ? `(${inst.ciudad})` : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rol Unificado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol institucional</label>
              <div className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-700 font-semibold flex items-center justify-between">
                <span>Docente / Orientador(a) Escolar</span>
                <span className="text-[10px] bg-[#DCEAF7] text-[#1B5E9E] font-bold px-2 py-0.5 rounded-md">Acceso Completo</span>
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña*</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${
                      getFieldError("password") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                    } rounded-xl pl-3.5 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50/50 focus:bg-white`}
                    required
                    minLength={8}
                    disabled={isLoading}
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
                {getFieldError("password") && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{getFieldError("password")}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar contraseña*</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmacion"
                    placeholder="••••••••"
                    value={formData.password_confirmacion}
                    onChange={handleChange}
                    className={`w-full border ${
                      getFieldError("password_confirmacion") ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#1B5E9E]"
                    } rounded-xl pl-3.5 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50/50 focus:bg-white`}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
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