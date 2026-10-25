import { useState, useMemo } from "react";
import { getUser } from "../../utils/auth";

export default function ModalRemisionExterna({
  reporte,
  onClose,
  onConfirmarActivacion,
}) {
  if (!reporte) return null;
  const usuario = getUser();
  const institucionNombre = reporte.institucion_nombre || usuario?.institution_nombre || "Institución Educativa";

  const [entidadClave, setEntidadClave] = useState("ICBF");
  const [radicado, setRadicado] = useState(
    `REM-${new Date().getFullYear()}-${String(reporte.id || "001").padStart(3, "0")}`
  );
  const [funcionario, setFuncionario] = useState("Orientación Escolar / Rectoría");
  const [cargo, setCargo] = useState("Comité Escolar de Convivencia");
  const [medidasInmediatas, setMedidasInmediatas] = useState(
    "Protección física y emocional inmediata a la presunta víctima en espacio confidencial, separación preventiva de las partes en descansos y aulas, y comunicación urgente a acudientes."
  );
  const [peticionConcreta, setPeticionConcreta] = useState(
    "Solicitud prioritaria de apertura de Proceso Administrativo de Restablecimiento de Derechos (PARD) e intervención psicosocial o de protección conforme a la Ley 1098 de 2006."
  );
  const [copiado, setCopiado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Directorio de entidades competentes del Sistema Nacional de Bienestar Familiar
  const DIRECTORIO_ENTIDADES = {
    ICBF: {
      nombre: "Instituto Colombiano de Bienestar Familiar (ICBF)",
      dependencia: "Centro Zonal / Defensoría de Familia",
      linea: "Línea Gratuita Nacional 141",
      icono: "🏛️",
      competencia:
        "Restablecimiento de derechos de niños, niñas y adolescentes ante presunta vulneración, violencia o desprotección.",
    },
    POLICIA: {
      nombre: "Policía Nacional - Infancia y Adolescencia",
      dependencia: "Grupo de Protección a la Infancia y Adolescencia",
      linea: "Línea de Emergencias 123",
      icono: "👮",
      competencia:
        "Atención inmediata ante presunta comisión de delitos, porte de armas, agresiones físicas graves o riesgo inminente.",
    },
    COMISARIA: {
      nombre: "Comisaría de Familia Municipal / Local",
      dependencia: "Despacho del Comisario(a) de Familia",
      linea: "Línea de Atención a la Familia",
      icono: "⚖️",
      competencia:
        "Garantía y restablecimiento de derechos en el contexto familiar y de convivencia comunitaria.",
    },
    FISCALIA: {
      nombre: "Fiscalía General de la Nación",
      dependencia: "Unidad de Reacción Inmediata (URI) / CAIVAS",
      linea: "Línea 122",
      icono: "📜",
      competencia:
        "Investigación penal y judicialización de presuntos delitos contra la libertad, integridad y formación sexual.",
    },
    SALUD: {
      nombre: "Centro de Salud / Red de Urgencias EPS",
      dependencia: "Servicio de Urgencias Médicas y Hospitalarias",
      linea: "Línea 123 / Centro Regulador de Urgencias",
      icono: "🏥",
      competencia:
        "Atención médica de urgencias, valoración de lesiones físicas y primeros auxilios psicológicos de choque.",
    },
  };

  const entidadActual = DIRECTORIO_ENTIDADES[entidadClave] || DIRECTORIO_ENTIDADES.ICBF;

  // Cálculo de horas transcurridas desde el reporte y plazos legales Ley 1620
  const calculoPlazos = useMemo(() => {
    const fechaCreacion = reporte.fecha_creacion
      ? new Date(reporte.fecha_creacion)
      : new Date();
    const ahora = new Date();
    const difMs = ahora - fechaCreacion;
    const horasTranscurridas = Math.max(0, Math.floor(difMs / (1000 * 60 * 60)));
    const minutosTranscurridos = Math.max(0, Math.floor((difMs / (1000 * 60)) % 60));

    // Plazo legal para reporte en SIUCE (48 horas según Decreto 1965 de 2013)
    const horasRestantesSiuce = Math.max(0, 48 - horasTranscurridas);
    const fechaLimiteSiuce = new Date(fechaCreacion.getTime() + 48 * 60 * 60 * 1000);

    const enPlazoInmediato = horasTranscurridas < 2;

    return {
      horasTranscurridas,
      minutosTranscurridos,
      horasRestantesSiuce,
      fechaLimiteSiuce: fechaLimiteSiuce.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      enPlazoInmediato,
    };
  }, [reporte.fecha_creacion]);

  const fechaHoyFormateada = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const horaActual = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleImprimir = () => {
    window.print();
  };

  const textoOficioPlano = useMemo(() => {
    return `OFICIO DE REMISIÓN INSTITUCIONAL URGENTE - LEY 1620 DE 2013
Radicado Interno: ${radicado}
Fecha y Hora: ${fechaHoyFormateada}, ${horaActual}

SEÑORES:
${entidadActual.nombre}
${entidadActual.dependencia}
Atención: Autoridad Competente en Turno

ASUNTO: REMISIÓN URGENTE DE SITUACIÓN TIPO III - ACTIVACIÓN DE RUTA DE ATENCIÓN INTEGRAL (LEY 1620 DE 2013 Y LEY 1098 DE 2006)

1. IDENTIFICACIÓN DEL CASO
- Código de Expediente SafeVoice: #${reporte.codigo_seguimiento}
- Grado Escolar Involucrado: ${reporte.grado_victima || "No especificado"}
- Lugar de los Hechos: ${reporte.ubicacion || "Instalaciones de la Institución"}
- Clasificación de Gravedad: Situación Tipo III (Presuntos Delitos / Daño Severo / Riesgo Vital)
- Marco Normativo: Artículo 40 del Decreto 1965 de 2013 y Artículo 44 de la Constitución Política.

2. RESUMEN DE LOS HECHOS
"${reporte.descripcion}"

3. MEDIDAS CAUTELARES INMEDIATAS ADOPTADAS POR EL COLEGIO
${medidasInmediatas}

4. PETICIÓN CONCRETA
${peticionConcreta}

Remitido por:
${funcionario}
Cargo: ${cargo}
${institucionNombre}
    `.trim();
  }, [
    radicado,
    fechaHoyFormateada,
    horaActual,
    entidadActual,
    reporte,
    medidasInmediatas,
    peticionConcreta,
    funcionario,
    cargo,
  ]);

  const handleCopiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(textoOficioPlano);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error("Error al copiar texto:", err);
    }
  };

  const handleConfirmar = async () => {
    setGuardando(true);
    try {
      await onConfirmarActivacion({
        entidad_clave: entidadClave,
        entidad_nombre: entidadActual.nombre,
        radicado,
        funcionario,
        cargo,
        fecha_activacion: new Date().toISOString(),
        observaciones: `Ruta Externa activada formalmente ante ${entidadActual.nombre} (${entidadActual.dependencia}) bajo radicado ${radicado}.`,
      });
      onClose();
    } catch (err) {
      console.error("Error al registrar activación de ruta externa:", err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Estilos específicos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #area-impresion-remision,
          #area-impresion-remision * {
            visibility: visible !important;
          }
          #area-impresion-remision {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-imprimir {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 text-white p-5 flex items-center justify-between no-imprimir shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              🚨
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-black bg-white/25 px-2 py-0.5 rounded-md">
                  Caso #{reporte.codigo_seguimiento}
                </span>
                <span className="text-[10px] uppercase font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md shadow-2xs">
                  Ley 1620 • Situación Tipo III
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                Paquete de Remisión Inmediata a Autoridades Externas
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Panel de Conteo de Horas y Plazos Legales */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 no-imprimir">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Plazo de Notificación Inmediata */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                calculoPlazos.enPlazoInmediato
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-rose-50 border-rose-200 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">
                    Notificación a Autoridades Externas
                  </p>
                  <p className="font-bold text-xs mt-0.5">
                    {calculoPlazos.enPlazoInmediato ? (
                      <span className="text-emerald-700">
                        Dentro del plazo inmediato (Transcurridas: {calculoPlazos.horasTranscurridas}h {calculoPlazos.minutosTranscurridos}m)
                      </span>
                    ) : (
                      <span className="text-rose-700">
                        ¡Atención prioritaria! Han transcurrido {calculoPlazos.horasTranscurridas}h desde el reporte
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                  calculoPlazos.enPlazoInmediato
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {calculoPlazos.enPlazoInmediato ? "Tiempo Óptimo" : "Urgente"}
              </span>
            </div>

            {/* Plazo Legal Registro SIUCE */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⏳</span>
                <div>
                  <p className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800">
                    Término Legal SIUCE (MinEducación)
                  </p>
                  <p className="font-bold text-xs mt-0.5 text-slate-800">
                    Resta: <span className="text-amber-700 font-black">{calculoPlazos.horasRestantesSiuce} horas</span> para el reporte obligatorio (48h límite)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                Límite: {calculoPlazos.fechaLimiteSiuce}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Selector de Entidad Destinataria */}
          <div className="no-imprimir space-y-3">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              1. Selecciona la Autoridad Externa Destinataria:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(DIRECTORIO_ENTIDADES).map(([clave, item]) => {
                const seleccionado = entidadClave === clave;
                return (
                  <button
                    key={clave}
                    type="button"
                    onClick={() => setEntidadClave(clave)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      seleccionado
                        ? "border-rose-500 bg-rose-50/70 shadow-xs ring-2 ring-rose-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{item.icono}</span>
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {item.nombre}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.dependencia}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-black text-rose-700 mt-2 self-start bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {item.linea}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              ℹ️ <strong>Competencia de {entidadActual.nombre}:</strong> {entidadActual.competencia}
            </p>
          </div>

          {/* Formulario de Datos para el Oficio */}
          <div className="no-imprimir grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Número de Radicado / Oficio Externo:
              </label>
              <input
                type="text"
                value={radicado}
                onChange={(e) => setRadicado(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Funcionario Remitente:
              </label>
              <input
                type="text"
                value={funcionario}
                onChange={(e) => setFuncionario(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Medidas Cautelares Inmediatas Adoptadas por la Institución:
              </label>
              <textarea
                rows="2"
                value={medidasInmediatas}
                onChange={(e) => setMedidasInmediatas(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Petición Concreta a la Entidad:
              </label>
              <input
                type="text"
                value={peticionConcreta}
                onChange={(e) => setPeticionConcreta(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* VISTA PREVIA DEL DOCUMENTO FORMAL (ÁREA IMPRIMIBLE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between no-imprimir">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📄</span>
                <span>Vista Previa del Oficio Formal de Remisión</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Listo para radicar o enviar con firma digital
              </span>
            </div>

            <div
              id="area-impresion-remision"
              className="bg-white p-8 rounded-2xl border border-slate-300 shadow-sm text-slate-900 font-serif leading-relaxed text-xs sm:text-sm space-y-5"
            >
              {/* Encabezado Membrete Oficial */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <p className="font-bold uppercase tracking-widest text-xs text-slate-600">
                  República de Colombia • Sistema Nacional de Convivencia Escolar
                </p>
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 font-sans tracking-wide">
                  Comité Escolar de Convivencia • SafeVoice
                </h2>
                <p className="text-xs text-slate-500 italic font-sans">
                  Conforme a la Ley 1620 de 2013 y el Artículo 40 del Decreto Reglamentario 1965 de 2013
                </p>
              </div>

              {/* Referencia y Fecha */}
              <div className="flex flex-wrap items-center justify-between gap-2 font-sans text-xs border-b border-slate-200 pb-3">
                <div>
                  <span className="font-bold text-slate-500">Radicado Interno:</span>{" "}
                  <span className="font-mono font-black text-slate-900">{radicado}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Fecha y Hora de Emisión:</span>{" "}
                  <span className="font-semibold text-slate-900">
                    {fechaHoyFormateada}, {horaActual}
                  </span>
                </div>
              </div>

              {/* Destinatario */}
              <div className="font-sans text-xs space-y-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold uppercase text-slate-500 text-[10px]">Destinatario Oficial:</p>
                <p className="font-black text-sm text-slate-900">{entidadActual.nombre}</p>
                <p className="font-semibold text-slate-700">{entidadActual.dependencia}</p>
                <p className="text-slate-500 italic">Atención: Defensoría de Familia / Autoridad en Turno</p>
              </div>

              {/* Asunto */}
              <div className="font-sans bg-rose-50/60 border-l-4 border-rose-600 p-3 text-xs">
                <p className="font-extrabold text-rose-950 uppercase tracking-wide">
                  ASUNTO: REMISIÓN FORMAL URGENTE DE SITUACIÓN TIPO III — ACTIVACIÓN DE RUTA DE ATENCIÓN INTEGRAL EN SALUD, PROTECCIÓN Y JUSTICIA
                </p>
                <p className="text-[11px] text-rose-900 mt-0.5">
                  Fundamento Jurídico: Artículos 44 de la C.P., Ley 1098 de 2006 (Código de Infancia y Adolescencia), Ley 1620 de 2013 y Art. 40 al 44 del Decreto 1965 de 2013.
                </p>
              </div>

              {/* Contenido Formal */}
              <div className="space-y-3.5 text-justify leading-relaxed">
                <p>
                  Por medio de la presente, la Institución Educativa, a través de su Comité Escolar de Convivencia y el equipo de Orientación Escolar, pone en su conocimiento la ocurrencia de una <strong>SITUACIÓN CLASIFICADA COMO TIPO III</strong> registrada bajo el código confidencial de seguimiento <strong>#{reporte.codigo_seguimiento}</strong>.
                </p>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans text-xs space-y-1.5">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">Resumen de Variables del Caso:</p>
                  <p><strong>• Grado Escolar Involucrado:</strong> {reporte.grado_victima || "No especificado"}</p>
                  <p><strong>• Lugar del Incidente:</strong> {reporte.ubicacion || "Instalaciones del plantel educativo"}</p>
                  <p><strong>• Tipología Inicial Reportada:</strong> Presunta agresión o hecho que reviste gravedad o posible vulneración a la integridad física/emocional/sexual.</p>
                </div>

                <p className="font-semibold text-slate-900">
                  Relación Sucinta de los Hechos Informados:
                </p>
                <blockquote className="bg-slate-50 p-3.5 rounded-xl border-l-2 border-slate-400 italic text-slate-700 text-xs">
                  "{reporte.descripcion}"
                </blockquote>

                <p className="font-semibold text-slate-900">
                  Medidas Inmediatas y Cautelares Adoptadas por la Institución:
                </p>
                <p className="text-slate-800 font-sans text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {medidasInmediatas}
                </p>

                <p className="font-semibold text-slate-900">
                  Petición Concreta a la Autoridad Competente:
                </p>
                <p className="text-slate-800 font-sans text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {peticionConcreta}
                </p>

                <p className="text-[11px] text-slate-600 font-sans italic pt-2">
                  La presente remisión se efectúa salvaguardando el principio constitucional del interés superior de los niños, niñas y adolescentes y dando estricto cumplimiento a los plazos perentorios establecidos en el Sistema Nacional de Convivencia Escolar.
                </p>
              </div>

              {/* Firmas y Sellos */}
              <div className="pt-8 grid grid-cols-2 gap-8 font-sans text-xs text-center border-t border-slate-300">
                <div className="space-y-12">
                  <div className="h-10 border-b border-slate-400 mx-auto max-w-xs" />
                  <div>
                    <p className="font-extrabold text-slate-900">{funcionario}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{cargo}</p>
                    <p className="text-[10px] text-slate-400">{institucionNombre}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="h-10 border-b border-slate-400 mx-auto max-w-xs" />
                  <div>
                    <p className="font-extrabold text-slate-900">Constancia de Recibido / Sello de Radicado</p>
                    <p className="text-[11px] text-slate-500 font-medium">Firma y Nombre del Funcionario Receptor</p>
                    <p className="text-[10px] text-slate-400">{entidadActual.nombre}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal con Acciones */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-imprimir">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer hover:bg-slate-100"
            >
              <span>🖨️</span>
              <span>Imprimir / Descargar Oficio (PDF)</span>
            </button>
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-slate-100"
            >
              <span>{copiado ? "✓" : "📋"}</span>
              <span>{copiado ? "¡Texto Copiado!" : "Copiar Texto"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🚨</span>
              <span>{guardando ? "Registrando..." : "Confirmar y Activar Ruta Externa"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
