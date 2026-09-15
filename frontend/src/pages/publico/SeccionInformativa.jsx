import { Link, useNavigate } from "react-router-dom";

export default function SeccionInformativa() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEAF7] flex flex-col justify-between font-sans text-slate-800">
      {/* Header superior */}
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100 shadow-2xs">
        <Link to="/" className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1B5E9E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-xl font-bold text-[#2C5F57]">SafeVoice</span>
        </Link>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-6 w-full flex-1 flex flex-col items-center">
        {/* Encabezado con título e icono de salir */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex-1" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700 text-center flex-1">
            Seccion informativa
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => navigate("/")}
              className="text-[#2C5F57] hover:text-[#1F433D] transition-colors p-1"
              title="Volver al inicio"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tarjeta Informativa Blanca */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-full flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base leading-relaxed">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <div>
                <h2 className="text-[#2C5F57] font-bold text-lg mb-2">
                  ¿Qué es el bullying?
                </h2>
                <p className="text-slate-700 italic">
                  El bullying es una forma de violencia que ocurre cuando una persona es molestada, intimidada, excluida o agredida de manera intencional y repetida.
                </p>
              </div>

              <div>
                <h2 className="text-[#2C5F57] font-bold text-lg mb-2">
                  Tipos de bullying
                </h2>
                <ul className="space-y-2 text-slate-700 italic">
                  <li>
                    <strong className="not-italic text-slate-800 block">Bullying físico</strong>
                    Golpes, empujones, patadas, daños o robos de pertenencias.
                  </li>
                  <li>
                    <strong className="not-italic text-slate-800 block">Bullying verbal</strong>
                    Insultos, burlas, amenazas, apodos ofensivos o comentarios hirientes.
                  </li>
                  <li>
                    <strong className="not-italic text-slate-800 block">Bullying social</strong>
                    Excluir intencionalmente a alguien, difundir rumores o hacer que otros se alejen de esa persona.
                  </li>
                  <li>
                    <strong className="not-italic text-slate-800 block">Ciberbullying</strong>
                    Acoso que ocurre mediante redes sociales, chats, videojuegos u otras plataformas digitales.
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <div>
                <h2 className="text-[#2C5F57] font-bold text-lg mb-2">
                  ¿Cómo reconocerlo?
                </h2>
                <ul className="list-disc list-inside space-y-1 text-slate-700 italic">
                  <li>Evitar ir al colegio o determinadas actividades.</li>
                  <li>Cambios repentinos de ánimo.</li>
                  <li>Aislarse de amigos o compañeros.</li>
                  <li>Sentirse constantemente triste, nervioso o inseguro.</li>
                  <li>Tener miedo de revisar mensajes o redes sociales.</li>
                  <li>Presentar cambios en el rendimiento académico.</li>
                  <li>Perder o dañar frecuentemente sus pertenencias.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[#2C5F57] font-bold text-lg mb-2">
                  ¿Qué hacer si estás viviendo bullying?
                </h2>
                <ul className="list-disc list-inside space-y-1 text-slate-700 italic">
                  <li>Habla con alguien de confianza. Puede ser un familiar, profesor, orientador o amigo.</li>
                  <li>Guarda evidencias si ocurre en internet, como capturas de pantalla o mensajes.</li>
                  <li>No respondas con violencia.</li>
                  <li>Reporta la situación para que pueda ser atendida.</li>
                  <li>Busca apoyo si la situación está afectando tu bienestar.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón de Acción Inferior */}
          <div className="mt-8 pt-4">
            <button
              onClick={() => navigate("/lineas-ayuda")}
              className="bg-[#2C5F57] hover:bg-[#234c45] text-white font-semibold text-sm px-8 py-3 rounded-2xl transition-colors shadow-xs"
            >
              Continuar
            </button>
          </div>
        </div>
      </main>

      {/* Footer inferior */}
      <footer className="bg-white px-8 py-3 flex justify-end text-xs text-[#2C5F57] font-medium border-t border-slate-100">
        &copy; 2025
      </footer>
    </div>
  );
}