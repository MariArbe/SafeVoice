import { Link, useNavigate } from "react-router-dom";

export default function DashboardDocente() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7]/40 flex font-sans text-slate-800">
      
      {/* Sidebar / Navegación Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 hidden md:flex z-10 shadow-xs">
        <div>
          {/* Logo / Encabezado */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-[#DCEAF7] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold text-[#1B5E9E] text-base leading-tight">SafeVoice</h2>
              <p className="text-[11px] text-[#2C5F57] font-semibold">Panel de Convivencia</p>
            </div>
          </div>

          {/* Menú Principal */}
          <nav className="p-4 space-y-1 text-xs font-bold text-slate-600">
            <Link
              to="/docente/dashboard"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#1B5E9E] text-white shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Dashboard de Datos</span>
            </Link>

            <Link
              to="/docente/reportes"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#2C5F57] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>Bandeja de Reportes</span>
            </Link>

            <Link
              to="/informacion"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#1B5E9E] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Protocolos e Info</span>
            </Link>
          </nav>
        </div>

        {/* Sección Opciones Inferiores */}
        <div className="p-4 border-t border-slate-100 space-y-1 text-xs font-bold text-slate-600">
          <Link
            to="/docente/menu"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4 text-[#2C5F57]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            <span>Menú Docente</span>
          </Link>

          <button
            onClick={() => navigate("/docente/login")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-700 transition-colors text-left cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Superior */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-extrabold text-[#1B5E9E]">Métricas de Convivencia Escolar</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCEAF7] flex items-center justify-center font-bold text-xs text-[#1B5E9E]">
              CD
            </div>
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-slate-800">Comité de Convivencia</p>
              <p className="text-[10px] text-[#2C5F57] font-semibold">Institución Educativa</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-8 space-y-6 overflow-y-auto">
          
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#1B5E9E]">Resumen Estadístico</h1>
              <p className="text-xs text-slate-500 mt-0.5">Monitoreo de situaciones de acoso escolar en tiempo real.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                📅 Periodo 2026-2
              </span>
            </div>
          </div>

          {/* Tarjetas de Métricas Clave SafeVoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Reportes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reportes</p>
                <p className="text-2xl font-black text-slate-800 mt-1">24</p>
                <span className="text-[11px] text-emerald-600 font-bold">+3 este mes</span>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-[#1B5E9E] rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                📋
              </div>
            </div>

            {/* En Investigación */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Revisión</p>
                <p className="text-2xl font-black text-amber-600 mt-1">8</p>
                <span className="text-[11px] text-amber-600 font-bold">Requieren atención</span>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                ⏳
              </div>
            </div>

            {/* Casos Resueltos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Casos Resueltos</p>
                <p className="text-2xl font-black text-[#2C5F57] mt-1">16</p>
                <span className="text-[11px] text-[#2C5F57] font-bold">66.6% efectividad</span>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-[#2C5F57] rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                ✅
              </div>
            </div>

            {/* Ciberacoso / Agresiones */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ciberacoso</p>
                <p className="text-2xl font-black text-rose-600 mt-1">35%</p>
                <span className="text-[11px] text-rose-600 font-bold">Predomina en 9° y 10°</span>
              </div>
              <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                🌐
              </div>
            </div>

          </div>

          {/* Gráficos Reales del Proyecto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico 1: Reportes por Lugar Ocurrido */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base">Lugares Frecuentes de Conflictos</h2>
                  <p className="text-xs text-slate-400">Distribución de casos reportados según la ubicación</p>
                </div>
                <span className="text-xs font-bold text-[#1B5E9E] bg-[#DCEAF7] px-3 py-1 rounded-xl">
                  Análisis Frecuencia
                </span>
              </div>

              {/* Barras de distribución por lugares */}
              <div className="space-y-3.5 pt-2">
                {[
                  { lugar: "Salón de clases", pct: 40, count: "10 casos", color: "bg-[#1B5E9E]" },
                  { lugar: "Descanso / Zonas deportivas", pct: 25, count: "6 casos", color: "bg-[#2C5F57]" },
                  { lugar: "Internet / Redes sociales (Ciberacoso)", pct: 20, count: "5 casos", color: "bg-rose-500" },
                  { lugar: "Pasillos o escaleras", pct: 10, count: "2 casos", color: "bg-amber-500" },
                  { lugar: "Salida del colegio", pct: 5, count: "1 caso", color: "bg-indigo-400" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.lugar}</span>
                      <span className="text-slate-500">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico 2: Tipos de Agresión más comunes */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-slate-800 text-base">Tipos de Agresión</h2>
                <p className="text-xs text-slate-400">Categorías de afectación recibidas</p>
              </div>

              <div className="flex justify-center items-center my-2">
                <div className="w-36 h-36 rounded-full border-8 border-[#1B5E9E] border-t-[#2C5F57] border-r-rose-500 flex items-center justify-center text-center p-3">
                  <div>
                    <span className="text-lg font-black text-slate-800">Verbal</span>
                    <p className="text-[10px] text-slate-400 font-semibold">45% de casos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#1B5E9E] rounded-md" /> Insultos / Apodos</span>
                  <span className="font-bold text-slate-800">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#2C5F57] rounded-md" /> Exclusión / Chismes</span>
                  <span className="font-bold text-slate-800">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-500 rounded-md" /> Ciberacoso</span>
                  <span className="font-bold text-slate-800">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-md" /> Agresión Física</span>
                  <span className="font-bold text-slate-800">10%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Tabla de Últimos Reportes Recibidos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base">Últimos Reportes Anónimos</h2>
                <p className="text-xs text-slate-400">Casos más recientes ingresados por los estudiantes</p>
              </div>
              <Link to="/docente/reportes" className="text-xs text-[#1B5E9E] font-extrabold hover:underline">
                Ir a la Bandeja &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="pb-3 font-bold">Código Seguimiento</th>
                    <th className="pb-3 font-bold">Grado Afectado</th>
                    <th className="pb-3 font-bold">Ubicación</th>
                    <th className="pb-3 font-bold">Frecuencia</th>
                    <th className="pb-3 font-bold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-mono font-bold text-[#1B5E9E]">SV-2026-88A</td>
                    <td className="py-3.5">Grado 8°</td>
                    <td className="py-3.5">Salón de clases</td>
                    <td className="py-3.5">Varias semanas</td>
                    <td className="py-3.5 text-right">
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        En Revisión
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-mono font-bold text-[#1B5E9E]">SV-2026-42B</td>
                    <td className="py-3.5">Grado 10°</td>
                    <td className="py-3.5">Redes sociales</td>
                    <td className="py-3.5">Primera vez</td>
                    <td className="py-3.5 text-right">
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        Pendiente
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-mono font-bold text-[#1B5E9E]">SV-2026-19C</td>
                    <td className="py-3.5">Grado 6°</td>
                    <td className="py-3.5">Descanso</td>
                    <td className="py-3.5">Varios meses</td>
                    <td className="py-3.5 text-right">
                      <span className="bg-emerald-50 text-[#2C5F57] border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        Atendido
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}