import { useState } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";

export default function Reporte() {
  const [aceptaRevelar, setAceptaRevelar] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#2C5F57] mb-3">
            Crear Reporte Anónimo
          </h1>
          <p className="text-slate-600 text-lg">
            Este espacio es 100% seguro y confidencial. Nadie sabrá quién eres, a menos que decidas lo contrario.
          </p>
        </div>

        <form className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
          
          {/* A. Institución Educativa */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">A. Tu Institución</h2>
            <div className="max-w-md">
              <Campo 
                label="¿A cuál colegio o institución perteneces?" 
                name="institucion"
                placeholder="Busca tu colegio..."
                required 
              />
            </div>
          </section>

          {/* B. Rol de quien reporta */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">B. Perspectiva</h2>
            <p className="text-sm text-slate-600">¿Esta situación te está pasando a ti o la estás presenciando en otra persona?</p>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                <input type="radio" name="rol_reportante" className="w-5 h-5 accent-[#2C5F57]" value="victima" />
                <span className="text-slate-700">Me está pasando a mí (Soy la víctima)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                <input type="radio" name="rol_reportante" className="w-5 h-5 accent-[#2C5F57]" value="testigo" />
                <span className="text-slate-700">Lo vi / le pasa a un compañero(a) (Soy testigo)</span>
              </label>
            </div>
          </section>

          {/* C. Grado o Nivel */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">C. Grado Escolar</h2>
            <div className="max-w-md">
              <Campo 
                label="¿En qué grado o curso está la persona afectada?" 
                name="grado"
                placeholder="Ej. 8°, Noveno, 11A..."
                required 
              />
            </div>
          </section>

          {/* D. Ubicación */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">D. Ubicación</h2>
            <p className="text-sm text-slate-600">¿Dónde ocurrió la situación?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Salón de clases', 'Pasillos o escaleras', 'Baños', 'Descanso / zonas deportivas', 'Salida del colegio', 'Internet / Redes sociales'].map((lugar) => (
                <label key={lugar} className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                  <input type="radio" name="ubicacion" className="w-5 h-5 accent-[#2C5F57]" value={lugar} />
                  <span className="text-slate-700">{lugar}</span>
                </label>
              ))}
            </div>
          </section>

          {/* E. Frecuencia */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">E. Frecuencia</h2>
            <p className="text-sm text-slate-600">¿Hace cuánto tiempo está pasando esto?</p>
            <div className="flex flex-col gap-3">
              {['Pasó hoy o es la primera vez', 'Lleva pasando algunas semanas', 'Lleva pasando varios meses'].map((frecuencia) => (
                <label key={frecuencia} className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                  <input type="radio" name="frecuencia" className="w-5 h-5 accent-[#2C5F57]" value={frecuencia} />
                  <span className="text-slate-700">{frecuencia}</span>
                </label>
              ))}
            </div>
          </section>

          {/* F. Tipo de Agresión */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">F. ¿Qué fue lo que pasó?</h2>
            <p className="text-sm text-slate-600">Puedes marcar varias opciones</p>
            <div className="flex flex-col gap-3">
              {[
                'Me pegaron, empujaron o lastimaron (o a mi compañero/a)',
                'Me quitaron, escondieron o dañaron cosas',
                'Insultos, gritos o apodos ofensivos',
                'Inventaron chismes, amenazaron o me excluyeron del grupo',
                'Ciberacoso (Mensajes, fotos sin permiso, redes sociales)'
              ].map((tipo) => (
                <label key={tipo} className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                  <input type="checkbox" name="tipo_agresion" className="w-5 h-5 accent-[#2C5F57] rounded-sm" value={tipo} />
                  <span className="text-slate-700">{tipo}</span>
                </label>
              ))}
            </div>
          </section>

          {/* G. Descripción Abierta */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">G. Cuéntanos qué pasó</h2>
            <Campo 
              isTextArea={true}
              rows={5}
              name="descripcion"
              placeholder="Escribe aquí lo que pasó sin decir tu nombre. Por ejemplo: Ayer en el recreo acorralaron a mi amigo y le dijeron que..."
              required 
            />
          </section>

          {/* H. Evidencia (Opcional) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">H. Evidencia (Opcional)</h2>
            <p className="text-sm text-slate-600">Si tienes fotos o capturas de pantalla, súbelas aquí.</p>
            <input type="file" className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-[#EBF3FA] file:text-[#2C5F57]
              hover:file:bg-[#dceaf7]"
            />
          </section>

          {/* I. Revelación Voluntaria */}
          <section className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-8">
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                <svg className="w-6 h-6 text-[#2C5F57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Protección de tu identidad</h3>
                <p className="text-sm text-slate-600 mt-1">Este reporte es 100% anónimo. Sin embargo, si consideras que el caso es muy grave y quieres que el orientador te contacte directamente, puedes marcar esta casilla:</p>
                
                <label className="flex items-center gap-3 cursor-pointer mt-4 mb-2">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-[#2C5F57] rounded-sm"
                    checked={aceptaRevelar}
                    onChange={(e) => setAceptaRevelar(e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-slate-700">Por la gravedad del caso, acepto revelar mi identidad para recibir ayuda directa.</span>
                </label>
              </div>
            </div>

            {aceptaRevelar && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                <Campo label="Nombre completo" placeholder="Ej. Juan Pérez" />
                <Campo label="Medio de contacto" placeholder="Correo o número de celular" />
              </div>
            )}
          </section>

          <div className="pt-6">
            <Boton variant="primary" fullWidth className="py-3 text-base shadow-md !bg-[#2C5F57] hover:!bg-[#234c45]">
              Enviar Reporte Seguro
            </Boton>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
}