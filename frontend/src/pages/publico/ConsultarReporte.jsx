import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BotonSalidaRapida from "../../components/ui/BotonSalidaRapida";
import NavbarPublico from "../../components/ui/NavbarPublico";
import reporteService from "../../services/reporteService";

const ETAPAS_PROCESO = [
  {
    key: "nuevo",
    titulo: "Reporte Recibido",
    descripcion: "Tu caso fue registrado de forma 100% confidencial y está en la bandeja de orientación.",
  },
  {
    key: "en_revision",
    titulo: "En Revisión",
    descripcion: "El orientador escolar está evaluando la situación y activando la ruta de atención.",
  },
  {
    key: "en_seguimiento",
    titulo: "En Seguimiento",
    descripcion: "Se están realizando acciones pedagógicas, de protección y acompañamiento en el colegio.",
  },
  {
    key: "cerrado",
    titulo: "Caso Cerrado",
    descripcion: "Las actuaciones institucionales de este reporte finalizaron y quedaron documentadas.",
  },
];

const ESTADO_LABELS = {
  nuevo: "Recibido / Nuevo",
  en_revision: "En Revisión",
  en_seguimiento: "En Seguimiento",
  cerrado: "Caso Cerrado",
  en_proceso: "En Proceso",
  resuelto: "Cerrado",
};

const normalizarEstado = (valor) => {
  if (!valor) return "nuevo";
  const limpio = String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
  if (limpio === "en_proceso") return "en_seguimiento";
  if (limpio === "resuelto") return "cerrado";
  return limpio;
};

