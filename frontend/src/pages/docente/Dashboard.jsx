import { Link } from "react-router-dom";

export default function DashboardDocente() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar / Navegación Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo / Encabezado */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 bg-[#1B5E9E] rounded-full flex items-center justify-center text-white font-bold text-xs">
              SV
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">SafeVoice</h2>
              <p className="text-[11px] text-slate-400">Portal Admin</p>
            </div>
          </div>

          {/* Menú Principal */}
          <nav className="p-4 space-y-1 text-sm font-medium text-slate-600">
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-600 text-white font-semibold">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Dashboard
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="pl-8 space-y-1 text-xs text-slate-500 pt-1">
                <p className="font-semibold text-slate-800 py-1">Panel Administrador</p>
                <p className="hover:text-slate-800 py-1 cursor-pointer">Panel Docente</p>
                <p className="hover:text-slate-800 py-1 cursor-pointer">Panel Estudiante</p>
              </div>
            </div>

            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Docente
            </a>
            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
              Estudiante
            </a>
            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Departamentos
            </a>
          </nav>
        </div>

        {/* Sección Configuración y Logout */}
        <div className="p-4 border-t border-slate-100 space-y-1 text-sm font-medium text-slate-600">
          <Link to="/docente/menu" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
            Menú Docente
          </Link>
          <Link to="/docente/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar Superior */}
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar"
                className="w-full bg-slate-100 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-300 rounded-full overflow-hidden flex justify-center items-center font-bold text-xs text-slate-700">
              JS
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-800">John Smith</p>
              <p className="text-[10px] text-slate-400">Admin</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 space-y-6 overflow-y-auto">
          <h1 className="text-xl font-bold text-slate-800">¡Bienvenido, Administrador!</h1>

          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Estudiantes</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">50055</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-lg">🎓</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Egresados</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">5k+</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-lg">🥇</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Departamentos</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">30+</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-lg">🏢</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Docentes</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">20+</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-lg">👨‍🏫</div>
            </div>
          </div>

          {/* Gráfico y Gráfico Circular */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico Rendimiento */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 text-base">Rendimiento Estudiantil</h2>
                <div className="flex gap-2">
                  <span className="text-xs border rounded-lg px-2.5 py-1 text-slate-600 cursor-pointer">📅 Mensual</span>
                  <span className="text-xs border rounded-lg px-2.5 py-1 text-slate-600 cursor-pointer">🏫 Grado 6</span>
                </div>
              </div>

              {/* Simulación visual del gráfico de barras */}
              <div className="h-48 border-b border-l border-slate-200 flex items-end justify-between px-4 pt-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="flex gap-1 items-end h-full">
                    <div className="w-2.5 bg-blue-400 rounded-t-xs" style={{ height: `${30 + (i * 7) % 60}%` }} />
                    <div className="w-2.5 bg-emerald-400 rounded-t-xs" style={{ height: `${20 + (i * 9) % 55}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 px-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
              </div>
            </div>

            {/* Distribución Estudiantes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
              <h2 className="font-bold text-slate-800 text-base">Estudiantes</h2>
              <div className="flex justify-center items-center my-4">
                <div className="w-36 h-36 rounded-full border-8 border-blue-500 border-t-emerald-500 flex items-center justify-center font-bold text-xs text-slate-600">
                  👥 100%
                </div>
              </div>
              <div className="flex justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Niños (47%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Niñas (53%)</span>
              </div>
            </div>
          </div>

          {/* Tabla e Historia Reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tabla Estudiantes Destacados */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 text-base">Estudiantes Destacados</h2>
                <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">Ver Todo</a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Nombre</th>
                      <th className="pb-3 font-semibold">Calificación</th>
                      <th className="pb-3 font-semibold">Porcentaje</th>
                      <th className="pb-3 font-semibold">Año</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { id: "PRE1225", name: "John Smith", marks: "1185", pct: "98%", year: "2024" },
                      { id: "PRE1225", name: "John Smith", marks: "1195", pct: "99%", year: "2023" },
                      { id: "PRE1225", name: "John Smith", marks: "1187", pct: "99.6%", year: "2022" },
                      { id: "PRE1225", name: "John Smith", marks: "1187", pct: "99.6%", year: "2022" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 font-medium">{row.id}</td>
                        <td className="py-3">{row.name}</td>
                        <td className="py-3">{row.marks}</td>
                        <td className="py-3 font-semibold text-emerald-600">{row.pct}</td>
                        <td className="py-3 text-slate-400">{row.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 text-base">Actividad Reciente</h2>
                <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">Ver Todas</a>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">👤</div>
                    <div>
                      <p className="text-slate-700">
                        <strong className="text-slate-900">David Lee</strong> asignó una nueva tarea
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Hace 20 minutos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}