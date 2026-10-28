import { useState, useEffect } from "react";

/**
 * Utilidad pura de cálculo de SLA y plazos legales conforme a la Ley 1620 de 2013
 * y su Decreto Reglamentario 1965 de 2013 (Colombia).
 */
export function calcularSlaLey1620(reporte) {
  if (!reporte || !reporte.fecha_creacion) {
    return {
      tipo: "TIPO_I",
      cerrado: false,
      vencido: false,
      textoCorto: "Sin fecha",
      textoLargo: "Sin fecha de radicación",
      claseBadge: "bg-slate-100 text-slate-500 border-slate-200",
      icono: "⏳",
      difMinutos: 0,
      difHoras: 0,
    };
  }

  const riesgo = (
    reporte.nivel_riesgo_confirmado ||
    reporte.nivel_riesgo_predicho ||
    "MEDIO"
  ).toUpperCase();

  let tipo = "TIPO_I";
  if (riesgo === "CRITICO") tipo = "TIPO_III";
  else if (riesgo === "ALTO") tipo = "TIPO_II";

  const estadoNorm = (reporte.estado || "").toLowerCase().trim();
  const cerrado = estadoNorm === "cerrado";

  const ahora = Date.now();
  const creacion = new Date(reporte.fecha_creacion).getTime();
  const difMinutos = Math.max(0, Math.floor((ahora - creacion) / (1000 * 60)));
  const difHoras = Math.max(0, Math.floor(difMinutos / 60));

  if (cerrado) {
    return {
      tipo,
      cerrado: true,
      vencido: false,
      difMinutos,
      difHoras,
      textoCorto: "✓ Protocolo cerrado",
      textoLargo: "Caso atendido y cerrado formalmente conforme a la Ley 1620",
      claseBadge: "bg-slate-100 text-slate-600 border-slate-300 font-semibold",
      icono: "✓",
    };
  }

  // TIPO III (Riesgo Crítico / Delitos / Riesgo Vital)
  // Límite de Notificación Inmediata: < 2 horas (120 minutos)
  // Límite de Reporte Oficial en SIUCE: < 48 horas
  if (tipo === "TIPO_III") {
    const limiteMins = 120;
    const horasSiuceRestantes = Math.max(0, 48 - difHoras);

    if (difMinutos < limiteMins) {
      const restantes = limiteMins - difMinutos;
      const h = Math.floor(restantes / 60);
      const m = restantes % 60;
      const tiempoTxt = h > 0 ? `${h}h ${m}m` : `${m} min`;

      return {
        tipo,
        cerrado: false,
        vencido: false,
        minutosRestantes: restantes,
        difMinutos,
        difHoras,
        horasSiuceRestantes,
        textoCorto: `⏱️ Quedan ${tiempoTxt} (< 2h)`,
        textoLargo: `⏱️ Quedan ${tiempoTxt} para notificación obligatoria a rectoría y acudientes (< 2h)`,
        claseBadge: "bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse shadow-2xs",
        icono: "⏱️",
        urgencia: "CRITICA",
      };
    } else {
      const excedidoMins = difMinutos - limiteMins;
      const h = Math.floor(excedidoMins / 60);
      const m = excedidoMins % 60;
      const excedidoTxt = h > 0 ? `${h}h ${m}m` : `${m} min`;

      return {
        tipo,
        cerrado: false,
        vencido: true,
        difMinutos,
        difHoras,
        horasSiuceRestantes,
        textoCorto: `⚠️ Plazo 2h superado (+${excedidoTxt})`,
        textoLargo: `⚠️ Plazo legal de 2h superado (Requiere justificar debida diligencia)`,
        claseBadge: "bg-red-100 text-red-900 border-red-400 font-extrabold shadow-xs",
        icono: "⚠️",
        urgencia: "VENCIDO",
      };
    }
  }

  // TIPO II (Riesgo Alto / Acoso Escolar / Daño a la Salud)
  // Límite de Citación Obligatoria a Acudientes: < 24 horas
  if (tipo === "TIPO_II") {
    const limiteHoras = 24;

    if (difHoras < limiteHoras) {
      const restantes = limiteHoras - difHoras;
      return {
        tipo,
        cerrado: false,
        vencido: false,
        horasRestantes: restantes,
        difMinutos,
        difHoras,
        textoCorto: `⏱️ Quedan ${restantes}h (< 24h)`,
        textoLargo: `⏱️ Quedan ${restantes} horas para citación formal de acudientes (< 24h)`,
        claseBadge: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
        icono: "⏱️",
        urgencia: "ALTA",
      };
    } else {
      const excedidoHoras = difHoras - limiteHoras;
      return {
        tipo,
        cerrado: false,
        vencido: true,
        difMinutos,
        difHoras,
        textoCorto: `⚠️ Plazo 24h superado (+${excedidoHoras}h)`,
        textoLargo: `⚠️ Plazo de 24h superado para citación formal de acudientes`,
        claseBadge: "bg-orange-100 text-orange-900 border-orange-400 font-bold",
        icono: "⚠️",
        urgencia: "VENCIDO",
      };
    }
  }

  // TIPO I (Riesgo Medio o Bajo / Conflictos Cotidianos)
  // Límite de Mediación y Acuerdos Pedagógicos: < 72 horas
  const limiteHoras = 72;
  if (difHoras < limiteHoras) {
    const restantes = limiteHoras - difHoras;
    return {
      tipo,
      cerrado: false,
      vencido: false,
      horasRestantes: restantes,
      difMinutos,
      difHoras,
      textoCorto: `⏱️ Quedan ${restantes}h (< 72h)`,
      textoLargo: `⏱️ Quedan ${restantes} horas para mediación pedagógica (< 72h)`,
      claseBadge: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold",
      icono: "⏱️",
      urgencia: "NORMAL",
    };
  } else {
    return {
      tipo,
      cerrado: false,
      vencido: true,
      difMinutos,
      difHoras,
      textoCorto: `⚠️ Plazo 72h superado`,
      textoLargo: `⚠️ Plazo de 72h superado para mediación pedagógica`,
      claseBadge: "bg-slate-100 text-slate-700 border-slate-300 font-medium",
      icono: "⚠️",
      urgencia: "VENCIDO",
    };
  }
}

