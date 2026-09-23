import { useState } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import reporteService from "../../services/reporteService";

export default function Reporte() {
  const [aceptaRevelar, setAceptaRevelar] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    institucion: "",
    rol_reportante: "",
    grado: "",
    ubicacion: "",
    frecuencia: "",
    tipo_agresion: [],
    descripcion: "",
    nombre_contacto_victima: "",
    medio_contacto_victima: "",
    involucrados_grado: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successCode, setSuccessCode] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox" && name === "tipo_agresion") {
      setFormData(prev => {
        if (checked) return { ...prev, tipo_agresion: [...prev.tipo_agresion, value] };
        return { ...prev, tipo_agresion: prev.tipo_agresion.filter(t => t !== value) };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación básica requerida en HU-01
    if (!formData.descripcion || formData.descripcion.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres.");
      return;
    }
    if (formData.tipo_agresion.length === 0) {
      setError("Debes seleccionar al menos un tipo de situación.");
      return;
    }

    setLoading(true);
    try {
      // Map tipos_agresion strings to IDs matching the DB seed
      const agressionMap = {
        'Me pegaron, empujaron o lastimaron (o a mi compañero/a)': 1,
        'Me quitaron, escondieron o dañaron cosas': 2,
        'Insultos, gritos o apodos ofensivos': 3,
        'Inventaron chismes, amenazaron o me excluyeron del grupo': 4,
        'Ciberacoso (Mensajes, fotos sin permiso, redes sociales)': 5
      };

      const payload = {
        institucion: 1, // Por ahora forzamos la institución 1 (UPB) que está en la base de datos
        ubicacion: formData.ubicacion,
        frecuencia: formData.frecuencia,
        grado_victima: formData.grado,
        involucrados_tipo: formData.rol_reportante,
        involucrados_grado: formData.involucrados_grado,
        descripcion: formData.descripcion,
        tipos_agresion: formData.tipo_agresion.map(t => agressionMap[t]).filter(Boolean),
        acepta_revelar_identidad: aceptaRevelar,
        nombre_contacto_victima: aceptaRevelar ? formData.nombre_contacto_victima : null,
        medio_contacto_victima: aceptaRevelar ? formData.medio_contacto_victima : null,
      };

      const response = await reporteService.crearReporte(payload);
      setSuccessCode(response.codigo_seguimiento);
    } catch (err) {
      console.error("Detalle del error:", err);
      if (err.message === "Network Error") {
        setError("Error de conexión: El servidor (backend) no parece estar en ejecución.");
      } else if (err.response?.data) {
        // Mostrar el JSON crudo para ver la estructura exacta del error devuelto por Django
        setError(`Error del servidor: ${JSON.stringify(err.response.data)}`);
      } else {
        setError("Error al enviar el reporte. Revisa los datos e intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (successCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center text-center">
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
              <p className="text-2xl font-mono font-extrabold text-[#1B5E9E] break-all select-all tracking-wider bg-white py-2.5 px-4 rounded-xl border border-slate-200 inline-block shadow-2xs">
                {successCode}
              </p>
            </div>
            <p className="text-xs text-slate-500 mb-8 max-w-md mx-auto">
              Guarda este código en un lugar seguro. Con él podrás consultar el estado de tu reporte más adelante sin revelar tu identidad.
            </p>
            <Boton variant="primary" onClick={() => window.location.href = '/'} fullWidth className="py-3.5 text-base font-bold shadow-md !bg-[#2C5F57] hover:!bg-[#234c45] rounded-xl">
              Volver al Inicio
            </Boton>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2C5F57] text-xs font-bold tracking-wide uppercase">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Espacio 100% Confidencial
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C5F57]">
            Crear Reporte Anónimo
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
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
              <Campo 
                label="¿A cuál colegio o institución perteneces?" 
                name="institucion"
                placeholder="Busca tu colegio..."
                value={formData.institucion}
                onChange={handleInputChange}
                required 
              />
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
            <p className="text-sm text-slate-600">¿Dónde ocurrió la situación?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Salón de clases', 'Pasillos o escaleras', 'Baños', 'Descanso / zonas deportivas', 'Salida del colegio', 'Internet / Redes sociales'].map((lugar) => (
                <label key={lugar} className={`flex items-center gap-3 cursor-pointer p-3.5 border rounded-2xl transition-all ${formData.ubicacion === lugar ? 'border-[#2C5F57] bg-emerald-50/40 ring-1 ring-[#2C5F57]' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="ubicacion" className="w-4 h-4 accent-[#2C5F57]" value={lugar} onChange={handleInputChange} required />
                  <span className="text-sm font-medium text-slate-700">{lugar}</span>
                </label>
              ))}
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
            <Campo 
              isTextArea={true}
              rows={5}
              name="descripcion"
              placeholder="Escribe aquí lo que pasó sin decir tu nombre. Por ejemplo: Ayer en el recreo acorralaron a mi amigo y le dijeron que..."
              value={formData.descripcion}
              onChange={handleInputChange}
              required 
            />
          </section>

          {/* H. Evidencia */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-[#DCEAF7] text-[#1B5E9E] font-bold text-xs flex items-center justify-center shrink-0">H</span>
              <h2 className="text-lg font-bold text-slate-800">Evidencia (opcional)</h2>
            </div>
            <p className="text-sm text-slate-600">
              Si tienes capturas de pantalla, mensajes u otra evidencia, puedes adjuntarla o compartirla con el orientador.
            </p>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition-colors">
              <input
                id="evidencia"
                name="evidencia"
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1B5E9E] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#154a7d] cursor-pointer"
              />
              <p className="mt-2 text-[11px] text-slate-400">
                Formatos permitidos: imágenes, PDF y documentos de Word.
              </p>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/60">
                <Campo 
                  label="Nombre completo" 
                  placeholder="Ej. Juan Pérez" 
                  name="nombre_contacto_victima"
                  value={formData.nombre_contacto_victima}
                  onChange={handleInputChange}
                />
                <Campo 
                  label="Medio de contacto" 
                  placeholder="Correo o número de celular" 
                  name="medio_contacto_victima"
                  value={formData.medio_contacto_victima}
                  onChange={handleInputChange}
                />
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
              {loading ? "Enviando de forma segura..." : "Enviar Reporte Seguro"}
            </Boton>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
}