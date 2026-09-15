import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo de SafeVoice */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-slate-800 tracking-tight">
            Safe<span className="text-emerald-600">Voice</span>
          </span>
        </Link>

        {/* Navegación Principal */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Inicio
          </Link>
          <Link to="/informacion" className="hover:text-emerald-600 transition-colors">
            Información
          </Link>
          <Link to="/lineas-ayuda" className="hover:text-emerald-600 transition-colors">
            Líneas de Ayuda
          </Link>
          <Link to="/reporte" className="hover:text-emerald-600 transition-colors">
            Reportar
          </Link>
          <Link
            to="/docente/login"
            className="ml-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Docentes
          </Link>
        </nav>
      </div>
    </header>
  );
}