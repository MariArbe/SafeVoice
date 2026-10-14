import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardDocente() {
  const navigate = useNavigate();
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);

  // Zonas del colegio con coordenadas vectoriales y niveles sin luces traseras
  const zonasColegio = [
    {
      id: "canchas",
      nombre: "Canchas & Patios",
      categoria: "Zona Deportiva / Recreo",
      nivel: "CRITICO",
      reportes: 14,
      icono: "⚽",
      recomendacion: "Asignar 2 docentes de guardia fijos durante los recesos de 10:00 AM y 12:30 PM.",
      posicionSVG: { x: 25, y: 30, width: 230, height: 140 },
      colorBadge: "bg-rose-500 text-white",
      strokeColor: "#f43f5e",
      fillBg: "#1e1b2e"
    },
    {
      id: "banos_secundaria",
      nombre: "Baños Secundaria",
      categoria: "Servicios Sanitarios",
      nivel: "ALTO",
      reportes: 9,
      icono: "🚻", // <- Corregido de "Rojo" a emoji
      recomendacion: "Rondas periódicas de inspección por parte del equipo de convivencia.",
      posicionSVG: { x: 280, y: 30, width: 140, height: 95 },
      colorBadge: "bg-orange-500 text-white",
      strokeColor: "#f97316",
      fillBg: "#2a1e17"
    },
    {
      id: "cafeteria",
      nombre: "Cafetería & Comedor",
      categoria: "Servicios Generales",
      nivel: "MEDIO",
      reportes: 5,
      icono: "🍕",
      recomendacion: "Supervisar orden en las filas de entrega de alimentos.",
      posicionSVG: { x: 440, y: 30, width: 135, height: 110 },
      colorBadge: "bg-amber-400 text-slate-900",
      strokeColor: "#fbbf24",
      fillBg: "#292318"
    },
    {
      id: "bloque_a",
      nombre: "Bloque A (Aulas 6° a 9°)",
      categoria: "Aulas Académicas",
      nivel: "MEDIO",
      reportes: 7,
      icono: "🏫",
      recomendacion: "Mantener puertas abiertas durante los cambios de clase.",
      posicionSVG: { x: 25, y: 195, width: 190, height: 135 },
      colorBadge: "bg-amber-400 text-slate-900",
      strokeColor: "#fbbf24",
      fillBg: "#292318"
    },
    {
      id: "pasillo_central",
      nombre: "Pasillo Principal",
      categoria: "Conector Principal",
      nivel: "ALTO",
      reportes: 10,
      icono: "🏃",
      recomendacion: "Presencia preventiva de profesores al cierre de la jornada escolar.",
      posicionSVG: { x: 240, y: 150, width: 180, height: 180 },
      colorBadge: "bg-orange-500 text-white",
      strokeColor: "#f97316",
      fillBg: "#2a1e17"
    },
    {
      id: "biblioteca",
      nombre: "Biblioteca & Labs",
      categoria: "Recursos Educativos",
      nivel: "BAJO",
      reportes: 1,
      icono: "📚",
      recomendacion: "Zona tranquila y segura. Mantener protocolo estándar.",
      posicionSVG: { x: 440, y: 165, width: 135, height: 165 },
      colorBadge: "bg-emerald-500 text-white",
      strokeColor: "#10b981",
      fillBg: "#132a24"
    },
  ];

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
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#1B5E9E] text-white shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Dashboard & Mapa</span>
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
            <h1 className="text-sm font-extrabold text-[#1B5E9E]">Métricas de Convivencia Escolar & Mapa Interactivo</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCEAF7] flex items-center justify-center font-bold text-xs text-[#1B5E9E]">
              CD
            </div>
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-slate-800">Comité de Convivencia</p>
              <p className="text-[10px] text-[#2C5F57] font-semibold">Sede Principal</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-8 space-y-6 overflow-y-auto">
          
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#1B5E9E]">Resumen Estadístico</h1>
              <p className="text-xs text-slate-500 mt-0.5">Supervisión física y digital de focos de acoso escolar.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                📅 Periodo Lectivo 2026-2
              </span>
            </div>
          </div>

          {/* Tarjetas de Métricas Clave SafeVoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reportes</p>
                <p className="text-2xl font-black text-slate-800 mt-1">41</p>
                <span className="text-[11px] text-emerald-600 font-bold">+5 esta semana</span>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-[#1B5E9E] rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                📋
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zona Más Crítica</p>
                <p className="text-lg font-black text-rose-600 mt-1">Canchas & Patios</p>
                <span className="text-[11px] text-rose-600 font-bold">14 casos registrados</span>
              </div>
              <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                🚨
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Revisión</p>
                <p className="text-2xl font-black text-amber-600 mt-1">10</p>
                <span className="text-[11px] text-amber-600 font-bold">Requieren atención</span>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                ⏳
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Casos Resueltos</p>
                <p className="text-2xl font-black text-[#2C5F57] mt-1">31</p>
                <span className="text-[11px] text-[#2C5F57] font-bold">75.6% efectividad</span>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-[#2C5F57] rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                ✅
              </div>
            </div>
          </div>

          {/* PLANO ARQUITECTÓNICO LIMPIO Y NÍTIDO (SIN LUCES O RESPLANDORES) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E9E]" />
                  <h2 className="font-extrabold text-slate-800 text-lg">Plano Arquitectónico Institucional</h2>
                </div>
                <p className="text-xs text-slate-500">Haz clic sobre cualquier bloque del colegio para consultar su nivel de prioridad.</p>
              </div>

              {/* Leyenda de Niveles */}
              <div className="flex items-center gap-3 text-xs font-bold bg-slate-100/80 px-3.5 py-2 rounded-2xl border border-slate-200/70">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bajo</span>
                <span className="flex items-center gap-1.5 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Medio</span>
                <span className="flex items-center gap-1.5 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Alto</span>
                <span className="flex items-center gap-1.5 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Crítico</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 items-start">
              
              {/* PLANO SVG NEUTRAL Y VISTOSO */}
              <div className="lg:col-span-8 relative bg-slate-900 rounded-3xl border-2 border-slate-800 p-3 shadow-xl overflow-hidden min-h-[400px] flex items-center justify-center">
                
                <svg viewBox="0 0 600 360" className="w-full h-auto max-h-[400px] select-none">
                  <defs>
                    <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.4" />
                    </pattern>
                  </defs>

                  {/* Terreno Base del Campus */}
                  <rect x="10" y="10" width="580" height="340" rx="22" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
                  <rect x="10" y="10" width="580" height="340" rx="22" fill="url(#grid-pattern)" />

                  {/* Zonas Verdes / Jardines */}
                  <rect x="25" y="25" width="550" height="310" rx="18" fill="#14532d" fillOpacity="0.15" stroke="#15803d" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Senderos del Campus */}
                  <path d="M 125,10 L 125,350 M 235,10 L 235,350 M 425,10 L 425,350 M 10,180 L 590,180" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                  <path d="M 125,10 L 125,350 M 235,10 L 235,350 M 425,10 L 425,350 M 10,180 L 590,180" stroke="#334155" strokeWidth="1.5" strokeDasharray="6,6" />

                  {/* Árboles Vectoriales */}
                  <circle cx="235" cy="115" r="8" fill="#166534" opacity="0.8" />
                  <circle cx="235" cy="250" r="10" fill="#166534" opacity="0.8" />
                  <circle cx="425" cy="140" r="9" fill="#166534" opacity="0.8" />

                  {/* BLOQUES ARQUITECTÓNICOS LIMPIOS */}
                  {zonasColegio.map((zona) => {
                    const isSelected = zonaSeleccionada?.id === zona.id;
                    const { x, y, width, height } = zona.posicionSVG;
                    const centerX = x + width / 2;
                    const centerY = y + height / 2;

                    return (
                      <g
                        key={zona.id}
                        onClick={() => setZonaSeleccionada(zona)}
                        className="cursor-pointer group"
                      >
                        {/* Rectángulo Limpio del Edificio */}
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          rx="14"
                          fill={isSelected ? "#0284c7" : zona.fillBg}
                          stroke={isSelected ? "#38bdf8" : zona.strokeColor}
                          strokeWidth={isSelected ? "3" : "2"}
                          className="transition-all duration-200 group-hover:stroke-sky-400"
                        />

                        {/* Demarcación limpia de las canchas */}
                        {zona.id === "canchas" && (
                          <g opacity="0.5">
                            <rect x={x + 12} y={y + 12} width={width - 24} height={height - 24} rx="8" fill="none" stroke="#34d399" strokeWidth="1.5" />
                            <line x1={centerX} y1={y + 12} x2={centerX} y2={y + height - 12} stroke="#34d399" strokeWidth="1.5" />
                            <circle cx={centerX} cy={centerY} r="20" fill="none" stroke="#34d399" strokeWidth="1.5" />
                          </g>
                        )}

                        {/* Icono del Bloque */}
                        <text
                          x={centerX}
                          y={centerY - 8}
                          textAnchor="middle"
                          fontSize="20"
                          className="pointer-events-none"
                        >
                          {zona.icono}
                        </text>

                        {/* Nombre de la Zona */}
                        <text
                          x={centerX}
                          y={centerY + 15}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="10"
                          fontWeight="800"
                          className="pointer-events-none tracking-wide"
                        >
                          {zona.nombre}
                        </text>

                        {/* Badge Sutil de Conteo de Reportes */}
                        <g transform={`translate(${x + width - 26}, ${y - 6})`}>
                          <rect
                            width="26"
                            height="20"
                            rx="8"
                            fill={zona.nivel === 'CRITICO' ? '#f43f5e' : zona.nivel === 'ALTO' ? '#ea580c' : zona.nivel === 'MEDIO' ? '#eab308' : '#10b981'}
                          />
                          <text x="13" y="14" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
                            {zona.reportes}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  PLANO ARQUITECTÓNICO &bull; COLEGIO SAFEVOICE
                </div>
              </div>

              {/* PANEL DE DETALLES DE LA ZONA SELECCIONADA */}
              <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/80 flex flex-col justify-between h-full min-h-[400px]">
                {zonaSeleccionada ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{zonaSeleccionada.categoria}</span>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <span>{zonaSeleccionada.icono}</span>
                          <span>{zonaSeleccionada.nombre}</span>
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${zonaSeleccionada.colorBadge}`}>
                        {zonaSeleccionada.nivel}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                        <span className="text-slate-500 font-bold">Casos concentrados:</span>
                        <span className="text-base font-black text-[#1B5E9E]">{zonaSeleccionada.reportes} reportes</span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-slate-500 font-bold">Plan de Acompañamiento Sugerido:</span>
                        <p className="p-3.5 bg-white rounded-2xl border border-slate-200/80 text-slate-700 leading-relaxed font-medium shadow-2xs">
                          {zonaSeleccionada.recomendacion}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to="/docente/reportes"
                        className="w-full bg-[#1B5E9E] hover:bg-blue-800 text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <span>Ver reportes de esta zona</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center space-y-3 py-10">
                    <div className="w-14 h-14 bg-slate-200/80 text-slate-700 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                      📍
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Plano Arquitectónico</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                        Haz clic en cualquier bloque para inspeccionar sus estadísticas de incidentes y recomendaciones de prevención.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Gráficos Reales del Proyecto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico 1: Reportes por Lugar Ocurrido */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base">Distribución por Frecuencia</h2>
                  <p className="text-xs text-slate-400">Porcentaje de casos recibidos según la ubicación</p>
                </div>
                <span className="text-xs font-bold text-[#1B5E9E] bg-[#DCEAF7] px-3 py-1 rounded-xl">
                  Estadística
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                {[
                  { lugar: "Canchas & Patios", pct: 35, count: "14 casos", color: "bg-rose-500" },
                  { lugar: "Pasillo Principal", pct: 25, count: "10 casos", color: "bg-orange-500" },
                  { lugar: "Baños Secundaria", pct: 22, count: "9 casos", color: "bg-amber-500" },
                  { lugar: "Bloque A (Aulas 6° a 9°)", pct: 15, count: "7 casos", color: "bg-[#1B5E9E]" },
                  { lugar: "Biblioteca & Labs", pct: 3, count: "1 caso", color: "bg-emerald-500" },
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