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

  const getIconForCategory = (categoria) => {
    switch(categoria) {
      case 'LINEA_DE_AYUDA': return '📞';
      case 'ORIENTACION': return '🫂';
      case 'PROFESOR': return '🏫';
      default: return '💡';
    }
  };

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <Link to="/" className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-xl font-bold text-[#2C5F57]">SafeVoice</span>
        </Link>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-6 py-6 w-full flex-1 flex flex-col items-center">
        {/* Navegación */}
        <div className="w-full flex items-center justify-between mb-4">
          <button onClick={() => navigate("/informacion")} className="text-[#2C5F57] hover:text-[#1F433D] p-1 transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => navigate("/")} className="text-[#2C5F57] hover:text-[#1F433D] p-1 transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-700 text-center max-w-2xl mb-8 leading-snug">
          Si estás pasando por una situación difícil o necesitas hablar con alguien, aquí puedes encontrar personas que pueden escucharte y ayudarte.
        </h1>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-full max-w-2xl space-y-6">
          <div>
            <h2 className="text-[#2C5F57] font-bold text-lg mb-1">Contactos y Líneas de Ayuda</h2>
            <p className="text-xs text-slate-500 max-w-md">
              ¿No sabes con quién hablar? No tienes que resolverlo solo/a. Elige un contacto con quien te sientas cómodo/a y cuéntale lo que está pasando.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {loading ? (
              <div className="text-center text-sm text-slate-500 py-4">Cargando recursos de ayuda...</div>
            ) : recursos.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-4">
                No hay contactos registrados en este momento. Por favor, acércate a la oficina de orientación de tu colegio.
              </div>
            ) : (
              recursos.map((recurso) => (
                <div key={recurso.id} className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm italic">{recurso.titulo}</p>
                    <p className="text-xs text-slate-700 font-medium">{recurso.descripcion}</p>
                    
                    {/* Información de contacto renderizada condicionalmente */}
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                      {recurso.telefono && <span>📞 {recurso.telefono}</span>}
                      {recurso.correo && <span>✉️ {recurso.correo}</span>}
                      {recurso.url && (
                        <a href={recurso.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          🌐 Visitar sitio
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="p-3 bg-[#2C5F57] text-white rounded-xl shadow-sm shrink-0 text-xl">
                    {getIconForCategory(recurso.categoria)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}