import React from "react";

export default function ModalActaOficial({ reporte, historial = [], recomendaciones = null, rutaExternaInfo = null, onClose }) {
  if (!reporte) return null;

  const handleImprimir = () => {
    window.print();
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      return new Date(fecha).toLocaleString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(fecha);
    }
  };

  const riesgo = (reporte.nivel_riesgo_confirmado || reporte.nivel_riesgo_predicho || "MEDIO").toUpperCase();

  const obtenerTipologiaLey1620 = (r) => {
    switch (r) {
      case "CRITICO":
        return {
          tipo: "SITUACIÓN TIPO III (Presuntos Delitos / Riesgo Vital / Violencia Severa)",
          norma: "Artículo 40 del Decreto 1965 de 2013 - Ley 1620 de 2013",
          descripcion:
            "Situaciones de agresión escolar que sean constitutivas de presuntos delitos contra la libertad, integridad y formación sexual, o cualquier otro delito establecido en la ley penal colombiana vigente, o que atenten contra la vida.",
        };
      case "ALTO":
        return {
          tipo: "SITUACIÓN TIPO II (Acoso Escolar Sistemático / Daño al Cuerpo o la Salud)",
          norma: "Artículo 40 del Decreto 1965 de 2013 - Ley 1620 de 2013",
          descripcion:
            "Situaciones de agresión escolar, acoso escolar (bullying) o ciberacoso (ciberbullying), que no revistan las características de un delito y que cumplan con características de reiteración, sistematicidad o daño físico/emocional.",
        };
      case "MEDIO":
        return {
          tipo: "SITUACIÓN TIPO I REITERADA (Conflicto Convivencial Continuo)",
          norma: "Artículo 40 del Decreto 1965 de 2013 - Ley 1620 de 2013",
          descripcion:
            "Conflictos manejados inadecuadamente y situaciones esporádicas o recurrentes que inciden negativamente en el clima escolar y que no generan daño al cuerpo o a la salud física o psicológica grave.",
        };
      default:
        return {
          tipo: "SITUACIÓN TIPO I (Conflicto Esporádico Menor)",
          norma: "Artículo 40 del Decreto 1965 de 2013 - Ley 1620 de 2013",
          descripcion:
            "Situaciones de desacuerdo o fricción interpersonal esporádica que alteran de forma leve la convivencia escolar.",
        };
    }
  };

  const infoLey = obtenerTipologiaLey1620(riesgo);
  const fechaHoy = new Date().toLocaleString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Estilos CSS específicos para la impresión y guardado como PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #area-impresion-acta,
          #area-impresion-acta * {
            visibility: visible !important;
          }
          #area-impresion-acta {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          .no-imprimir {
            display: none !important;
          }
          .salto-pagina {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Contenedor del Modal */}
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Barra superior de herramientas (No se imprime) */}
        <div className="no-imprimir bg-slate-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg">
              📄
            </div>
            <div>
              <h2 className="text-sm font-extrabold leading-tight">Acta Oficial de Caso — Ley 1620 de 2013</h2>
              <p className="text-[11px] text-slate-300">
                Vista de impresión institucional y exportación formal a PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.98] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir / Guardar como PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              title="Cerrar vista de acta"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Área del Documento Imprimible (Hoja Formal) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            id="area-impresion-acta"
            className="bg-white text-slate-900 w-full max-w-3xl p-8 sm:p-12 shadow-md border border-slate-200 rounded-2xl font-serif space-y-6"
          >
            {/* Membrete Institucional Formal */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-sans font-black text-[#1B5E9E] text-xs border border-slate-300">
                  SV
                </div>
                <div className="flex-1 font-sans">
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-600">
                    República de Colombia • Ministerio de Educación Nacional
                  </p>
                  <p className="text-xs font-black uppercase text-slate-800">
                    Sistema Nacional de Convivencia Escolar — Ley 1620 de 2013
                  </p>
                  <p className="text-[11px] font-bold text-[#2C5F57]">
                    Comité Escolar de Convivencia • Institución Educativa SafeVoice
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-sans font-bold text-slate-600 text-[10px] border border-slate-300 text-center">
                  SIUCE
                </div>
              </div>

              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 pt-2 font-sans">
                Acta Oficial de Radicación, Clasificación y Seguimiento
              </h1>
              <p className="text-[11px] italic text-slate-600">
                Ruta de Atención Integral para la Convivencia Escolar y la Prevención del Acoso Escolar
              </p>
            </div>

            {/* Radicado y Metadatos del Documento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Código Único (UUID)</span>
                <span className="font-mono font-black text-[#1B5E9E] break-all">{reporte.codigo_seguimiento}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Fecha Radicación</span>
                <span className="font-bold text-slate-800">{formatearFecha(reporte.fecha_creacion)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Fecha Emisión Acta</span>
                <span className="font-bold text-slate-800">{fechaHoy}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Estado del Caso</span>
                <span className="font-extrabold uppercase text-[#2C5F57]">{reporte.estado || "NUEVO"}</span>
              </div>
            </div>

            {/* SECCIÓN I: Tipología Legal y Valoración de Riesgo */}
            <div className="space-y-2 font-sans">
              <div className="bg-slate-800 text-white px-3 py-1 text-xs font-black uppercase tracking-wider rounded-sm">
                I. Tipología Convivencial y Valoración del Riesgo (Ley 1620 de 2013)
              </div>
              
              <div className="border border-slate-300 p-3.5 rounded-xl space-y-2 bg-white text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Clasificación Normativa:</span>
                    <span className="text-xs font-black text-slate-900">{infoLey.tipo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Prioridad de Atención:</span>
                    <span className={`px-2.5 py-0.5 rounded-md font-black text-[11px] text-white ${
                      riesgo === "CRITICO" ? "bg-red-600" :
                      riesgo === "ALTO" ? "bg-orange-600" :
                      riesgo === "MEDIO" ? "bg-amber-500 text-slate-900" :
                      "bg-emerald-600"
                    }`}>
                      RIESGO {riesgo}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  <strong>Definición legal ({infoLey.norma}):</strong> {infoLey.descripcion}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-500">Ubicación física:</span>
                    <p className="font-bold text-slate-800">{reporte.ubicacion || "No especificada"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Frecuencia reportada:</span>
                    <p className="font-bold text-slate-800">{reporte.frecuencia || "No indicada"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Grado de la víctima:</span>
                    <p className="font-bold text-slate-800">{reporte.grado_victima || "No indicado"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Grado involucrados:</span>
                    <p className="font-bold text-slate-800">{reporte.involucrados_grado || "No indicado"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN II: Condición de Identidad y Reserva de Datos */}
            <div className="space-y-2 font-sans">
              <div className="bg-slate-800 text-white px-3 py-1 text-xs font-black uppercase tracking-wider rounded-sm">
                II. Condición de Identidad y Reserva Legal
              </div>
              
              <div className="border border-slate-300 p-3.5 rounded-xl bg-slate-50 text-xs space-y-1.5">
                {reporte.nombre_contacto_victima || reporte.medio_contacto_victima ? (
                  <div>
                    <p className="text-emerald-900 font-bold">
                      ✓ El estudiante reportante consintió voluntariamente revelar sus datos para contacto y acompañamiento directo:
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Nombre Completo:</span>
                        <span className="font-bold text-slate-800">{reporte.nombre_contacto_victima || "No especificado"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Medio de Contacto:</span>
                        <span className="font-bold text-slate-800">{reporte.medio_contacto_victima || "No especificado"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed">
                    <strong>REPORTE CON GARANTÍA DE ANONIMATO ESTRICTO:</strong> El estudiante optó por ejercer su derecho a la confidencialidad absoluta consagrado en los protocolos institucionales de protección. No se registran datos personales que comprometan su identidad en el repositorio de SafeVoice.
                  </p>
                )}
                <p className="text-[10px] text-slate-500 italic">
                  Información protegida bajo reserva legal según la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Código de la Infancia y la Adolescencia (Ley 1098 de 2006).
                </p>
              </div>
            </div>

            {/* SECCIÓN III: Hechos Notificados y Evidencias */}
            <div className="space-y-2 font-sans">
              <div className="bg-slate-800 text-white px-3 py-1 text-xs font-black uppercase tracking-wider rounded-sm">
                III. Relato de los Hechos y Material Probatorio Digital
              </div>
              
              <div className="border border-slate-300 p-4 rounded-xl bg-white text-xs space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Descripción del Incidente:</span>
                  <div className="font-serif leading-relaxed text-slate-800 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    "{reporte.descripcion || "Sin descripción adicional proporcionada."}"
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-slate-600">Material de Evidencia Digital Adjunto:</span>
                  {reporte.evidencia_url ? (
                    <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      ✓ Sí — 1 archivo de evidencia digital custodiado en el servidor institucional de SafeVoice
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">
                      No se adjuntaron archivos multimedia o documentos en este reporte.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN IV: Protocolo Orientador y Medidas Activadas */}
            <div className="space-y-2 font-sans">
              <div className="bg-slate-800 text-white px-3 py-1 text-xs font-black uppercase tracking-wider rounded-sm">
                IV. Protocolo y Medidas Inmediatas Determinadas (Ruta de Atención)
              </div>
              
              <div className="border border-slate-300 p-3.5 rounded-xl bg-white text-xs space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Protocolo Institucional Aplicable:</span>
                  <p className="font-black text-slate-900 text-xs">
                    {recomendaciones?.protocolo_principal || "Activación de Ruta de Atención Integral en Convivencia Escolar"}
                  </p>
                </div>

                {recomendaciones?.acciones_clave && recomendaciones.acciones_clave.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Acciones Formativas y Medidas de Protección Determinadas:
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
                      {recomendaciones.acciones_clave.map((acc, i) => (
                        <li key={i} className="leading-snug">{acc}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Constancia de Activación de Ruta Externa Obligatoria (si aplica) */}
                {rutaExternaInfo && (
                  <div className="mt-2.5 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-950 font-sans text-xs space-y-1">
                    <p className="font-extrabold uppercase text-[10px] text-rose-800 flex items-center gap-1.5">
                      <span>🚨</span>
                      <span>Constancia de Activación de Ruta Externa Obligatoria (Ley 1620 / Decreto 1965)</span>
                    </p>
                    <p className="font-medium">
                      El caso fue remitido formalmente ante la autoridad competente: <strong>{rutaExternaInfo.entidad}</strong>
                      {rutaExternaInfo.radicado ? ` bajo Radicado No. ${rutaExternaInfo.radicado}` : ""}.
                    </p>
                    {rutaExternaInfo.fecha && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        Fecha y hora de remisión externa: {formatearFecha(rutaExternaInfo.fecha)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN V: Bitácora de Actuaciones y Trazabilidad */}
            <div className="space-y-2 font-sans">
              <div className="bg-slate-800 text-white px-3 py-1 text-xs font-black uppercase tracking-wider rounded-sm">
                V. Bitácora de Intervenciones y Trazabilidad del Caso
              </div>
              
              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                {historial && historial.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Fecha y Hora</th>
                        <th className="p-2 border-r border-slate-300">Responsable / Orientador</th>
                        <th className="p-2 border-r border-slate-300">Transición Estado</th>
                        <th className="p-2">Observaciones / Compromisos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {historial.map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-200 font-mono text-[10px]">
                            {formatearFecha(h.fecha_cambio || h.fecha)}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold">
                            {h.usuario_nombre || h.nombre_orientador || "Orientación Escolar"}
                          </td>
                          <td className="p-2 border-r border-slate-200 uppercase font-semibold text-[10px]">
                            {h.estado_anterior} → {h.estado_nuevo}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            {h.comentario || h.observaciones || "Actualización de trámite registrada."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-3 text-center text-slate-500 italic text-[11px] bg-slate-50">
                    Caso en estado inicial de radicación. Pendiente del primer registro de intervención del orientador.
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN VI: Constancia y Cuadro de Firmas Institucionales */}
            <div className="space-y-4 pt-4 font-sans border-t-2 border-slate-900">
              <p className="text-[11px] text-justify leading-relaxed text-slate-700">
                Para constancia y efectos legales de seguimiento, se firma y archiva la presente acta en cumplimiento de lo establecido en el artículo 12 de la Ley 1620 de 2013, su Decreto Reglamentario 1965 de 2013 y el Manual de Convivencia Institucional, garantizando en todo momento la debida diligencia, el interés superior de los menores de edad y el debido proceso.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 text-center text-xs">
                {/* Firma 1: Orientador */}
                <div className="space-y-1">
                  <div className="border-t border-slate-900 w-4/5 mx-auto pt-1" />
                  <p className="font-black text-slate-900 uppercase text-[11px]">Orientador(a) Escolar</p>
                  <p className="text-[10px] text-slate-500">Líder de Convivencia y Orientación</p>
                  <p className="text-[10px] text-slate-400">C.C. / T.P.: _____________________</p>
                </div>

                {/* Firma 2: Rectoría */}
                <div className="space-y-1">
                  <div className="border-t border-slate-900 w-4/5 mx-auto pt-1" />
                  <p className="font-black text-slate-900 uppercase text-[11px]">Rector(a) Institucional</p>
                  <p className="text-[10px] text-slate-500">Presidente Comité de Convivencia</p>
                  <p className="text-[10px] text-slate-400">Firma y Sello Oficial</p>
                </div>

                {/* Firma 3: Coordinación */}
                <div className="space-y-1">
                  <div className="border-t border-slate-900 w-4/5 mx-auto pt-1" />
                  <p className="font-black text-slate-900 uppercase text-[11px]">Coordinación de Convivencia</p>
                  <p className="text-[10px] text-slate-500">Docente / Representante</p>
                  <p className="text-[10px] text-slate-400">C.C.: _____________________</p>
                </div>
              </div>

              {/* Pie de página institucional */}
              <div className="pt-4 text-center text-[10px] text-slate-400 border-t border-slate-200">
                Documento generado automáticamente por la Plataforma SafeVoice • Sistema Escolar Anónimo de Convivencia y Prevención de Bullying.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
