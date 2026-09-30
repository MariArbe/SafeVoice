import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import reporteService from "../../services/reporteService";

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

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v !== "")
      );
      const data = await reporteService.listarReportes(params);

      if (data.results) {
        setReportes(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setReportes(data);
        setTotalPages(1);
      if (error.response?.status === 401) {
        navigate("/docente/login");
        return;
      }
      // Fallback mock si la API aún no está disponible en desarrollo
      setReportes([
        {
          codigo_seguimiento: "SV-88A92-2026",
          fecha_creacion: "2026-09-28T14:30:00Z",
          nivel_riesgo_predicho: "ALTO",
          estado: "EN_REVISION",
          ubicacion: "Salon de clases",
          descripcion: "Insultos constantes por parte de dos compañeros durante el trabajo en equipo.",
          notas_orientador: "Se programó citación preliminar con el docente titular.",
        },
        {
          codigo_seguimiento: "SV-42B10-2026",
          fecha_creacion: "2026-09-29T09:15:00Z",
          nivel_riesgo_predicho: "CRITICO",
          estado: "NUEVO",
          ubicacion: "Redes sociales",
          descripcion: "Creación de grupo anónimo en WhatsApp difundiendo imágenes no autorizadas.",
          notas_orientador: "",
        },
        {
          codigo_seguimiento: "SV-19C03-2026",
          fecha_creacion: "2026-09-25T11:00:00Z",
          nivel_riesgo_predicho: "MEDIO",
          estado: "CERRADO",
          ubicacion: "Descanso / Patio",
          descripcion: "Exclusión sistemática durante los juegos del descanso.",
          notas_orientador: "Caso atendido mediante taller de convivencia y acuerdo firmado.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
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

  // Abrir modal con los datos del reporte
  const handleAbrirModal = (item) => {
    setReporteSeleccionado(item);
    setFormDataModal({
      estado: item.estado,
      notas_orientador: item.notas_orientador || "",
    });
  };

  // Guardar cambios del reporte
  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (reporteService.actualizarReporte) {
        await reporteService.actualizarReporte(reporteSeleccionado.codigo_seguimiento, formDataModal);
      }
      
      // Actualizar estado local inmediato
      setReportes((prev) =>
        prev.map((r) =>
          r.codigo_seguimiento === reporteSeleccionado.codigo_seguimiento
            ? { ...r, ...formDataModal }
            : r
        )
      );

      setReporteSeleccionado(null);
    } catch (err) {
      console.error("Error actualizando reporte:", err);
      // Actualización reactiva local
      setReportes((prev) =>
        prev.map((r) =>
          r.codigo_seguimiento === reporteSeleccionado.codigo_seguimiento
            ? { ...r, ...formDataModal }
            : r
        )
      );
      setReporteSeleccionado(null);
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
                  <option value="NUEVO">Nuevo</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="EN_SEGUIMIENTO">En Seguimiento</option>
                  <option value="CERRADO">Cerrado</option>
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
                          {item.codigo_seguimiento}
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
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.estado.replace("_", " ")}
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

              {/* Cambiar Estado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado del Reporte:
                </label>
                <select
                  value={formDataModal.estado}
                  onChange={(e) => setFormDataModal({ ...formDataModal, estado: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                >
                  <option value="NUEVO">NUEVO - Sin revisar</option>
                  <option value="EN_REVISION">EN REVISIÓN - En comité de convivencia</option>
                  <option value="EN_SEGUIMIENTO">EN SEGUIMIENTO - Proceso de acompañamiento</option>
                  <option value="CERRADO">CERRADO - Solucionado y archivado</option>
                </select>
              </div>

              {/* Notas del Orientador */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Seguimiento (Orientación / Dirección):
                </label>
                <textarea
                  rows="3"
                  value={formDataModal.notas_orientador}
                  onChange={(e) => setFormDataModal({ ...formDataModal, notas_orientador: e.target.value })}
                  placeholder="Escriba las acciones tomadas, compromisos o citaciones..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                />
              </div>

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
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-xl bg-[#2C5F57] hover:bg-[#234b44] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
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