/**
 * Componente Badge para la tabla de la bandeja docente.
 * Se actualiza cada 30 segundos automáticamente para reflejar el tiempo real.
 */
export default function BadgeSlaLey1620({ reporte, modo = "compacto", className = "" }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000); // 30 segundos
    return () => clearInterval(intervalo);
  }, []);

  const sla = calcularSlaLey1620(reporte);

  if (modo === "compacto") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border leading-tight transition-colors ${sla.claseBadge} ${className}`}
        title={sla.textoLargo}
      >
        <span>{sla.textoCorto}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border ${sla.claseBadge} ${className}`}
      title={sla.textoLargo}
    >
      <span>{sla.textoLargo}</span>
    </div>
  );
}

/**
 * Tarjeta completa detallada del SLA Ley 1620 para el modal de gestión del reporte.
 */
export function RelojSlaLey1620Detalle({ reporte }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(intervalo);
  }, []);

  if (!reporte) return null;

  const sla = calcularSlaLey1620(reporte);
  const horasTranscurridas = sla.difHoras || 0;
  const minutosTranscurridos = (sla.difMinutos || 0) % 60;

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">⏱️</span>
          <div>
            <h4 className="text-xs font-black text-slate-800">
              Reloj de Plazos Legales — Ley 1620 de 2013
            </h4>
            <p className="text-[11px] text-slate-500">
              Control de debida diligencia y términos obligatorios (Decreto 1965 de 2013)
            </p>
          </div>
        </div>

        <BadgeSlaLey1620 reporte={reporte} modo="compacto" />
      </div>

      {/* Métricas de tiempo transcurrido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Transcurrido</p>
          <p className="font-black text-slate-800 text-sm mt-0.5">
            {horasTranscurridas}h {minutosTranscurridos}m
          </p>
          <span className="text-[10px] text-slate-400">Desde la radicación</span>
        </div>

        {sla.tipo === "TIPO_III" && (
          <>
            <div
              className={`p-2.5 rounded-xl border shadow-2xs ${
                sla.vencido
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <p className="text-[10px] font-bold uppercase opacity-75">
                Plazo Notificación Inmediata (&lt; 2h)
              </p>
              <p className="font-black text-sm mt-0.5">
                {sla.vencido ? "⚠️ Superado" : `${sla.minutosRestantes} min restantes`}
              </p>
              <span className="text-[10px] opacity-80">Rectoría y acudientes</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Plazo Oficial SIUCE (&lt; 48h)
              </p>
              <p className="font-black text-slate-800 text-sm mt-0.5">
                {sla.horasSiuceRestantes}h restantes
              </p>
              <span className="text-[10px] text-slate-400">MinEducación Nacional</span>
            </div>
          </>
        )}

        {sla.tipo === "TIPO_II" && (
          <div
            className={`col-span-2 p-2.5 rounded-xl border shadow-2xs ${
              sla.vencido
                ? "bg-orange-50 border-orange-200 text-orange-900"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <p className="text-[10px] font-bold uppercase opacity-75">
              Plazo Citación Acudientes (&lt; 24h)
            </p>
            <p className="font-black text-sm mt-0.5">
              {sla.vencido ? "⚠️ Plazo de 24h superado" : `${sla.horasRestantes}h restantes`}
            </p>
            <span className="text-[10px] opacity-80">
              Citación individual por separado a padres de víctima y presunto agresor
            </span>
          </div>
        )}

        {sla.tipo === "TIPO_I" && (
          <div className="col-span-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Plazo Mediación en Aula (&lt; 72h)
            </p>
            <p className="font-black text-slate-800 text-sm mt-0.5">
              {sla.vencido ? "Plazo superado" : `${sla.horasRestantes}h restantes`}
            </p>
            <span className="text-[10px] text-slate-400">
              Espacio formativo y acuerdos de convivencia pacífica
            </span>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-200/60">
        ⚖️ <strong>Fundamento Jurídico:</strong> Artículos 40 al 44 del Decreto 1965 de 2013 (Reglamentario de la Ley 1620). El cumplimiento oportuno de estos plazos certifica la debida diligencia de la institución ante requerimientos de autoridades judiciales o del Ministerio de Educación.
      </div>
    </div>
  );
}
