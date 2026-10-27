import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import NavbarPublico from "../../components/ui/NavbarPublico";
import reporteService from "../../services/reporteService";
import institucionService from "../../services/institucionService";

export default function Reporte() {
  const navigate = useNavigate();
  const [aceptaRevelar, setAceptaRevelar] = useState(false);
  const [tipoContacto, setTipoContacto] = useState("celular"); // "celular" | "correo"
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    institucion: "",
    rol_reportante: "",
    grado: "",
    ubicacion: [],
    frecuencia: "",
    tipo_agresion: [],
    descripcion: "",
    nombre_contacto_victima: "",
    medio_contacto_victima: "",
    involucrados_grado: "",
  });

  const [instituciones, setInstituciones] = useState([]);
  const [cargandoInstituciones, setCargandoInstituciones] = useState(true);

  // Cargar catálogo público de instituciones activas (HU-01)
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
              institucion: prev.institucion || String(lista[0].id)
            }));
          }
        }
      } catch (err) {
        console.warn("No se pudo cargar el catálogo de instituciones, usando respaldo:", err);
        if (isMounted) {
          const fallback = [{ id: 1, nombre: "Colegio de la UPB", ciudad: "Medellín" }];
          setInstituciones(fallback);
          setFormData(prev => ({
            ...prev,
            institucion: prev.institucion || "1"
          }));
        }
      } finally {
        if (isMounted) setCargandoInstituciones(false);
      }
    };

    cargarInstituciones();
    return () => { isMounted = false; };
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successCode, setSuccessCode] = useState(null);
  const [nivelRiesgo, setNivelRiesgo] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Estado para la evidencia adjunta (HU-02 / Archivos de Evidencia)
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [previewEvidencia, setPreviewEvidencia] = useState(null);
  const [archivoError, setArchivoError] = useState(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox" && name === "ubicacion") {
      setFormData(prev => {
        const actual = Array.isArray(prev.ubicacion) ? prev.ubicacion : (prev.ubicacion ? [prev.ubicacion] : []);
        if (checked) return { ...prev, ubicacion: [...actual, value] };
        return { ...prev, ubicacion: actual.filter(u => u !== value) };
      });
    } else if (type === "checkbox" && name === "tipo_agresion") {
      setFormData(prev => {
        if (checked) return { ...prev, tipo_agresion: [...prev.tipo_agresion, value] };
        return { ...prev, tipo_agresion: prev.tipo_agresion.filter(t => t !== value) };
      });
    } else if (name === "medio_contacto_victima" && tipoContacto === "celular") {
      // Filtrar estrictamente dígitos numéricos y limitar a 10 caracteres
      const soloDigitos = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, medio_contacto_victima: soloDigitos }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setArchivoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Límite de 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setArchivoError("El archivo supera el tamaño máximo permitido de 10 MB.");
      e.target.value = "";
      return;
    }

    setArchivoEvidencia(file);

    // Si es imagen, generar vista previa
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPreviewEvidencia(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewEvidencia(null);
    }
  };

  const handleEliminarEvidencia = () => {
    setArchivoEvidencia(null);
    setPreviewEvidencia(null);
    setArchivoError(null);
    const inputEl = document.getElementById("evidencia");
    if (inputEl) inputEl.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación básica requerida en HU-01
    const institucionId = parseInt(formData.institucion, 10);
    if (!institucionId || isNaN(institucionId)) {
      setError("Por favor selecciona tu institución educativa.");
      return;
    }
    const ubicacionesSeleccionadas = Array.isArray(formData.ubicacion)
      ? formData.ubicacion
      : (formData.ubicacion ? [formData.ubicacion] : []);

    if (ubicacionesSeleccionadas.length === 0) {
      setError("Debes seleccionar al menos un lugar donde ocurrió la situación.");
      return;
    }
    if (!formData.descripcion || formData.descripcion.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres.");
      return;
    }
    if (formData.tipo_agresion.length === 0) {
      setError("Debes seleccionar al menos un tipo de situación.");
      return;
    }

    // Validación estricta de datos de contacto si el estudiante acepta revelar su identidad
    if (aceptaRevelar) {
      const nombreLimpio = (formData.nombre_contacto_victima || "").trim();
      const medioLimpio = (formData.medio_contacto_victima || "").trim();

      if (nombreLimpio.length < 3) {
        setError("Si aceptas revelar tu identidad, debes escribir tu nombre completo (mínimo 3 caracteres).");
        return;
      }

      if (tipoContacto === "celular") {
        const soloDigitos = medioLimpio.replace(/\D/g, "");
        if (!/^3\d{9}$/.test(soloDigitos)) {
          setError("En Colombia el número de celular debe iniciar con 3 y tener exactamente 10 dígitos (ej. 3001234567).");
          return;
        }
        if (new Set(soloDigitos.slice(1)).size === 1) {
          setError("Por favor ingresa un número de celular real y válido.");
          return;
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(medioLimpio)) {
          setError("Por favor ingresa un correo electrónico válido (ej. estudiante@colegio.edu.co).");
          return;
        }
      }
    }

    setLoading(true);
    try {
      let evidenciaUrl = null;

      // 1. Si el estudiante adjuntó archivo de evidencia, cargarlo de forma anónima
      if (archivoEvidencia) {
        setSubiendoArchivo(true);
        try {
          const uploadRes = await reporteService.subirEvidencia(archivoEvidencia);
          evidenciaUrl = uploadRes.evidencia_url || uploadRes.url;
        } catch (uploadErr) {
          console.error("Error al subir archivo de evidencia:", uploadErr);
          const msg =
            uploadErr.response?.data?.error ||
            "No se pudo cargar el archivo de evidencia. Puedes retirarlo o verificar el formato e intentar nuevamente.";
          setError(typeof msg === "string" ? msg : JSON.stringify(msg));
          setLoading(false);
          setSubiendoArchivo(false);
          return;
        } finally {
          setSubiendoArchivo(false);
        }
      }

      // Mapear opciones del formulario a los códigos canónicos del backend
      const agressionMap = {
        'Me pegaron, empujaron o lastimaron (o a mi compañero/a)': 'FISICA',
        'Me quitaron, escondieron o dañaron cosas': 'MATERIAL',
        'Insultos, gritos o apodos ofensivos': 'VERBAL',
        'Inventaron chismes, amenazaron o me excluyeron del grupo': 'EXCLUSION',
        'Ciberacoso (Mensajes, fotos sin permiso, redes sociales)': 'CIBERBULLYING'
      };

      const payload = {
        institucion: institucionId,
        ubicacion: ubicacionesSeleccionadas.join(", "),
        frecuencia: formData.frecuencia,
        grado_victima: formData.grado,
        involucrados_tipo: formData.rol_reportante,
        involucrados_grado: formData.involucrados_grado,
        descripcion: formData.descripcion,
        tipos_agresion: formData.tipo_agresion.map(t => agressionMap[t]).filter(Boolean),
        acepta_revelar_identidad: aceptaRevelar,
        nombre_contacto_victima: aceptaRevelar ? formData.nombre_contacto_victima : null,
        medio_contacto_victima: aceptaRevelar ? formData.medio_contacto_victima : null,
        evidencia_url: evidenciaUrl,
      };

      const response = await reporteService.crearReporte(payload);
      setSuccessCode(response.codigo_seguimiento);
      setNivelRiesgo(response.nivel_riesgo_predicho);
    } catch (err) {
      console.error("Detalle del error:", err);
      if (err.message === "Network Error") {
        setError("Error de conexión: El servidor (backend) no parece estar en ejecución.");
      } else if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          setError(data);
        } else if (data.error?.details && typeof data.error.details === "object") {
          const mensajes = Object.values(data.error.details)
            .map((errs) => (Array.isArray(errs) ? errs.join(", ") : errs))
            .join(" | ");
          setError(mensajes || data.error.message || "Verifica los datos ingresados.");
        } else if (data.error?.message) {
          setError(data.error.message);
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          setError(data.non_field_errors.join(" "));
        } else if (typeof data === "object") {
          const mensajes = Object.entries(data)
            .map(([campo, errs]) => `${campo}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
            .join(" | ");
          setError(`Por favor verifica la información ingresada: ${mensajes}`);
        } else {
          setError("Error al procesar el reporte en el servidor. Intenta nuevamente.");
        }
      } else {
        setError("Error al enviar el reporte. Revisa los datos e intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarCodigo = async () => {
    if (!successCode) return;
    try {
      await navigator.clipboard.writeText(successCode);
      setCodigoCopiado(true);
      setTimeout(() => setCodigoCopiado(false), 3000);
    } catch {
      // Fallback manual para navegadores restrictivos
      const textarea = document.createElement("textarea");
      textarea.value = successCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCodigoCopiado(true);
      setTimeout(() => setCodigoCopiado(false), 3000);
    }
  };

  if (successCode) {
    return (
      <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
        <NavbarPublico />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-emerald-100 max-w-xl w-full">
            <div className="w-20 h-20 bg-emerald-100/80 text-[#2C5F57] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-[#2C5F57] mb-3">¡Reporte Enviado con Éxito!</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Gracias por tu valentía. Tu reporte ha sido guardado de forma 100% confidencial.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 shadow-xs">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Tu código de seguimiento es:</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
                <p className="text-lg sm:text-xl font-mono font-extrabold text-[#1B5E9E] break-all select-all tracking-wider bg-white py-2.5 px-4 rounded-xl border border-slate-200 shadow-2xs">
                  {successCode}
                </p>
                <button
                  type="button"
                  onClick={handleCopiarCodigo}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 ${
                    codigoCopiado
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1B5E9E] hover:bg-[#154a7d] text-white"
                  }`}
                  title="Copiar código al portapapeles"
                >
                  {codigoCopiado ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-2 pt-4 border-t border-slate-200 text-left flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#2C5F57] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#2C5F57] uppercase tracking-wider">
                    Ruta de Atención Escolar Activada
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {aceptaRevelar
                      ? "Tu caso ya fue priorizado para Orientación Escolar. Como autorizaste compartir tu contacto, un profesional se comunicará contigo de forma privada y segura."
                      : "Tu caso ya fue priorizado automáticamente para Orientación Escolar. Tu identidad permanece 100% anónima en todo momento."}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-8 max-w-md mx-auto">
              Guarda este código o toma una captura de pantalla. Con él podrás consultar el estado de tu reporte más adelante sin revelar tu identidad.
            </p>
            <Boton
              variant="primary"
              onClick={() => navigate(`/consultar?codigo=${encodeURIComponent(successCode)}`)}
              fullWidth
              className="mb-3 py-3.5 text-base font-bold shadow-md !bg-[#1B5E9E] hover:!bg-[#154a7d] rounded-xl cursor-pointer"
            >
              Consultar Estado de mi Reporte
            </Boton>
            <Boton variant="primary" onClick={() => navigate("/")} fullWidth className="py-3.5 text-base font-bold shadow-md !bg-[#2C5F57] hover:!bg-[#234c45] rounded-xl cursor-pointer">
              Volver al Inicio
            </Boton>
          </div>
        </main>

        <footer className="bg-white/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80 gap-2">
          <span>SafeVoice &bull; Plataforma Anónima de Convivencia Escolar</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      <NavbarPublico />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8 text-center space-y-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold tracking-wide uppercase shadow-2xs backdrop-blur-xs">
            <svg className="w-4 h-4 text-[#2C5F57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Espacio 100% Confidencial
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E9E]">
            Crear Reporte Anónimo
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Este espacio es seguro. Nadie sabrá quién eres a menos que decidas identificarte voluntariamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80 space-y-9">
          
          {/* A. Institución Educativa */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">A</span>
              <h2 className="text-lg font-bold text-slate-800">Tu Institución</h2>
            </div>
            <div className="max-w-md">
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="institucion" className="text-sm font-medium text-slate-700">
                  ¿A cuál colegio o institución perteneces? <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="institucion"
                    name="institucion"
                    value={formData.institucion}
                    onChange={handleInputChange}
                    required
                    disabled={cargandoInstituciones}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-[#1B5E9E] focus:outline-none focus:ring-1 focus:ring-[#1B5E9E] appearance-none cursor-pointer pr-10"
                  >
                    <option value="" disabled>
                      {cargandoInstituciones ? "Cargando instituciones disponibles..." : "Selecciona tu institución educativa..."}
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
                <p className="text-[11px] text-slate-500">
                  Selecciona la institución donde ocurren los hechos para asignar el reporte al equipo de convivencia correspondiente.
                </p>
              </div>
            </div>
          </section>

          {/* B. Rol de quien reporta */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">B</span>
              <h2 className="text-lg font-bold text-slate-800">Perspectiva</h2>
            </div>
            <p className="text-sm text-slate-600">¿Esta situación te está pasando a ti o la estás presenciando en otra persona?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={`flex-1 flex items-center gap-3 cursor-pointer p-3.5 border rounded-2xl transition-all ${formData.rol_reportante === 'victima' ? 'border-[#2C5F57] bg-emerald-50/40 ring-1 ring-[#2C5F57]' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="rol_reportante" className="w-4 h-4 accent-[#2C5F57]" value="victima" onChange={handleInputChange} required />
                <span className="text-sm font-medium text-slate-700">Me está pasando a mí (Soy la víctima)</span>
              </label>
              <label className={`flex-1 flex items-center gap-3 cursor-pointer p-3.5 border rounded-2xl transition-all ${formData.rol_reportante === 'testigo' ? 'border-[#2C5F57] bg-emerald-50/40 ring-1 ring-[#2C5F57]' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="rol_reportante" className="w-4 h-4 accent-[#2C5F57]" value="testigo" onChange={handleInputChange} required />
                <span className="text-sm font-medium text-slate-700">Lo vi / le pasa a un compañero(a) (Soy testigo)</span>
              </label>
            </div>
          </section>

          {/* C. Grados o Cursos */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">C</span>
              <h2 className="text-lg font-bold text-slate-800">Grados o Cursos</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo 
                label="¿En qué grado o curso está la persona afectada?" 
                name="grado"
                placeholder="Ej. 8°, Noveno, 11A..."
                value={formData.grado}
                onChange={handleInputChange}
                required 
              />
              <Campo 
                label="¿De qué grado son las personas que agreden?" 
                name="involucrados_grado"
                placeholder="Ej. Mismo grado, 10°, No sé..."
                value={formData.involucrados_grado}
                onChange={handleInputChange}
                required 
              />
            </div>
          </section>

          {/* D. Ubicación */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">D</span>
              <h2 className="text-lg font-bold text-slate-800">Ubicación</h2>
            </div>
            <p className="text-sm text-slate-600">
              ¿Dónde ocurrió la situación? <span className="text-xs text-slate-500 font-medium">(Puedes marcar varias opciones)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Salón de clases',
                'Pasillos o escaleras',
                'Baños',
                'Descanso / zonas deportivas',
                'Salida del colegio',
                'Internet / Redes sociales',
                'Otro'
              ].map((lugar) => {
                const isSelected = Array.isArray(formData.ubicacion)
                  ? formData.ubicacion.includes(lugar)
                  : formData.ubicacion === lugar;
                return (
                  <label
                    key={lugar}
                    className={`flex items-center gap-3 cursor-pointer p-3.5 border rounded-2xl transition-all ${
                      isSelected
                        ? 'border-[#2C5F57] bg-emerald-50/40 ring-1 ring-[#2C5F57]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="ubicacion"
                      className="w-4 h-4 accent-[#2C5F57] rounded cursor-pointer"
                      value={lugar}
                      checked={isSelected}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm font-medium text-slate-700">{lugar}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* E. Frecuencia */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">E</span>
              <h2 className="text-lg font-bold text-slate-800">Frecuencia</h2>
            </div>
            <p className="text-sm text-slate-600">¿Hace cuánto tiempo está pasando esto?</p>
            <div className="flex flex-col gap-3">
              {['Pasó hoy o es la primera vez', 'Lleva pasando algunas semanas', 'Lleva pasando varios meses'].map((frecuencia) => (
                <label key={frecuencia} className={`flex items-center gap-3 cursor-pointer p-3.5 border rounded-2xl transition-all ${formData.frecuencia === frecuencia ? 'border-[#2C5F57] bg-emerald-50/40 ring-1 ring-[#2C5F57]' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="frecuencia" className="w-4 h-4 accent-[#2C5F57]" value={frecuencia} onChange={handleInputChange} required />
                  <span className="text-sm font-medium text-slate-700">{frecuencia}</span>
                </label>
              ))}
            </div>
          </section>

          {/* F. Tipo de Agresión */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">F</span>
              <h2 className="text-lg font-bold text-slate-800">¿Qué fue lo que pasó?</h2>
            </div>
            <p className="text-sm text-slate-600">Puedes marcar varias opciones</p>
            <div className="flex flex-col gap-3">
              {[
                'Me pegaron, empujaron o lastimaron (o a mi compañero/a)',
                'Me quitaron, escondieron o dañaron cosas',
                'Insultos, gritos o apodos ofensivos',
                'Inventaron chismes, amenazaron o me excluyeron del grupo',
                'Ciberacoso (Mensajes, fotos sin permiso, redes sociales)'
              ].map((tipo) => {
                const isSelected = formData.tipo_agresion.includes(tipo);
                return (
                  <label key={tipo} className={`flex items-center gap-3 cursor-pointer p-3.5 border rounded-2xl transition-all ${isSelected ? 'border-[#2C5F57] bg-emerald-50/40 ring-1 ring-[#2C5F57]' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="checkbox" name="tipo_agresion" className="w-4 h-4 accent-[#2C5F57] rounded" value={tipo} onChange={handleInputChange} />
                    <span className="text-sm font-medium text-slate-700">{tipo}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* G. Descripción Abierta */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">G</span>
              <h2 className="text-lg font-bold text-slate-800">Cuéntanos qué pasó</h2>
            </div>
            <div className="space-y-1.5">
              <Campo 
                isTextArea={true}
                rows={5}
                name="descripcion"
                placeholder="Escribe aquí lo que pasó sin decir tu nombre. Por ejemplo: Ayer en el recreo acorralaron a mi amigo y le dijeron que..."
                value={formData.descripcion}
                onChange={handleInputChange}
                required 
              />
              <div className="flex justify-between items-center text-xs px-1">
                <span className={formData.descripcion.length >= 10 ? "text-emerald-700 font-semibold flex items-center gap-1" : "text-slate-500"}>
                  {formData.descripcion.length >= 10 ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-600 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Longitud adecuada para análisis</span>
                    </>
                  ) : (
                    `Mínimo 10 caracteres (faltan ${Math.max(0, 10 - formData.descripcion.length)})`
                  )}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {formData.descripcion.length} caracteres
                </span>
              </div>
            </div>
          </section>

          {/* H. Evidencia */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">H</span>
              <h2 className="text-lg font-bold text-slate-800">Evidencia (opcional)</h2>
            </div>
            <p className="text-sm text-slate-600">
              Si tienes capturas de pantalla, fotos, audios o documentos que demuestren la situación, puedes adjuntarlos. El sistema eliminará automáticamente cualquier metadato personal o nombre de archivo para proteger tu identidad.
            </p>

            {!archivoEvidencia ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-50 hover:border-[#1B5E9E]/40 transition-all cursor-pointer">
                <input
                  id="evidencia"
                  name="evidencia"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt,.mp3,.wav,.mp4"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1B5E9E] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#154a7d] cursor-pointer"
                />
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Formatos: imágenes (JPG, PNG, WebP), PDF, Word o audio (hasta 10 MB). 100% confidencial.</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1B5E9E] flex items-center justify-center shrink-0 text-lg">
                      {archivoEvidencia.type.startsWith("image/") ? "🖼️" : archivoEvidencia.type.includes("pdf") ? "📄" : "📎"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate" title={archivoEvidencia.name}>
                        {archivoEvidencia.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(archivoEvidencia.size / (1024 * 1024)).toFixed(2) > 0.05
                          ? `${(archivoEvidencia.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${Math.round(archivoEvidencia.size / 1024)} KB`}
                        {" • "}
                        <span className="text-emerald-700 font-semibold">Listo para adjuntar de forma anónima</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEliminarEvidencia}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Quitar
                  </button>
                </div>

                {previewEvidencia && (
                  <div className="pt-2 border-t border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vista previa de imagen:</p>
                    <div className="max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2">
                      <img
                        src={previewEvidencia}
                        alt="Vista previa de evidencia"
                        className="max-h-44 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400">🛡️</span>
                  <span>El nombre original del archivo se reemplazará por un código seguro en el servidor para evitar que tu identidad sea descubierta.</span>
                </div>
              </div>
            )}

            {archivoError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {archivoError}
              </p>
            )}
          </section>

          {/* I. Revelación Voluntaria */}
          <section className="space-y-4 bg-[#DCEAF7]/30 p-6 rounded-3xl border border-[#1B5E9E]/20 mt-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 text-[#1B5E9E] mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Protección de tu identidad</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Este reporte es 100% anónimo. Sin embargo, si consideras que el caso es muy grave y quieres que el orientador te contacte directamente, puedes marcar esta casilla:
                </p>
                
                <label className="flex items-center gap-3 cursor-pointer mt-4 select-none">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-[#2C5F57] rounded cursor-pointer"
                    checked={aceptaRevelar}
                    onChange={(e) => setAceptaRevelar(e.target.checked)}
                  />
                  <span className="text-xs font-bold text-[#1B5E9E]">Por la gravedad del caso, acepto revelar mi identidad para recibir ayuda directa.</span>
                </label>
              </div>
            </div>

            {aceptaRevelar && (
              <div className="space-y-4 mt-4 pt-4 border-t border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    ¿Por qué medio prefieres que el orientador te contacte?
                  </span>
                  <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs self-start">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoContacto("celular");
                        setFormData(prev => ({
                          ...prev,
                          medio_contacto_victima: (prev.medio_contacto_victima || "").replace(/\D/g, "").slice(0, 10)
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tipoContacto === "celular"
                          ? "bg-[#1B5E9E] text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📱 Celular / WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTipoContacto("correo");
                        if (/^\d+$/.test(formData.medio_contacto_victima || "")) {
                          setFormData(prev => ({ ...prev, medio_contacto_victima: "" }));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tipoContacto === "correo"
                          ? "bg-[#1B5E9E] text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ✉️ Correo Electrónico
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Campo 
                      label="Nombre completo" 
                      placeholder="Ej. Juan Camilo Pérez" 
                      name="nombre_contacto_victima"
                      value={formData.nombre_contacto_victima}
                      onChange={handleInputChange}
                      required={aceptaRevelar}
                    />
                    {formData.nombre_contacto_victima.trim().length > 0 && formData.nombre_contacto_victima.trim().length < 3 && (
                      <p className="text-[11px] text-rose-600 font-medium px-1">
                        Ingresa al menos 3 caracteres para tu nombre.
                      </p>
                    )}
                  </div>

                  {tipoContacto === "celular" ? (
                    <div className="space-y-1">
                      <Campo 
                        label="Número de celular (Colombia)" 
                        placeholder="Ej. 3001234567 (10 dígitos)" 
                        name="medio_contacto_victima"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.medio_contacto_victima}
                        onChange={handleInputChange}
                        required={aceptaRevelar}
                      />
                      <div className="flex items-center justify-between text-[11px] px-1">
                        {!formData.medio_contacto_victima ? (
                          <span className="text-slate-500">Debe iniciar con 3 y tener 10 dígitos.</span>
                        ) : !formData.medio_contacto_victima.startsWith("3") ? (
                          <span className="text-rose-600 font-semibold">En Colombia el celular debe iniciar con 3.</span>
                        ) : formData.medio_contacto_victima.length < 10 ? (
                          <span className="text-amber-700 font-medium">
                            Faltan {10 - formData.medio_contacto_victima.length} dígito(s) para completar los 10.
                          </span>
                        ) : new Set(formData.medio_contacto_victima.slice(1)).size === 1 ? (
                          <span className="text-rose-600 font-semibold">Ingresa un número de celular real.</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">✓ Celular colombiano válido</span>
                        )}
                        <span className="font-mono text-slate-400">
                          {formData.medio_contacto_victima.length}/10
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Campo 
                        label="Correo electrónico" 
                        placeholder="Ej. estudiante@colegio.edu.co" 
                        name="medio_contacto_victima"
                        type="email"
                        value={formData.medio_contacto_victima}
                        onChange={handleInputChange}
                        required={aceptaRevelar}
                      />
                      <div className="text-[11px] px-1">
                        {!formData.medio_contacto_victima ? (
                          <span className="text-slate-500">Ingresa un correo activo donde podamos escribirte.</span>
                        ) : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.medio_contacto_victima.trim()) ? (
                          <span className="text-emerald-700 font-semibold">✓ Formato de correo válido</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Escribe un correo válido (ej. nombre@correo.com).</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Boton variant="primary" type="submit" fullWidth disabled={loading} className="py-3.5 text-base font-bold shadow-md !bg-[#2C5F57] hover:!bg-[#234c45] rounded-xl transition-all cursor-pointer">
              {loading
                ? (subiendoArchivo ? "Subiendo y anonimizando evidencia..." : "Enviando de forma segura...")
                : "Enviar Reporte Seguro"}
            </Boton>
          </div>
        </form>
      </main>
      
      {/* Footer Unificado */}
      <footer className="bg-white/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80 gap-2">
        <span>SafeVoice &bull; Plataforma Anónima de Convivencia Escolar</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
