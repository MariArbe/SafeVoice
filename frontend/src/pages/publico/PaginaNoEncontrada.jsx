import { Link, useNavigate } from "react-router-dom";
import NavbarPublico from "../../components/ui/NavbarPublico";

export default function PaginaNoEncontrada() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      <NavbarPublico />

      {/* Tarjeta de Error 404 */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-slate-200/80 w-full space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-[#1B5E9E] rounded-3xl flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Página no encontrada
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              La dirección web a la que intentas acceder no existe, fue movida o cambió de nombre.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/"
              className="flex-1 bg-[#1B5E9E] hover:bg-[#154a7d] active:scale-[0.98] text-white text-sm font-bold py-3.5 px-5 rounded-xl transition-all shadow-md text-center cursor-pointer"
            >
              Volver al Inicio
            </Link>
            <Link
              to="/reporte"
              className="flex-1 bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.98] text-white text-sm font-bold py-3.5 px-5 rounded-xl transition-all shadow-md text-center cursor-pointer"
            >
              Crear Reporte Anónimo
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
            ¿Tienes un código de seguimiento?{" "}
            <Link to="/consultar" className="text-[#1B5E9E] font-bold hover:underline">
              Consultar estado de tu caso aquí
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#2C5F57] font-medium border-t border-slate-200/80 gap-2">
        <span>SafeVoice &bull; Plataforma Anónima de Convivencia Escolar</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
