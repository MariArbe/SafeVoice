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
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      // Limpiar filtros vacíos
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v !== "")
      );
      const data = await reporteService.listarReportes(params);
      
      // Manejar respuesta paginada de Django
      if (data.results) {
        setReportes(data.results);
        // Suponiendo que PAGE_SIZE=20 y count es el total de items
        setTotalPages(Math.ceil(data.count / 20)); 
      } else {
        // En caso de que no venga paginado (aunque lo acabamos de configurar)
        setReportes(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error al cargar reportes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, [filtros.nivel_riesgo_predicho, filtros.estado, filtros.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const getColorRiesgo = (riesgo) => {
    switch(riesgo) {
      case 'BAJO': return 'bg-green-100 text-green-700 border-green-200';
      case 'MEDIO': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ALTO': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'CRITICO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 bg-[#1B5E9E] rounded-full flex items-center justify-center text-white font-bold text-xs">
              SV
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">SafeVoice</h2>
              <p className="text-[11px] text-slate-400">Portal Orientador</p>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-sm font-medium text-slate-600">
            <Link to="/docente/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </Link>
            <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#2C5F57] text-white font-semibold">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                Bandeja de Reportes
              </span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1 text-sm font-medium text-slate-600">
          <Link to="/docente/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Área Central de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-300 rounded-full overflow-hidden flex justify-center items-center font-bold text-xs text-slate-700">
              OR
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-800">Orientador(a)</p>
              <p className="text-[10px] text-slate-400">UPB</p>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#2C5F57]">Bandeja de Entrada de Reportes</h1>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            {/* Barra superior de la tabla (Buscador y Filtros) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h2 className="font-bold text-slate-800 text-base">Últimos Casos Recibidos</h2>
              
              <div className="flex items-center gap-3">
                <select name="nivel_riesgo_predicho" value={filtros.nivel_riesgo_predicho} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none">
                  <option value="">Todos los Riesgos</option>
                  <option value="CRITICO">Riesgo Crítico</option>
                  <option value="ALTO">Riesgo Alto</option>
                  <option value="MEDIO">Riesgo Medio</option>
                  <option value="BAJO">Riesgo Bajo</option>
                </select>

                <select name="estado" value={filtros.estado} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none">
                  <option value="">Todos los Estados</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="EN_SEGUIMIENTO">En Seguimiento</option>
                  <option value="CERRADO">Cerrado</option>
                </select>
              </div>
            </div>

            {/* Tabla de Registros */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Código / Ticket</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Riesgo IA</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">Cargando reportes...</td>
                    </tr>
                  ) : reportes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No hay reportes que coincidan con los filtros.</td>
                    </tr>
                  ) : (
                    reportes.map((item) => (
                      <tr key={item.codigo_seguimiento} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{item.codigo_seguimiento.split('-')[0]}...</td>
                        <td className="py-3 px-4">{new Date(item.fecha_creacion).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getColorRiesgo(item.nivel_riesgo_predicho)}`}>
                            {item.nivel_riesgo_predicho}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-600 border border-slate-200">
                            {item.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize">{item.ubicacion.toLowerCase()}</td>
                        <td className="py-3 px-4 text-center">
                          <button className="text-[#1B5E9E] hover:text-blue-800 text-xs font-bold underline">
                            Ver Detalle
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
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                <p>Mostrando página {filtros.page} de {totalPages}</p>
                <div className="flex gap-1">
                  <button 
                    disabled={filtros.page === 1}
                    onClick={() => setFiltros(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={filtros.page === totalPages}
                    onClick={() => setFiltros(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}