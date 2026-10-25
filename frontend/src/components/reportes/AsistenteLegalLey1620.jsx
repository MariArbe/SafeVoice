import { useState, useEffect, useMemo } from "react";

export default function AsistenteLegalLey1620({
  reporte,
  recomendaciones,
  onCopiarNotas,
  onAbrirRemisionExterna,
  rutaExternaInfo = null,
}) {
  if (!reporte) return null;

  // Detección inicial automática según nivel de riesgo
  const tipoInicial = useMemo(() => {
    const riesgo = (
      reporte.nivel_riesgo_confirmado ||
      reporte.nivel_riesgo_predicho ||
      "MEDIO"
    ).toUpperCase();
    if (riesgo === "CRITICO") return "TIPO_III";
    if (riesgo === "ALTO") return "TIPO_II";
    return "TIPO_I";
  }, [reporte.nivel_riesgo_confirmado, reporte.nivel_riesgo_predicho]);

  const [tipoSeleccionado, setTipoSeleccionado] = useState(tipoInicial);
  const [checklist, setChecklist] = useState({});
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);

  // Catálogo normativo de la Ley 1620 de 2013 y Decreto 1965 de 2013
  const CONFIG_TIPOS = {
    TIPO_I: {
      titulo: "Tipo I: Conflictos Cotidianos",
      subtitulo: "Mediación y acuerdos pedagógicos formativos en el aula",
      colorBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      colorBorder: "border-emerald-200",
      colorBg: "bg-emerald-50/40",
      plazoAtencion: "Atención pedagógica prioritaria (< 72 horas hábiles)",
      norma: "Artículo 40, Numeral 1 del Decreto 1965 de 2013",
      definicion:
        "Conflictos manejados inadecuadamente y situaciones esporádicas que inciden negativamente en el clima escolar, sin generar daño al cuerpo o a la salud física o psicológica.",
      items: [
        {
          id: "escucha_activa",
          titulo: "Recepción y Escucha Activa",
          detalle:
            "Entrevista individual y confidencial con las partes involucradas por separado, garantizando un espacio pedagógico sin juzgar ni revictimizar.",
        },
        {
          id: "mediacion_aula",
          titulo: "Mediación Pedagógica en el Aula",
          detalle:
            "Facilitar el diálogo constructivo liderado por el docente director de grupo o el orientador escolar para identificar el origen del desacuerdo.",
        },
        {
          id: "acuerdos_restaurativos",
          titulo: "Acuerdos y Compromisos Restaurativos",
          detalle:
            "Concertación y firma formal de compromisos voluntarios de respeto mutuo, buen trato, reparación del daño y convivencia pacífica.",
        },
        {
          id: "monitoreo_preventivo",
          titulo: "Monitoreo Preventivo y Cierre",
          detalle:
            "Seguimiento discreto en el salón de clases durante 15 días por parte del director de grupo para certificar el cese del conflicto.",
        },
      ],
    },
    TIPO_II: {
      titulo: "Tipo II: Acoso Escolar / Daño Físico o Psicológico",
      subtitulo: "Citación obligatoria a acudientes, remisión a salud y reporte al SIUCE",
      colorBadge: "bg-amber-100 text-amber-800 border-amber-300",
      colorBorder: "border-amber-200",
      colorBg: "bg-amber-50/40",
      plazoAtencion: "Atención y citación obligatoria (< 24 horas hábiles)",
      norma: "Artículo 40, Numeral 2 del Decreto 1965 de 2013",
      definicion:
        "Situaciones de agresión escolar, acoso escolar (bullying) o ciberacoso que no revistan características de delito pero que sean reiteradas, sistemáticas o causen daño a la salud física o emocional.",
      items: [
        {
          id: "medidas_proteccion",
          titulo: "Medidas Cautelares de Protección Inmediata",
          detalle:
            "Garantizar la protección de la víctima cesando la situación de acoso y evitando coincidencias en descansos, baños o trabajos en equipo.",
        },
        {
          id: "citacion_acudientes",
          titulo: "Citación Obligatoria a Padres y Acudientes",
          detalle:
            "Notificación formal por escrito y citación individual por separado a los padres o representantes legales de la víctima y de los presuntos agresores.",
        },
        {
          id: "remision_salud",
          titulo: "Remisión a Salud / Orientación Psicológica",
          detalle:
            "Brindar contención socioemocional y remitir formalmente a la EPS o red pública de salud si se evidencia daño a la salud mental o física.",
        },
        {
          id: "comite_convivencia",
          titulo: "Presentación al Comité de Convivencia Escolar",
          detalle:
            "Remitir el caso al Comité para estructurar el plan de intervención formativo, seguimiento a compromisos y garantías de no repetición.",
        },
        {
          id: "reporte_siuce",
          titulo: "Registro Oficial en el Sistema SIUCE",
          detalle:
            "Diligenciamiento de la ficha del caso en el Sistema de Información Unificado de Convivencia Escolar (Ministerio de Educación Nacional).",
        },
      ],
    },
    TIPO_III: {
      titulo: "Tipo III: Delitos / Riesgo Vital / Violencia Severa",
      subtitulo: "Activación inmediata de Ruta Externa (ICBF/Policía) y reporte SIUCE < 48h",
      colorBadge: "bg-rose-100 text-rose-800 border-rose-300",
      colorBorder: "border-rose-200",
      colorBg: "bg-rose-50/40",
      plazoAtencion: "Notificación Inmediata (< 2 horas) • SIUCE (< 48 horas)",
      norma: "Artículo 40, Numeral 3 del Decreto 1965 de 2013",
      definicion:
        "Situaciones que revisten presunta comisión de delitos contra la libertad, integridad y formación sexual, armas, lesiones graves o cualquier hecho con riesgo vital.",
      items: [
        {
          id: "atencion_medica_urgente",
          titulo: "Atención Médica Inmediata y Primeros Auxilios",
          detalle:
            "Traslado de urgencia a centro hospitalario o prestación de primeros auxilios físicos o psicológicos si hay afectación crítica.",
        },
        {
          id: "notificacion_rectoria",
          titulo: "Notificación Inmediata a Rectoría",
          detalle:
            "Puesta en conocimiento directo del Rector(a) para adopción de medidas institucionales, custodia y protección legal.",
        },
        {
          id: "activacion_ruta_externa",
          titulo: "Activación de Ruta Externa Obligatoria (ICBF / Policía / Fiscalía)",
          detalle:
            "Remisión formal inmediata a autoridades competentes: Policía de Infancia (123), ICBF (141), Comisaría de Familia o Fiscalía URI.",
          esAccionEspecial: true,
        },
        {
          id: "citacion_urgente_acudientes",
          titulo: "Comunicación Urgente a Padres o Acudientes",
          detalle:
            "Informar con carácter prioritario e individual a los padres de familia de las partes involucradas sobre las medidas tomadas.",
        },
        {
          id: "registro_siuce_48h",
          titulo: "Registro Oficial Obligatorio en SIUCE (< 48 Horas)",
          detalle:
            "Conforme al Decreto 1965 de 2013, reportar el caso en el aplicativo oficial SIUCE dentro del plazo perentorio de 48 horas.",
        },
      ],
    },
  };

  const configActual = CONFIG_TIPOS[tipoSeleccionado] || CONFIG_TIPOS.TIPO_I;

  // Cargar estado guardado de checklist en localStorage para este reporte y tipo
  const storageKey = `safevoice_checklist_${reporte.codigo_seguimiento}_${tipoSeleccionado}`;

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(storageKey);
      if (guardado) {
        setChecklist(JSON.parse(guardado));
      } else {
        setChecklist({});
      }
    } catch {
      setChecklist({});
    }
  }, [storageKey]);

  // Si la ruta externa está activada en el reporte, marcar automáticamente ese item
  useEffect(() => {
    if (rutaExternaInfo && tipoSeleccionado === "TIPO_III") {
      setChecklist((prev) => {
        if (!prev.activacion_ruta_externa) {
          const updated = { ...prev, activacion_ruta_externa: true };
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch {
            // omitir
          }
          return updated;
        }
        return prev;
      });
    }
  }, [rutaExternaInfo, tipoSeleccionado, storageKey]);

  // Manejo de checkbox interactivo
  const handleToggleItem = (itemId) => {
    setChecklist((prev) => {
      const nuevo = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(nuevo));
      } catch {
        // omitir
      }
      return nuevo;
    });
  };

  // Cálculo de progreso
  const totalItems = configActual.items.length;
  const itemsCompletados = configActual.items.filter((item) => checklist[item.id]).length;
  const porcentaje = totalItems > 0 ? Math.round((itemsCompletados / totalItems) * 100) : 0;

  // Cálculo de tiempos transcurridos y límite SIUCE (48 horas)
  const calculoTiempo = useMemo(() => {
    const fecha = reporte.fecha_creacion ? new Date(reporte.fecha_creacion) : new Date();
    const ahora = new Date();
    const difMs = ahora - fecha;
    const horas = Math.max(0, Math.floor(difMs / (1000 * 60 * 60)));
    const minutos = Math.max(0, Math.floor((difMs / (1000 * 60)) % 60));
    const horasSiuceRestantes = Math.max(0, 48 - horas);
    const limiteSiuceFecha = new Date(fecha.getTime() + 48 * 60 * 60 * 1000);

    return {
      horas,
      minutos,
      horasSiuceRestantes,
      enPlazoInmediato: horas < 2,
      fechaLimiteSiuce: limiteSiuceFecha.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [reporte.fecha_creacion]);

  // Copiar acciones del checklist al formulario de notas de seguimiento
  const handleCopiarAcciones = () => {
    const completados = configActual.items.filter((it) => checklist[it.id]);
    if (completados.length === 0) {
      alert("Marca al menos una acción del checklist antes de copiar.");
      return;
    }

    const fechaHoy = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const texto = `[Protocolo Ley 1620 - ${configActual.titulo} - ${fechaHoy}]\nAcciones ejecutadas (${completados.length}/${totalItems}):\n` +
      completados.map((c, i) => `${i + 1}. ${c.titulo}: ${c.detalle}`).join("\n");

    onCopiarNotas(texto);
    setCopiadoFeedback(true);
    setTimeout(() => setCopiadoFeedback(false), 3000);
  };

  const handleRestablecerChecklist = () => {
    if (window.confirm("¿Deseas reiniciar las casillas marcadas para este protocolo?")) {
      setChecklist({});
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // omitir
      }
    }
  };

  return (
    <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white space-y-0">
      {/* Cabecera del Asistente Legal */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1B5E9E] text-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-base shadow-xs">
              ⚖️
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-black tracking-wide">
                Asistente Legal y Protocolo Ley 1620
              </h4>
              <p className="text-[11px] text-slate-300">
                Checklist interactivo de ruta de atención y plazos obligatorios
              </p>
            </div>
          </div>

          {/* Badge del tipo sugerido por el modelo */}
          <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
            <span>Sugerido por IA:</span>
            <span className="font-mono font-black text-amber-300">
              {tipoInicial === "TIPO_III"
                ? "Tipo III"
                : tipoInicial === "TIPO_II"
                ? "Tipo II"
                : "Tipo I"}
            </span>
          </span>
        </div>

        {/* Selector Conmutable de Gravedad (Tipo I, II, III) */}
        <div className="grid grid-cols-3 gap-1.5 bg-black/25 p-1 rounded-xl text-xs font-bold border border-white/10">
          <button
            type="button"
            onClick={() => setTipoSeleccionado("TIPO_I")}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
              tipoSeleccionado === "TIPO_I"
                ? "bg-emerald-600 text-white shadow-xs font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="block text-[11px]">Tipo I</span>
            <span className="block text-[9px] opacity-80 truncate">Cotidiano</span>
          </button>

          <button
            type="button"
            onClick={() => setTipoSeleccionado("TIPO_II")}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
              tipoSeleccionado === "TIPO_II"
                ? "bg-amber-600 text-white shadow-xs font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="block text-[11px]">Tipo II</span>
            <span className="block text-[9px] opacity-80 truncate">Acoso / Daño</span>
          </button>

          <button
            type="button"
            onClick={() => setTipoSeleccionado("TIPO_III")}
            className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
              tipoSeleccionado === "TIPO_III"
                ? "bg-rose-600 text-white shadow-xs font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="block text-[11px]">Tipo III</span>
            <span className="block text-[9px] opacity-80 truncate">Delitos / Vital</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo del Tipo Seleccionado */}
      <div className={`p-3.5 border-b border-slate-200/80 ${configActual.colorBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${configActual.colorBadge}`}
            >
              {configActual.titulo}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {configActual.norma}
            </span>
          </div>

          <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
            ⏱️ {configActual.plazoAtencion}
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          {configActual.definicion}
        </p>

        {/* Si es Tipo III: Cronómetro / Conteo de Plazos Legales */}
        {tipoSeleccionado === "TIPO_III" && (
          <div className="mt-3 p-2.5 rounded-xl bg-white border border-rose-200 text-xs shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>⏱️</span>
                <span>Notificación Externa Inmediata (&lt; 2 horas):</span>
              </span>
              <span
                className={`font-mono font-black px-2 py-0.5 rounded ${
                  calculoTiempo.enPlazoInmediato
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {calculoTiempo.enPlazoInmediato
                  ? `Transcurrido: ${calculoTiempo.horas}h ${calculoTiempo.minutos}m (En plazo)`
                  : `Transcurrido: ${calculoTiempo.horas}h (¡Prioridad máxima!)`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>⏳</span>
                <span>Término SIUCE (48 horas legales):</span>
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Quedan: {calculoTiempo.horasSiuceRestantes} horas (Límite: {calculoTiempo.fechaLimiteSiuce})
              </span>
            </div>
          </div>
        )}

        {/* Tarjeta de Ruta Externa Activada (si ya fue realizada) */}
        {rutaExternaInfo && tipoSeleccionado === "TIPO_III" && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-300 text-xs text-emerald-950 flex items-center justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                ✓
              </span>
              <div>
                <p className="font-extrabold text-slate-900 leading-tight">
                  Ruta Externa Activada Formalmente
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Remitido a: <strong>{rutaExternaInfo.entidad || "Autoridad Competente"}</strong>{" "}
                  {rutaExternaInfo.radicado ? `• Radicado: ${rutaExternaInfo.radicado}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAbrirRemisionExterna}
              className="text-[10px] font-bold text-[#1B5E9E] hover:underline bg-white px-2 py-1 rounded-md border border-blue-200 cursor-pointer shadow-2xs"
            >
              Ver Oficio
            </button>
          </div>
        )}
      </div>

      {/* Barra de Progreso del Checklist */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
            <span>Progreso del Protocolo</span>
            <span className="font-mono text-[#1B5E9E]">
              {itemsCompletados} de {totalItems} pasos ({porcentaje}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                porcentaje === 100
                  ? "bg-emerald-500"
                  : porcentaje >= 60
                  ? "bg-[#1B5E9E]"
                  : "bg-amber-500"
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {porcentaje === 100 && (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-300 shrink-0">
            ✓ Protocolo Completo
          </span>
        )}
      </div>

      {/* Lista Interactiva de Pasos / Checklist */}
      <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
        {configActual.items.map((item, index) => {
          const checked = !!checklist[item.id];
          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all text-xs ${
                checked
                  ? "bg-slate-50/80 border-slate-300 opacity-90"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`check-${item.id}`}
                  checked={checked}
                  onChange={() => handleToggleItem(item.id)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#1B5E9E] focus:ring-[#1B5E9E] cursor-pointer"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label
                      htmlFor={`check-${item.id}`}
                      className={`font-black cursor-pointer ${
                        checked ? "text-slate-500 line-through" : "text-slate-800"
                      }`}
                    >
                      <span>{index + 1}. </span>
                      <span>{item.titulo}</span>
                    </label>

                    {item.esAccionEspecial && (
                      <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                        Acción Prioritaria
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[11px] leading-relaxed ${
                      checked ? "text-slate-400" : "text-slate-600 font-medium"
                    }`}
                  >
                    {item.detalle}
                  </p>

                  {/* Botón Destacado: «Activar Ruta Externa» para Tipo III */}
                  {item.esAccionEspecial && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onAbrirRemisionExterna}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:shadow-sm"
                      >
                        <span>🚨</span>
                        <span>
                          {rutaExternaInfo
                            ? "Ver / Re-imprimir Oficio de Remisión Externa"
                            : "Activar Ruta Externa (Abrir Paquete Oficial)"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer de Acciones del Asistente */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={handleCopiarAcciones}
          className="text-xs font-bold text-[#1B5E9E] hover:text-[#124270] flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs hover:bg-blue-50"
        >
          <span>{copiadoFeedback ? "✓" : "📋"}</span>
          <span>
            {copiadoFeedback
              ? "¡Acciones copiadas a notas!"
              : "Copiar acciones al seguimiento"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleRestablecerChecklist}
          className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          Reiniciar checklist
        </button>
      </div>
    </div>
  );
}
