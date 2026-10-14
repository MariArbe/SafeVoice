/**
 * Configuración centralizada de estados y transiciones para SafeVoice (HU-08).
 */

export const ESTADOS = {
  NUEVO: "nuevo",
  EN_REVISION: "en_revision",
  EN_SEGUIMIENTO: "en_seguimiento",
  CERRADO: "cerrado",
};

export const ESTADOS_CONFIG = {
  nuevo: {
    key: "nuevo",
    label: "Nuevo",
    subtext: "Sin revisar",
    colorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  en_revision: {
    key: "en_revision",
    label: "En Revisión",
    subtext: "En comité de convivencia",
    colorBadge: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  en_seguimiento: {
    key: "en_seguimiento",
    label: "En Seguimiento",
    subtext: "Proceso de acompañamiento",
    colorBadge: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  cerrado: {
    key: "cerrado",
    label: "Cerrado",
    subtext: "Solucionado y archivado",
    colorBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
};

/**
 * Mapa centralizado de transiciones permitidas.
 * Para permitir más transiciones (ej. 'en_revision' -> 'cerrado'),
 * añade el destino a la lista del estado correspondiente:
 *   en_revision: ["en_seguimiento", "cerrado"]
 */
export const TRANSICIONES_PERMITIDAS = {
  nuevo: ["en_revision"],
  en_revision: ["en_seguimiento"],
  en_seguimiento: ["cerrado"],
  cerrado: [],
};

// Aliases para normalizar estados heredados si existen en base de datos
const ALIASES = {
  pendiente: "nuevo",
  atendido: "en_seguimiento",
  descartado: "cerrado",
};

/**
 * Normaliza cualquier string de estado a las claves oficiales ('nuevo', 'en_revision', etc.)
 */
export function normalizarEstado(estado) {
  if (!estado) return "nuevo";
  const str = String(estado).trim().toLowerCase();
  return ALIASES[str] || str;
}

/**
 * Obtiene la etiqueta visible unificada (ej: "Nuevo", "En Revisión", etc.)
 */
export function getNombreEstado(estado) {
  const norm = normalizarEstado(estado);
  return ESTADOS_CONFIG[norm]?.label || String(estado).replace(/_/g, " ");
}

/**
 * Obtiene las clases CSS de Tailwind para el badge del estado
 */
export function getColorEstado(estado) {
  const norm = normalizarEstado(estado);
  return ESTADOS_CONFIG[norm]?.colorBadge || "bg-slate-100 text-slate-700 border-slate-200";
}

/**
 * Formatea una fecha ISO a formato local legible en español.
 * Ejemplo: "13 oct 2026, 9:22 p. m."
 */
export function formatearFechaLocal(fechaStr) {
  if (!fechaStr) return "";
  try {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;

    // Día y mes abreviado con año
    const partesFecha = fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).replace(".", "");

    // Hora y minuto en formato 12h
    const partesHora = fecha.toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${partesFecha}, ${partesHora}`;
  } catch {
    return fechaStr;
  }
}

/**
 * Formato completo para tooltip accesible.
 */
export function formatearFechaCompleta(fechaStr) {
  if (!fechaStr) return "";
  try {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;
    return fecha.toLocaleString("es-ES", {
      dateStyle: "full",
      timeStyle: "medium",
    });
  } catch {
    return fechaStr;
  }
}
