import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import reporteService from "../../services/reporteService";
import {
  ESTADOS_CONFIG,
  TRANSICIONES_PERMITIDAS,
  normalizarEstado,
  getNombreEstado,
  getColorEstado,
  formatearFechaLocal,
  formatearFechaCompleta,
} from "../../utils/estadosReporte";

export default function BandejaReportesDocente() {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nivel_riesgo_predicho: "",
    estado: "",
    page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);

  // Estado para el Modal de Detalle/Edición
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formDataModal, setFormDataModal] = useState({
    estado: "",
    notas_orientador: "",
  });

  // Estado para la Línea de Tiempo de Cambios (HU-08)
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorGuardar, setErrorGuardar] = useState(null);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== "")
      );
      const data = await reporteService.listarReportes(params);

      if (data.results) {
        setReportes(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setReportes(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error al cargar reportes", error);
      if (error.response?.status === 401) {
        navigate("/docente/login");
        return;
      }
      // Fallback mock si la API aún no está disponible en desarrollo
      setReportes([
        {
          id: 1,
          codigo_seguimiento: "SV-88A92-2026",
          fecha_creacion: "2026-09-28T14:30:00Z",
          nivel_riesgo_predicho: "ALTO",
          estado: "en_revision",
          ubicacion: "Salon de clases",
          descripcion: "Insultos constantes por parte de dos compañeros durante el trabajo en equipo.",
          notas_orientador: "Se programó citación preliminar con el docente titular.",
          historial_cambios: [
            {
              estado_anterior: "nuevo",
              estado_nuevo: "en_revision",
              usuario_id: 1,
              usuario_nombre: "Psicorientadora Ana",
              fecha_cambio: "2026-09-28T15:00:00Z",
              comentario: "Apertura formal de revisión en comité.",
            },
          ],
        },
        {
          id: 2,
          codigo_seguimiento: "SV-42B10-2026",
          fecha_creacion: "2026-09-29T09:15:00Z",
          nivel_riesgo_predicho: "CRITICO",
          estado: "nuevo",
          ubicacion: "Redes sociales",
          descripcion: "Creación de grupo anónimo en WhatsApp difundiendo imágenes no autorizadas.",
          notas_orientador: "",
          historial_cambios: [],
        },
        {
          id: 3,
          codigo_seguimiento: "SV-19C03-2026",
          fecha_creacion: "2026-09-25T11:00:00Z",
          nivel_riesgo_predicho: "MEDIO",
          estado: "cerrado",
          ubicacion: "Descanso / Patio",
          descripcion: "Exclusión sistemática durante los juegos del descanso.",
          notas_orientador: "Caso atendido mediante taller de convivencia y acuerdo firmado.",
          historial_cambios: [
            {
              estado_anterior: "en_seguimiento",
              estado_nuevo: "cerrado",
              usuario_id: 1,
              usuario_nombre: "Psicorientadora Ana",
              fecha_cambio: "2026-09-27T10:30:00Z",
              comentario: "Compromisos cumplidos por ambas partes. Se archiva el caso.",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.nivel_riesgo_predicho, filtros.estado, filtros.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const getColorRiesgo = (riesgo) => {
    switch (riesgo) {
      case "BAJO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "MEDIO":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "ALTO":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "CRITICO":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Cargar historial del reporte seleccionado
  const cargarHistorial = async (idOcodigo, reporteRef = null) => {
    setCargandoHistorial(true);
    try {
      const data = await reporteService.obtenerHistorial(idOcodigo);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("No se pudo obtener el historial desde la API, usando datos locales:", err);
      const target = reporteRef || reporteSeleccionado;
      if (target && Array.isArray(target.historial_cambios)) {
        // Ordenar más reciente primero
        setHistorial([...target.historial_cambios].reverse());
      } else {
        setHistorial([]);
      }
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Abrir modal con los datos del reporte
  const handleAbrirModal = (item) => {
    const estadoNorm = normalizarEstado(item.estado);
    const itemNormalizado = { ...item, estado: estadoNorm };

    setReporteSeleccionado(itemNormalizado);
    setFormDataModal({
      estado: estadoNorm,
      notas_orientador: "",
    });
    setMostrarHistorial(false);
    setHistorial([]);
    setMensajeExito(null);
    setErrorGuardar(null);
  };

  // Toggle de la línea de tiempo de cambios
  const handleToggleHistorial = () => {
    const siguienteEstado = !mostrarHistorial;
    setMostrarHistorial(siguienteEstado);
    if (siguienteEstado && historial.length === 0 && reporteSeleccionado) {
      const targetId = reporteSeleccionado.id || reporteSeleccionado.codigo_seguimiento;
      cargarHistorial(targetId, reporteSeleccionado);
    }
  };

  // Guardar cambios del reporte (sin cerrar el modal)
  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setErrorGuardar(null);
    setMensajeExito(null);

    const estadoActual = normalizarEstado(reporteSeleccionado.estado);
    const nuevoEstado = normalizarEstado(formDataModal.estado);

    if (nuevoEstado === estadoActual) {
      setErrorGuardar("Seleccione un estado diferente al actual para guardar cambios.");
      return;
    }

    setGuardando(true);
    const targetId = reporteSeleccionado.id || reporteSeleccionado.codigo_seguimiento;

    try {
      if (reporteService.actualizarReporte) {
        await reporteService.actualizarReporte(targetId, {
          estado: nuevoEstado,
          notas_orientador: formDataModal.notas_orientador,
        });
      }

      // Actualizar estado en el modal sin cerrarlo
      setReporteSeleccionado((prev) => ({
        ...prev,
        estado: nuevoEstado,
      }));
      setFormDataModal((prev) => ({
        ...prev,
        estado: nuevoEstado,
        notas_orientador: "",
      }));

      // Actualizar tabla en background
      setReportes((prev) =>
        prev.map((r) =>
          (r.id && r.id === reporteSeleccionado.id) ||
          r.codigo_seguimiento === reporteSeleccionado.codigo_seguimiento
            ? { ...r, estado: nuevoEstado }
            : r
        )
      );

      setMensajeExito("¡Estado del reporte actualizado exitosamente!");
      setTimeout(() => setMensajeExito(null), 5000);

      // Refrescar inmediatamente el historial sin cerrar el modal
      await cargarHistorial(targetId);
      setMostrarHistorial(true);
    } catch (err) {
      console.error("Error actualizando reporte:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "No se pudo actualizar el estado del reporte. Verifique que la transición sea permitida.";
      setErrorGuardar(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DCEAF7]/40 flex font-sans text-slate-800">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 hidden md:flex z-10 shadow-xs">
        <div>
          <div className="p-5 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-[#DCEAF7] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold text-[#1B5E9E] text-base leading-tight">SafeVoice</h2>
              <p className="text-[11px] text-[#2C5F57] font-semibold">Portal Orientador</p>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-bold text-slate-600">
            <Link
              to="/docente/dashboard"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#1B5E9E] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Dashboard de Datos</span>
            </Link>

            <Link
              to="/docente/reportes"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#2C5F57] text-white shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>Bandeja de Reportes</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => navigate("/docente/login")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-700 transition-colors text-left cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Central de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-sm font-extrabold text-[#2C5F57]">Gestión de Casos de Convivencia</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCEAF7] flex items-center justify-center font-bold text-xs text-[#1B5E9E]">
              PO
            </div>
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-slate-800">Psicorientador(a)</p>
              <p className="text-[10px] text-[#2C5F57] font-semibold">Comité Institucional</p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-[#2C5F57]">Bandeja de Entrada de Reportes</h1>
              <p className="text-xs text-slate-500 mt-0.5">Revise, clasifique y dé seguimiento a las alertas recibidas.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
            {/* Buscador y Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="font-extrabold text-slate-800 text-base">Últimos Casos Recibidos</h2>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  name="nivel_riesgo_predicho"
                  value={filtros.nivel_riesgo_predicho}
                  onChange={handleFilterChange}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2C5F57]"
                >
                  <option value="">Todos los Riesgos IA</option>
                  <option value="CRITICO">Riesgo Crítico</option>
                  <option value="ALTO">Riesgo Alto</option>
                  <option value="MEDIO">Riesgo Medio</option>
                  <option value="BAJO">Riesgo Bajo</option>
                </select>

                <select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFilterChange}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2C5F57]"
                >
                  <option value="">Todos los Estados</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="en_seguimiento">En Seguimiento</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
            </div>

            {/* Tabla de Registros */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Código / Ticket</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Riesgo IA</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                        Cargando reportes...
                      </td>
                    </tr>
                  ) : reportes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                        No hay reportes que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    reportes.map((item) => (
                      <tr key={item.codigo_seguimiento} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1B5E9E]">
                          <div>{item.codigo_seguimiento}</div>
                          {(item.nombre_contacto_victima || item.medio_contacto_victima) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md mt-1">
                              👤 Con contacto
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(item.fecha_creacion).toLocaleDateString("es-CO")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getColorRiesgo(item.nivel_riesgo_predicho)}`}>
                            {item.nivel_riesgo_predicho}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-slate-700">{item.ubicacion}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getColorEstado(item.estado)}`}>
                            {getNombreEstado(item.estado)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleAbrirModal(item)}
                            className="bg-[#1B5E9E] hover:bg-blue-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            Ver / Editar Detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 font-semibold">
                <p>Mostrando página {filtros.page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={filtros.page === 1}
                    onClick={() => setFiltros((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={filtros.page === totalPages}
                    onClick={() => setFiltros((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL DE EDICIÓN Y DETALLE DEL REPORTE */}
      {reporteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden space-y-0">
            
            {/* Header Modal */}
            <div className="bg-[#1B5E9E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-white/20 px-2 py-0.5 rounded-md">
                  Caso #{reporteSeleccionado.codigo_seguimiento}
                </span>
                <h3 className="text-lg font-black mt-1">Detalle y Gestión del Reporte</h3>
              </div>
              <button
                onClick={() => setReporteSeleccionado(null)}
                className="text-white/80 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleGuardarCambios} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Información General */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Ubicación</p>
                  <p className="font-bold text-slate-800">{reporteSeleccionado.ubicacion}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Riesgo predicho por IA</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getColorRiesgo(reporteSeleccionado.nivel_riesgo_predicho)}`}>
                    {reporteSeleccionado.nivel_riesgo_predicho}
                  </span>
                </div>
              </div>

              {/* Descripción Anónima del Estudiante */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción enviada por el estudiante:
                </label>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed">
                  "{reporteSeleccionado.descripcion}"
                </div>
              </div>

              {/* Datos de contacto (si el estudiante decidió identificarse) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Datos de contacto del estudiante:
                </label>
                {reporteSeleccionado.nombre_contacto_victima || reporteSeleccionado.medio_contacto_victima ? (
                  <div className="grid grid-cols-2 gap-3 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs">
                    <div>
                      <p className="text-emerald-700/80 font-bold uppercase text-[10px]">Nombre</p>
                      <p className="font-bold text-slate-800 break-words mt-0.5">
                        {reporteSeleccionado.nombre_contacto_victima || "No indicado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700/80 font-bold uppercase text-[10px]">Medio de contacto</p>
                      <p className="font-bold text-slate-800 break-words mt-0.5">
                        {reporteSeleccionado.medio_contacto_victima || "No indicado"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-500 italic">
                    El estudiante prefirió mantener el reporte 100% anónimo (no suministró nombre ni medio de contacto).
                  </div>
                )}
              </div>

              {/* Alertas de éxito o error */}
              {mensajeExito && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fade-in">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{mensajeExito}</span>
                </div>
              )}

              {errorGuardar && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-800 animate-fade-in">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errorGuardar}</span>
                </div>
              )}

              {/* Selector Estado del Reporte */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="selector-estado" className="block text-xs font-bold text-slate-700">
                    Estado del Reporte:
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getColorEstado(
                      reporteSeleccionado.estado
                    )}`}
                  >
                    Actual: {getNombreEstado(reporteSeleccionado.estado)}
                  </span>
                </div>

                {(() => {
                  const estadoActual = normalizarEstado(reporteSeleccionado.estado);
                  const permitidos = TRANSICIONES_PERMITIDAS[estadoActual] || [];

                  return (
                    <>
                      <select
                        id="selector-estado"
                        value={formDataModal.estado}
                        onChange={(e) => {
                          setFormDataModal({ ...formDataModal, estado: e.target.value });
                          setErrorGuardar(null);
                        }}
                        disabled={permitidos.length === 0}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] disabled:opacity-60 cursor-pointer"
                      >
                        {/* Estado actual */}
                        <option value={estadoActual}>
                          {getNombreEstado(estadoActual)} — (Estado actual)
                        </option>

                        {/* Opciones disponibles según transiciones permitidas */}
                        {Object.keys(ESTADOS_CONFIG).map((clave) => {
                          if (clave === estadoActual) return null;
                          const esPermitido = permitidos.includes(clave);
                          return (
                            <option key={clave} value={clave} disabled={!esPermitido}>
                              {getNombreEstado(clave)} — {ESTADOS_CONFIG[clave].subtext}{" "}
                              {!esPermitido ? "(No permitido)" : ""}
                            </option>
                          );
                        })}
                      </select>

                      {permitidos.length === 0 && (
                        <p className="text-[11px] text-slate-500 italic mt-1">
                          El reporte está en estado cerrado y no admite más transiciones.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Campo de texto de notas / comentarios */}
              <div>
                <label htmlFor="notas-seguimiento" className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Seguimiento (Orientación / Dirección):
                </label>
                <textarea
                  id="notas-seguimiento"
                  rows="2"
                  value={formDataModal.notas_orientador}
                  onChange={(e) => setFormDataModal({ ...formDataModal, notas_orientador: e.target.value })}
                  placeholder="Escriba las acciones tomadas, compromisos o citaciones (opcional)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                />
              </div>

              {/* Botón Cambios del reporte */}
              <div>
                <button
                  id="btn-cambios-reporte"
                  type="button"
                  aria-expanded={mostrarHistorial}
                  aria-controls="panel-historial-cambios"
                  onClick={handleToggleHistorial}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-300 hover:border-[#1B5E9E] bg-white hover:bg-slate-50 text-slate-700 hover:text-[#1B5E9E] text-xs font-bold transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-slate-500 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Cambios del reporte</span>
                    {historial.length > 0 && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {historial.length}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      mostrarHistorial ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Panel de Línea de Tiempo de Cambios (Estilo GitHub issue timeline) */}
              {mostrarHistorial && (
                <div
                  id="panel-historial-cambios"
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Línea de tiempo de cambios
                    </h4>
                    {cargandoHistorial && (
                      <span className="text-[10px] text-slate-400 font-semibold animate-pulse">
                        Cargando...
                      </span>
                    )}
                  </div>

                  {cargandoHistorial ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      Cargando historial de cambios...
                    </div>
                  ) : historial.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium italic">
                      Sin cambios de estado todavía
                    </div>
                  ) : (
                    <div className="relative pl-6 pt-1 space-y-4">
                      {/* Línea vertical conectora continua */}
                      <div
                        className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />

                      {historial.map((cambio, idx) => (
                        <div key={idx} className="relative text-xs">
                          {/* Ícono de evento sobre la línea */}
                          <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-[#1B5E9E] text-[#1B5E9E] flex items-center justify-center shadow-2xs z-10">
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </div>

                          {/* Fila del evento */}
                          <div className="flex flex-wrap items-baseline gap-1.5 text-slate-700 leading-relaxed">
                            <span className="font-extrabold text-slate-900">
                              {cambio.usuario_nombre || cambio.nombre_orientador || "Orientador"}
                            </span>
                            <span className="text-slate-500">cambió el estado de</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getColorEstado(
                                cambio.estado_anterior
                              )}`}
                            >
                              {getNombreEstado(cambio.estado_anterior)}
                            </span>
                            <span className="text-slate-500">a</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getColorEstado(
                                cambio.estado_nuevo
                              )}`}
                            >
                              {getNombreEstado(cambio.estado_nuevo)}
                            </span>
                            <span
                              className="text-[11px] text-slate-400 font-medium ml-auto"
                              title={formatearFechaCompleta(cambio.fecha_cambio || cambio.fecha)}
                            >
                              {formatearFechaLocal(cambio.fecha_cambio || cambio.fecha)}
                            </span>
                          </div>

                          {/* Comentario secundario si existe */}
                          {cambio.comentario && (
                            <div className="mt-1.5 bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-600 text-xs italic shadow-2xs">
                              "{cambio.comentario}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Modal */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReporteSeleccionado(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || normalizarEstado(formDataModal.estado) === normalizarEstado(reporteSeleccionado.estado)}
                  className="px-5 py-2.5 rounded-xl bg-[#2C5F57] hover:bg-[#234b44] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}