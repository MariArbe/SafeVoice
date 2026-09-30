import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import recursoService from "../../services/recursoService";

export default function ContactosRecursos() {
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecursos = async () => {
      try {
        const data = await recursoService.listarRecursosPublicos();
        setRecursos(data);
      } catch (error) {
        console.error("Error al cargar los recursos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecursos();
  }, []);

  const getCategoryBadge = (categoria) => {
    switch(categoria) {
      case 'LINEA_DE_AYUDA': 
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Línea Directa</span>;
      case 'ORIENTACION': 
        return <span className="bg-emerald-50 text-[#2C5F57] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Orientación School</span>;
      case 'PROFESOR': 
        return <span className="bg-[#DCEAF7] text-[#1B5E9E] border border-[#1B5E9E]/20 text-[10px] font-bold px-2 py-0.5 rounded-md">Docente Enlace</span>;
      default: 
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Recurso</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 shadow-2xs sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#DCEAF7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-[#1B5E9E] tracking-tight">SafeVoice</span>
        </Link>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-bold text-[#2C5F57] hover:text-[#1B5E9E] bg-slate-100/80 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          title="Volver al inicio"
        >
          <span>Inicio</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col items-center">
        {/* Navegación Superior */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/informacion")}
            className="flex items-center gap-2 text-xs font-bold text-[#2C5F57] hover:text-[#154a7d] bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver a Sección Informativa</span>
          </button>
        </div>

        {/* Encabezado */}
        <div className="text-center max-w-2xl mb-8 space-y-2">
          <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-xs border border-[#1B5E9E]/20 text-[#1B5E9E] text-xs font-bold rounded-full uppercase tracking-wider">
            Red de Apoyo Institucional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E9E] leading-snug">
            Contactos de Orientación y Apoyo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            No estás solo/a. Elige la persona o canal con el que te sientas más cómodo/a para conversar.
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 w-full max-w-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#2C5F57]">Directorio Escolar y Profesional</h2>
            <p className="text-xs text-slate-500">Contactos autorizados para brindar escucha confidencial.</p>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="w-8 h-8 border-3 border-[#1B5E9E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-medium">Cargando directorio de apoyo...</p>
              </div>
            ) : recursos.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                <p className="text-sm font-semibold text-slate-700 mb-1">No hay contactos registrados aún</p>
                <p className="text-xs text-slate-500">Por favor acércate a la oficina de Orientación Escolar de tu institución.</p>
              </div>
            ) : (
              recursos.map((recurso) => (
                <div
                  key={recurso.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-[#1B5E9E]/40 hover:bg-slate-50/60 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm">{recurso.titulo}</h3>
                        {getCategoryBadge(recurso.categoria)}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{recurso.descripcion}</p>
                    </div>
                  </div>

                  {/* Datos de contacto interactivos */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {recurso.telefono && (
                      <a
                        href={`tel:${recurso.telefono}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#2C5F57] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{recurso.telefono}</span>
                      </a>
                    )}

                    {recurso.correo && (
                      <a
                        href={`mailto:${recurso.correo}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DCEAF7]/60 hover:bg-[#DCEAF7] text-[#1B5E9E] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{recurso.correo}</span>
                      </a>
                    )}

                    {recurso.url && (
                      <a
                        href={recurso.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Visitar sitio web</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 px-8 py-3 flex justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80">
        <span>SafeVoice &bull; Apoyo al Estudiante</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}