const obtenerIndiceEtapa = (estado) => {
  const norm = normalizarEstado(estado);
  const idx = ETAPAS_PROCESO.findIndex((e) => e.key === norm);
  return idx === -1 ? 0 : idx;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizarCodigo = (raw) => {
  if (!raw) return "";
  let clean = String(raw).trim().replace(/["']/g, "").replace(/\s+/g, "");
  // Si tiene 32 caracteres hexadecimales continuos sin guiones, formatear a UUID estándar
  if (/^[0-9a-f]{32}$/i.test(clean)) {
    clean = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  return clean.toLowerCase();
};

export default function ConsultarReporte() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const codigoInicial = searchParams.get("codigo") || searchParams.get("codigo_seguimiento") || "";

  const [codigoInput, setCodigoInput] = useState(codigoInicial);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const buscarReporte = useCallback(
    async (codigoABuscar) => {
      const limpio = normalizarCodigo(codigoABuscar);
      if (!limpio) {
        setError("Por favor ingresa tu código de seguimiento.");
        return;
      }

      if (!UUID_REGEX.test(limpio)) {
        setError(
          "El formato del código no es válido. Debe ser el código único de 36 caracteres (ej. 550e8400-e29b-41d4-a716-446655440000) que recibiste al enviar tu reporte."
        );
        setReporte(null);
        return;
      }

      setCodigoInput(limpio);
      setLoading(true);
      setError(null);

      try {
        const data = await reporteService.consultarReporte(limpio);
        setReporte(data);
        setSearchParams({ codigo: limpio }, { replace: true });
      } catch (err) {
        setReporte(null);
        const status = err.response?.status;
        if (status === 404) {
          setError("No encontramos ningún reporte asociado a este código. Verifica que esté bien escrito.");
        } else if (status === 400) {
          setError("El código ingresado no tiene un formato válido. Revisa que esté completo.");
        } else {
          setError("Ocurrió un problema al consultar tu reporte. Por favor intenta de nuevo en unos segundos.");
        }
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (codigoInicial) {
      const norm = normalizarCodigo(codigoInicial);
      if (UUID_REGEX.test(norm)) {
        buscarReporte(norm);
      }
    }
  }, [codigoInicial, buscarReporte]);

  const handleSubmit = (e) => {
    e.preventDefault();
    buscarReporte(codigoInput);
  };

  const handlePegarCodigo = async () => {
    try {
      const texto = await navigator.clipboard.readText();
      if (texto) {
        setCodigoInput(texto.trim());
        setError(null);
      }
    } catch {
      // Si el navegador bloquea el portapapeles sin foco, ignorar silenciosamente
    }
  };

  const handleLimpiar = () => {
    setCodigoInput("");
    setReporte(null);
    setError(null);
    setSearchParams({}, { replace: true });
  };

  const formatearFecha = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Construir historial público unificando historial_cambios y historial_estados
  const obtenerHistorialPublico = (rep) => {
    if (!rep) return [];
    if (Array.isArray(rep.historial_cambios) && rep.historial_cambios.length > 0) {
      return [...rep.historial_cambios].reverse().map((item, idx) => ({
        id: idx,
        estado_anterior: item.estado_anterior,
        estado_nuevo: item.estado_nuevo,
        comentario: item.comentario || item.observaciones || "",
        fecha: item.fecha_cambio || item.fecha,
      }));
    }
    if (Array.isArray(rep.historial_estados) && rep.historial_estados.length > 0) {
      return [...rep.historial_estados].map((item, idx) => ({
        id: item.id || idx,
        estado_anterior: item.estado_anterior,
        estado_nuevo: item.estado_nuevo,
        comentario: item.observaciones || item.comentario || "",
        fecha: item.fecha_atencion || item.fecha_cambio,
      }));
    }
    return [];
  };

  const indiceActual = reporte ? obtenerIndiceEtapa(reporte.estado) : 0;
  const estadoNorm = reporte ? normalizarEstado(reporte.estado) : "nuevo";
  const historial = obtenerHistorialPublico(reporte);
  const riesgoActual = reporte
    ? (reporte.nivel_riesgo_confirmado || reporte.nivel_riesgo_predicho || "MEDIO").toUpperCase()
    : null;

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      <NavbarPublico />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Encabezado de página */}
        <div className="text-center space-y-2.5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold tracking-wide uppercase shadow-2xs">
            <svg className="w-4 h-4 text-[#2C5F57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Seguimiento 100% Anónimo
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E9E]">
            Consultar Estado de mi Reporte
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Ingresa el código único de seguimiento que recibiste al enviar tu reporte para conocer los avances y las observaciones del equipo de orientación escolar.
          </p>
        </div>

        {/* Buscador de código */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="codigo-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Código de Seguimiento (UUID)
              </label>
              <button
                type="button"
                onClick={handlePegarCodigo}
                className="text-xs font-bold text-[#1B5E9E] hover:text-[#2C5F57] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Pegar desde portapapeles
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="codigo-input"
                  type="text"
                  value={codigoInput}
                  onChange={(e) => {
                    setCodigoInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ej. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]/30 focus:border-[#1B5E9E] transition-all"
                />
                {codigoInput && (
                  <button
                    type="button"
                    onClick={handleLimpiar}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Limpiar código"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm px-7 py-3.5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Consultar Estado</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Resultado de la Consulta */}
        {reporte && (
          <div className="space-y-6">
            {/* Tarjeta Principal de Estado y Progreso */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-7">
              {/* Cabecera del caso */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Código de Seguimiento Verificado
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono font-extrabold text-base sm:text-lg text-[#1B5E9E] break-all">
                      {reporte.codigo_seguimiento}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(reporte.codigo_seguimiento);
                        setCodigoCopiado(true);
                        setTimeout(() => setCodigoCopiado(false), 2500);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#1B5E9E] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                      title="Copiar código al portapapeles"
                    >
                      {codigoCopiado ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ¡Copiado! ✓
                        </span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold border shadow-2xs ${
                      estadoNorm === "cerrado"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : estadoNorm === "en_seguimiento"
                        ? "bg-blue-50 text-[#1B5E9E] border-blue-200"
                        : estadoNorm === "en_revision"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        estadoNorm === "cerrado"
                          ? "bg-emerald-500"
                          : estadoNorm === "en_seguimiento"
                          ? "bg-[#1B5E9E] animate-pulse"
                          : estadoNorm === "en_revision"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-purple-500 animate-pulse"
                      }`}
                    />
                    Estado Actual: {ESTADO_LABELS[estadoNorm] || reporte.estado}
                  </span>
                </div>
              </div>

              {/* Barra de Progreso de 4 Etapas */}
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Progreso de Atención Institucional
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {ETAPAS_PROCESO.map((etapa, idx) => {
                    const completada = idx < indiceActual || estadoNorm === "cerrado";
                    const activa = idx === indiceActual && estadoNorm !== "cerrado";
                    return (
                      <div
                        key={etapa.key}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          activa
                            ? "bg-[#DCEAF7]/40 border-[#1B5E9E] ring-1 ring-[#1B5E9E]/30 shadow-2xs"
                            : completada
                            ? "bg-emerald-50/40 border-emerald-200"
                            : "bg-slate-50/60 border-slate-200/70 opacity-65"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center ${
                              completada
                                ? "bg-[#2C5F57] text-white"
                                : activa
                                ? "bg-[#1B5E9E] text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {completada ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </span>
                          {activa && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B5E9E] text-white">
                              Actual
                            </span>
                          )}
                          {completada && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2C5F57]">
                              Completado
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-800">{etapa.titulo}</h3>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{etapa.descripcion}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de Datos del Caso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fecha de Recepción
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {formatearFecha(reporte.fecha_creacion)}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Última Actualización
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {formatearFecha(reporte.fecha_actualizacion || reporte.fecha_creacion)}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Zona / Ubicación
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {reporte.ubicacion || "No especificada"}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Modalidad de Protección
                  </span>
                  <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-[#2C5F57] border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {reporte.acepta_revelar_identidad ? "Acompañamiento Directo" : "100% Anónimo y Confidencial"}
                  </span>
                </div>
              </div>
            </div>

            {/* Línea de Tiempo de Actuaciones del Orientador */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">
                    Bitácora de Seguimiento del Orientador
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actualizaciones y observaciones registradas por el equipo de convivencia escolar
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCEAF7]/60 text-[#1B5E9E]">
                  {historial.length} {historial.length === 1 ? "actualización" : "actualizaciones"}
                </span>
              </div>

              {historial.length === 0 ? (
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCEAF7] text-[#1B5E9E] flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Tu reporte está registrado y pendiente de la primera actualización del orientador.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Tan pronto el equipo de orientación cambie el estado o registre una observación sobre el caso, aparecerá aquí automáticamente.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historial.map((item, idx) => {
                    const estNuevo = normalizarEstado(item.estado_nuevo);
                    const estAnt = normalizarEstado(item.estado_anterior);
                    return (
                      <div key={item.id || idx} className="relative bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                        <span
                          className={`absolute -left-[21px] top-5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                            idx === 0 ? "bg-[#2C5F57]" : "bg-[#1B5E9E]"
                          }`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-200/80 text-slate-600">
                              {ESTADO_LABELS[estAnt] || item.estado_anterior}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#DCEAF7] text-[#1B5E9E]">
                              {ESTADO_LABELS[estNuevo] || item.estado_nuevo}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">
                            {formatearFecha(item.fecha)}
                          </span>
                        </div>

                        {item.comentario ? (
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60 mt-2">
                            {item.comentario}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            El equipo de orientación actualizó el estado del caso.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Banner de apoyo inmediato */}
        <div className="bg-white/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-[#1B5E9E] text-white flex items-center justify-center shrink-0 hidden sm:flex">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">¿Necesitas hablar con alguien de inmediato?</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Conoce las líneas gratuitas de atención psicológica, convivencia escolar y protección infantil 24/7.
              </p>
            </div>
          </div>
          <Link
            to="/lineas-ayuda"
            className="text-xs font-bold text-[#1B5E9E] hover:text-white bg-[#DCEAF7] hover:bg-[#1B5E9E] px-4 py-2.5 rounded-xl transition-all shrink-0"
          >
            Ver Líneas de Ayuda →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80 gap-2">
        <span>SafeVoice &bull; Plataforma Anónima de Convivencia Escolar</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>

      <BotonSalidaRapida />
    </div>
  );
}
