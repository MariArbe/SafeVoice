export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div>
          <p className="font-semibold text-slate-200">SafeVoice</p>
          <p className="text-xs text-slate-500">Plataforma confidencial y segura de reporte canalizado.</p>
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SafeVoice. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}