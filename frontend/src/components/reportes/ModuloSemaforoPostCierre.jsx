import { useState, useMemo } from "react";
import reporteService from "../../services/reporteService";

export default function ModuloSemaforoPostCierre({
  reporte,
  onChequeoRegistrado,
}) {
  if (!reporte) return null;

  // Estado para el modal de registro de chequeo
  const [hitoActivo, setHitoActivo] = useState(null); // 'DIA_15' | 'DIA_30' | 'DIA_60'
  const [semaforoSeleccionado, setSemaforoSeleccionado] = useState("VERDE");
  const [observaciones, setObservaciones] = useState("");
  const [reactivarCaso, setReactivarCaso] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState(null);

  // Determinar la fecha de cierre del caso
  const fechaCierre = useMemo(() => {
    const cambios = reporte.historial_cambios || [];
    // Buscar la última transición donde el estado nuevo fue cerrado
    const cierreEntry = [...cambios]
      .reverse()
      .find((c) => c.estado_nuevo === "cerrado");

    if (cierreEntry && cierreEntry.fecha_cambio) {
      return new Date(cierreEntry.fecha_cambio);
    }
    if (reporte.fecha_actualizacion) {
      return new Date(reporte.fecha_actualizacion);
    }
    return new Date();
  }, [reporte.historial_cambios, reporte.fecha_actualizacion]);

  // Extraer chequeos ya registrados en el historial de cambios
  const chequeosRegistrados = useMemo(() => {
    const mapa = {};
    const cambios = reporte.historial_cambios || [];
    for (const c of cambios) {
      if (
        (c.tipo_accion === "CHEQUEO_POST_CIERRE" ||
          c.tipo_accion === "REACTIVACION_REINCIDENCIA") &&
        c.metadata &&
        c.metadata.hito
      ) {
        mapa[c.metadata.hito] = {
          semaforo: c.metadata.semaforo,
          observaciones: c.metadata.observaciones || c.comentario || "",
          fecha: c.fecha_cambio,
          usuario_nombre: c.usuario_nombre || "Orientador",
          reactivado: !!c.metadata.reactivado,
        };
      }
    }
    return mapa;
  }, [reporte.historial_cambios]);

  // Configuración de los 3 hitos longitudinales (15, 30 y 60 días)
  const hitos = useMemo(() => {
    const ahora = new Date();
    const configHitos = [
      {
        id: "DIA_15",
        dias: 15,
        titulo: "Día 15: Verificación Inmediata",
        subtitulo: "¿Cesó el hostigamiento inmediato en descansos y aulas?",
        objetivo:
          "Comprobar el cese de conductas agresivas y la sensación de seguridad inicial de la víctima.",
      },
      {
        id: "DIA_30",
        dias: 30,
        titulo: "Día 30: Consolidación y Convivencia",
        subtitulo: "¿Se mantienen los compromisos y el clima de respeto?",
        objetivo:
          "Verificar que no haya surgido exclusión sutil o tensiones encubiertas con directores de grupo.",
      },
      {
        id: "DIA_60",
        dias: 60,
        titulo: "Día 60: Cierre y Sostenibilidad",
        subtitulo: "Evaluación final de convivencia armónica sostenible",
        objetivo:
          "Confirmar la reintegración armónica de las partes y certificar el éxito de la intervención.",
      },
    ];

    return configHitos.map((h) => {
      const fechaObjetivo = new Date(fechaCierre.getTime() + h.dias * 24 * 60 * 60 * 1000);
      const evaluado = chequeosRegistrados[h.id] || null;
      const esVencido = !evaluado && ahora >= fechaObjetivo;
      const diasFaltantes = Math.ceil((fechaObjetivo - ahora) / (1000 * 60 * 60 * 24));

      return {
        ...h,
        fechaObjetivo,
        evaluado,
        esVencido,
        diasFaltantes,
      };
    });
  }, [fechaCierre, chequeosRegistrados]);

  // Semáforo global vigente (el más reciente o crítico)
  const semaforoGlobal = useMemo(() => {
    const vals = Object.values(chequeosRegistrados);
    if (vals.some((v) => v.semaforo === "ROJO")) {
      return {
        color: "bg-rose-100 text-rose-800 border-rose-300",
        icono: "🔴",
        texto: "Reincidencia Detectada — Caso en Atención",
      };
    }
    if (vals.some((v) => v.semaforo === "AMARILLO")) {
      return {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icono: "🟡",
        texto: "Tensión Residual — Requiere Seguimiento Informal",
      };
    }
    if (vals.some((v) => v.semaforo === "VERDE")) {
      return {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icono: "🟢",
        texto: "Convivencia Normalizada y Estable",
      };
    }
    return {
      color: "bg-slate-100 text-slate-700 border-slate-300",
      icono: "⏳",
      texto: "En Seguimiento Longitudinal (Chequeos Programados)",
    };
  }, [chequeosRegistrados]);

  const abrirFormularioChequeo = (hitoId) => {
    const previo = chequeosRegistrados[hitoId];
    setHitoActivo(hitoId);
    setSemaforoSeleccionado(previo ? previo.semaforo : "VERDE");
    setObservaciones(previo ? previo.observaciones : "");
    setReactivarCaso(false);
    setErrorGuardar(null);
  };

  const handleGuardarChequeo = async (e) => {
    e.preventDefault();
    if (!hitoActivo) return;

    setGuardando(true);
    setErrorGuardar(null);

    const targetId = reporte.id || reporte.codigo_seguimiento;

    try {
      const reporteActualizado = await reporteService.registrarChequeoPostCierre(targetId, {
        hito: hitoActivo,
        semaforo: semaforoSeleccionado,
        observaciones: observaciones.trim(),
        reactivar_caso: reactivarCaso && semaforoSeleccionado === "ROJO",
      });

      if (onChequeoRegistrado) {
        onChequeoRegistrado(reporteActualizado);
      }
      setHitoActivo(null);
    } catch (err) {
      console.error("Error al registrar chequeo post-cierre:", err);
      setErrorGuardar(
        err.response?.data?.error || "Ocurrió un error al guardar el chequeo en el servidor."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white space-y-0">
      {/* Cabecera del Módulo Semáforo */}
      <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg shadow-xs">
            🚦
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black tracking-wide">
                Semáforo de Convivencia y Chequeos Post-Cierre
              </h4>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-md">
                Ley 1620
              </span>
            </div>
            <p className="text-[11px] text-teal-100/80 mt-0.5">
              Monitoreo longitudinal a 15, 30 y 60 días para prevenir represalias o reincidencia
            </p>
          </div>
        </div>

        {/* Badge Semáforo Global */}
        <span
          className={`text-[10px] font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-2xs ${semaforoGlobal.color}`}
        >
          <span>{semaforoGlobal.icono}</span>
          <span>{semaforoGlobal.texto}</span>
        </span>
      </div>

      {/* Información de Fecha de Cierre */}
      <div className="bg-slate-50 p-3 px-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          <span className="text-slate-400 font-bold uppercase text-[10px] block">
            Fecha de Cierre del Caso:
          </span>
          <span className="font-semibold text-slate-800">
            {fechaCierre.toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 italic max-w-sm">
          💡 La Ley 1620 exige que el cierre de un caso incluya seguimiento periódico documentado para garantizar que la víctima no sufra represalias.
        </p>
      </div>

      {/* Las 3 Tarjetas de Hitos (15, 30 y 60 Días) */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {hitos.map((hito) => {
          const { evaluado, esVencido, diasFaltantes, fechaObjetivo } = hito;
          const fechaStr = fechaObjetivo.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={hito.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                evaluado?.semaforo === "ROJO"
                  ? "bg-rose-50/60 border-rose-300 ring-1 ring-rose-200"
                  : evaluado?.semaforo === "AMARILLO"
                  ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-200"
                  : evaluado?.semaforo === "VERDE"
                  ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200"
                  : esVencido
                  ? "bg-rose-50/40 border-rose-300 animate-pulse"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                {/* Cabecera del Hito */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
                    {hito.id.replace("_", " ")}
                  </span>

                  {evaluado ? (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        evaluado.semaforo === "ROJO"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : evaluado.semaforo === "AMARILLO"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      {evaluado.semaforo === "ROJO"
                        ? "🔴 Reincidencia"
                        : evaluado.semaforo === "AMARILLO"
                        ? "🟡 Tensión"
                        : "🟢 Normalizado"}
                    </span>
                  ) : esVencido ? (
                    <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                      🔔 Requiere Chequeo
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      En {diasFaltantes} días
                    </span>
                  )}
                </div>

                <h5 className="text-xs font-black text-slate-800 leading-tight">
                  {hito.titulo}
                </h5>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {hito.subtitulo}
                </p>

                {/* Fecha Programada o Fecha de Verificación */}
                <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                  <p>
                    <span className="font-semibold text-slate-600">Fecha objetivo:</span>{" "}
                    <span className="font-mono">{fechaStr}</span>
                  </p>

                  {evaluado && (
                    <div className="mt-2 p-2 rounded-xl bg-white/90 border border-slate-200 text-[11px] text-slate-700 space-y-1 shadow-2xs">
                      <p className="italic text-slate-800 leading-relaxed font-serif">
                        "{evaluado.observaciones || "Sin observaciones adicionales."}"
                      </p>
                      <p className="text-[9px] text-slate-400 font-sans">
                        Por: <strong>{evaluado.usuario_nombre}</strong> •{" "}
                        {new Date(evaluado.fecha).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Acción */}
              <button
                type="button"
                onClick={() => abrirFormularioChequeo(hito.id)}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 ${
                  evaluado
                    ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
                    : esVencido
                    ? "bg-rose-600 hover:bg-rose-700 text-white font-black"
                    : "bg-[#1B5E9E] hover:bg-[#124270] text-white"
                }`}
              >
                <span>{evaluado ? "✏️ Actualizar" : "📝 Registrar Chequeo"}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* FORMULARIO MODAL INTERACTIVO PARA REGISTRAR CHEQUEO */}
      {hitoActivo && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h5 className="text-xs font-black text-slate-800">
                Registrar Chequeo de Convivencia — {hitoActivo.replace("_", " ")}
              </h5>
            </div>
            <button
              type="button"
              onClick={() => setHitoActivo(null)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
            >
              ✕ Cerrar
            </button>
          </div>

          <form onSubmit={handleGuardarChequeo} className="space-y-3.5">
            {errorGuardar && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
                ⚠️ {errorGuardar}
              </div>
            )}

            {/* Selector de Semáforo */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider">
                1. Selecciona el Estado del Semáforo de Convivencia:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 🟢 VERDE */}
                <button
                  type="button"
                  onClick={() => {
                    setSemaforoSeleccionado("VERDE");
                    setReactivarCaso(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    semaforoSeleccionado === "VERDE"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🟢</span>
                    <span className="text-xs font-black text-emerald-950">
                      Verde: Normalizado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Convivencia pacífica. La víctima manifiesta sentirse segura y los acuerdos se cumplen.
                  </p>
                </button>

                {/* 🟡 AMARILLO */}
                <button
                  type="button"
                  onClick={() => {
                    setSemaforoSeleccionado("AMARILLO");
                    setReactivarCaso(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    semaforoSeleccionado === "AMARILLO"
                      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400/30 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🟡</span>
                    <span className="text-xs font-black text-amber-950">
                      Amarillo: Tensión
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Tensión residual, miradas o frialdad. Requiere una charla formativa informal sin reabrir caso.
                  </p>
                </button>

                {/* 🔴 ROJO */}
                <button
                  type="button"
                  onClick={() => {
                    setSemaforoSeleccionado("ROJO");
                    setReactivarCaso(true);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    semaforoSeleccionado === "ROJO"
                      ? "bg-rose-50 border-rose-500 ring-2 ring-rose-400/30 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔴</span>
                    <span className="text-xs font-black text-rose-950">
                      Rojo: Reincidencia
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Reincidencia o represalias contra la víctima. Incumplimiento grave de compromisos.
                  </p>
                </button>
              </div>
            </div>

            {/* Observaciones del Chequeo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Observaciones y Hallazgos del Chequeo:
              </label>
              <textarea
                rows="2"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Se dialogó en privado con el estudiante y el docente titular. La víctima manifiesta tranquilidad y buen trato..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
              />
            </div>

            {/* Alerta y Opción de Reactivación Inmediata (si es ROJO) */}
            {semaforoSeleccionado === "ROJO" && (
              <div className="p-3.5 rounded-2xl bg-rose-100/70 border border-rose-300 text-xs text-rose-950 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚨</span>
                  <p className="font-extrabold text-rose-900">
                    Alerta de Reincidencia o Represalias
                  </p>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Conforme a la Ley 1620, cuando se evidencian represalias o la conducta persiste tras un acuerdo, el caso debe ser reactivado formalmente para intervención prioritaria.
                </p>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer font-bold text-rose-950">
                  <input
                    type="checkbox"
                    checked={reactivarCaso}
                    onChange={(e) => setReactivarCaso(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-400 cursor-pointer"
                  />
                  <span>
                    Reactivar caso inmediatamente a estado «En Seguimiento»
                  </span>
                </label>
              </div>
            )}

            {/* Botones del Formulario */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setHitoActivo(null)}
                disabled={guardando}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                  semaforoSeleccionado === "ROJO"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#2C5F57] hover:bg-[#234b44]"
                }`}
              >
                <span>✓</span>
                <span>{guardando ? "Guardando..." : "Guardar Chequeo Post-Cierre"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
