import { Link } from "react-router-dom";

export default function BandejaReportesDocente() {
  const reportes = [
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
    { id: "01", name: "Sophia Wilson", roll: "522bcs009", classNum: "12 - A", accom: "Hosteller", transport: "No", location: "Singanallur", contact: "82486 69086", rank: "001" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 bg-[#1B5E9E] rounded-full flex items-center justify-center text-white font-bold text-xs">
              SV
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">SafeVoice</h2>
              <p className="text-[11px] text-slate-400">Portal Admin</p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-4 space-y-1 text-sm font-medium text-slate-600">
            <Link to="/docente/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </Link>
            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Teacher
            </a>
            <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-600 text-white font-semibold">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                Student
              </span>
            </button>
            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Departments
            </a>
            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Notice
            </a>
            <a href="#" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Attendance
            </a>
          </nav>
        </div>

        {/* Links Inferiores */}
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

      {/* Área Central de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search"
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

        {/* Vista de la Bandeja */}
        <main className="p-8 space-y-6 overflow-y-auto">
          {/* Header de la sección */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Students</h1>
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
              Add New <span className="text-base font-normal">+</span>
            </button>
          </div>

          {/* Tarjeta con Tabla de Datos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
            {/* Barra superior de la tabla (Buscador y Filtros) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h2 className="font-bold text-slate-800 text-base">All Students List</h2>
              
              <div className="flex items-center gap-3">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name or roll."
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none">
                  <option>All Classes</option>
                </select>
              </div>
            </div>

            {/* Tabla de Registros */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Roll num</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Accom_Type</th>
                    <th className="py-3 px-4">Transport</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {reportes.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{item.id}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] text-slate-600 font-bold">
                          👤
                        </div>
                        <span className="font-medium text-slate-800">{item.name}</span>
                      </td>
                      <td className="py-3 px-4">{item.roll}</td>
                      <td className="py-3 px-4">{item.classNum}</td>
                      <td className="py-3 px-4">{item.accom}</td>
                      <td className="py-3 px-4">{item.transport}</td>
                      <td className="py-3 px-4">{item.location}</td>
                      <td className="py-3 px-4">{item.contact}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.rank}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          <button className="hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button className="hover:text-rose-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Previous
              </button>
              <span>Page 1 of 12</span>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}