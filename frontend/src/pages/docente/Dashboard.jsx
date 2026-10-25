import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import reporteService from "../../services/reporteService";

export default function DashboardDocente() {
  const navigate = useNavigate();
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [stats, setStats] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState(null);
  const [ultimosReportes, setUltimosReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaGrados, setVistaGrados] = useState("grupos"); // "grupos" (11A, 11B) o "general" (11°, 8°)

  // Estado para el filtro por rango de fechas (HU-13 / HU-14)
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [presetActivo, setPresetActivo] = useState("todo");
  const [errorFechas, setErrorFechas] = useState("");

  // Función auxiliar para formatear Date a YYYY-MM-DD local
  const formatearISO = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const aplicarPreset = (tipo) => {
    setPresetActivo(tipo);
    setErrorFechas("");
    const hoy = new Date();

    if (tipo === "todo") {
      setFechaInicio("");
      setFechaFin("");
      return;
    }

    if (tipo === "7dias") {
      const hace7 = new Date();
      hace7.setDate(hoy.getDate() - 7);
      setFechaInicio(formatearISO(hace7));
      setFechaFin(formatearISO(hoy));
      return;
    }

    if (tipo === "30dias") {
      const hace30 = new Date();
      hace30.setDate(hoy.getDate() - 30);
      setFechaInicio(formatearISO(hace30));
      setFechaFin(formatearISO(hoy));
      return;
    }

    if (tipo === "mes") {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setFechaInicio(formatearISO(inicioMes));
      setFechaFin(formatearISO(hoy));
    }
  };

  const limpiarFechas = () => {
    setPresetActivo("todo");
    setFechaInicio("");
    setFechaFin("");
    setErrorFechas("");
  };

  useEffect(() => {
    // Validar que la fecha final no sea anterior a la inicial
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      setErrorFechas("La fecha final no puede ser anterior a la fecha inicial.");
      return;
    }
    setErrorFechas("");

    const cargarDatos = async () => {
      setCargando(true);
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;

      const verificar401 = (err) => {
        if (err.response?.status === 401) {
          logout();
          navigate("/docente/login");
          return true;
        }
        return false;
      };

      try {
        const statsData = await reporteService.obtenerEstadisticas(params);
        if (statsData) {
          setStats(statsData);
        }
      } catch (err) {
        if (verificar401(err)) return;
        console.warn("No se pudieron cargar estadísticas en vivo, usando datos de respaldo:", err);
      }

      try {
        const heatmapData = await reporteService.obtenerMapaCalor(params);
        if (heatmapData && Array.isArray(heatmapData.points)) {
          setHeatmapPoints(heatmapData.points);
        }
      } catch (err) {
        if (verificar401(err)) return;
        console.warn("No se pudo cargar mapa de calor en vivo:", err);
      }

      try {
        const reportesData = await reporteService.listarReportes({ page: 1, ...params });
        if (reportesData && reportesData.results) {
          setUltimosReportes(reportesData.results.slice(0, 5));
        } else if (Array.isArray(reportesData)) {
          setUltimosReportes(reportesData.slice(0, 5));
        }
      } catch (err) {
        if (verificar401(err)) return;
        console.warn("No se pudieron cargar últimos reportes en vivo:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [fechaInicio, fechaFin]);

  // Zonas base del plano arquitectónico institucional (alineadas con las 7 ubicaciones de HU-01)
  const zonasBase = [
    {
      id: "canchas",
      nombre: "Canchas & Patios",
      filtroUbicacion: "Descanso / zonas deportivas",
      categoria: "Zona Deportiva / Recreo",
      keywords: ["descanso", "deportiva", "cancha", "patio"],
      nivelDefault: "CRITICO",
      reportesDefault: 14,
      icono: "⚽",
      recomendacion: "Asignar 2 docentes de guardia fijos durante los recesos de 10:00 AM y 12:30 PM.",
      posicionSVG: { x: 25, y: 28, width: 225, height: 140 },
    },
    {
      id: "banos_secundaria",
      nombre: "Baños",
      filtroUbicacion: "Baños",
      categoria: "Servicios Sanitarios",
      keywords: ["baño", "bano", "sanitario"],
      nivelDefault: "ALTO",
      reportesDefault: 9,
      icono: "🚻",
      recomendacion: "Rondas periódicas de inspección preventiva por parte del equipo de convivencia.",
      posicionSVG: { x: 270, y: 28, width: 145, height: 100 },
    },
    {
      id: "salida",
      nombre: "Salida del Colegio",
      filtroUbicacion: "Salida del colegio",
      categoria: "Portería y Alrededores",
      keywords: ["salida", "entrada", "porter"],
      nivelDefault: "MEDIO",
      reportesDefault: 5,
      icono: "🚪",
      recomendacion: "Acompañamiento docente en portería y coordinación con rutas escolares al cierre de jornada.",
      posicionSVG: { x: 435, y: 28, width: 140, height: 95 },
    },
    {
      id: "bloque_a",
      nombre: "Salones de Clases",
      filtroUbicacion: "Salón de clases",
      categoria: "Aulas Académicas",
      keywords: ["salón", "salon", "aula", "clase"],
      nivelDefault: "MEDIO",
      reportesDefault: 7,
      icono: "🏫",
      recomendacion: "Mantener puertas abiertas durante cambios de clase y acuerdos de convivencia en aula.",
      posicionSVG: { x: 25, y: 192, width: 225, height: 140 },
    },
    {
      id: "pasillo_central",
      nombre: "Pasillos & Escaleras",
      filtroUbicacion: "Pasillos o escaleras",
      categoria: "Conectores de Tránsito",
      keywords: ["pasillo", "escalera"],
      nivelDefault: "ALTO",
      reportesDefault: 10,
      icono: "🏃",
      recomendacion: "Presencia preventiva de profesores en pasillos y escaleras durante cambios de bloque.",
      posicionSVG: { x: 270, y: 150, width: 145, height: 182 },
    },
    {
      id: "redes",
      nombre: "Internet & Redes",
      filtroUbicacion: "Internet / Redes sociales",
      categoria: "Entorno Digital / Ciberacoso",
      keywords: ["internet", "redes", "virtual", "ciber"],
      nivelDefault: "ALTO",
      reportesDefault: 4,
      icono: "🌐",
      recomendacion: "Activar protocolo de preservación de evidencia digital y talleres de ciudadanía digital.",
      posicionSVG: { x: 435, y: 140, width: 140, height: 90 },
    },
    {
      id: "otro",
      nombre: "Otras Zonas (Otro)",
      filtroUbicacion: "Otro",
      categoria: "Espacios Complementarios",
      keywords: ["otro", "biblioteca", "cafeter", "comedor"],
      nivelDefault: "BAJO",
      reportesDefault: 2,
      icono: "📍",
      recomendacion: "Verificar en la descripción del reporte el punto específico y reforzar supervisión focalizada.",
      posicionSVG: { x: 435, y: 245, width: 140, height: 87 },
    },
  ];

  const obtenerEstiloNivel = (nivel) => {
    switch (nivel) {
      case "CRITICO":
        return {
          colorBadge: "bg-rose-500 text-white",
          strokeColor: "#f43f5e",
          fillBg: "#2a121d",
          barColor: "#f43f5e",
        };
      case "ALTO":
        return {
          colorBadge: "bg-orange-500 text-white",
          strokeColor: "#f97316",
          fillBg: "#2a1c14",
          barColor: "#f97316",
        };
      case "MEDIO":
        return {
          colorBadge: "bg-amber-400 text-slate-900",
          strokeColor: "#fbbf24",
          fillBg: "#292316",
          barColor: "#fbbf24",
        };
      default:
        return {
          colorBadge: "bg-emerald-500 text-white",
          strokeColor: "#10b981",
          fillBg: "#112822",
          barColor: "#10b981",
        };
    }
  };

  // Zonas del colegio calculadas en vivo desde /api/v1/reports/heatmap/ y stats.by_location
  const zonasColegio = useMemo(() => {
    const tieneHeatmapEnVivo = Array.isArray(heatmapPoints);
    const tieneStatsEnVivo = stats !== null && stats.by_location !== undefined;

    if (!tieneHeatmapEnVivo && !tieneStatsEnVivo) {
      const maxDef = Math.max(...zonasBase.map((z) => z.reportesDefault), 1);
      return zonasBase.map((z) => ({
        ...z,
        nivel: z.nivelDefault,
        reportes: z.reportesDefault,
        intensidadPct: Math.round((z.reportesDefault / maxDef) * 100),
        desgloseRiesgo: { CRITICO: 0, ALTO: 0, MEDIO: z.reportesDefault, BAJO: 0 },
        ...obtenerEstiloNivel(z.nivelDefault),
      }));
    }

    // 1. Calcular conteos y desglose por nivel de riesgo para cada zona del plano
    const preliminares = zonasBase.map((z) => {
      let conteo = 0;
      const desglose = { CRITICO: 0, ALTO: 0, MEDIO: 0, BAJO: 0 };

      if (tieneHeatmapEnVivo) {
        for (const pt of heatmapPoints) {
          const zLower = (pt.zone || "").toLowerCase();
          if (z.keywords.some((k) => zLower.includes(k))) {
            conteo += pt.count || 0;
            if (pt.by_risk_level) {
              desglose.CRITICO += pt.by_risk_level.CRITICO || 0;
              desglose.ALTO += pt.by_risk_level.ALTO || 0;
              desglose.MEDIO += pt.by_risk_level.MEDIO || 0;
              desglose.BAJO += pt.by_risk_level.BAJO || 0;
            }
          }
        }
      } else if (tieneStatsEnVivo) {
        for (const [locName, count] of Object.entries(stats.by_location || {})) {
          const lower = locName.toLowerCase();
          if (z.keywords.some((k) => lower.includes(k))) {
            conteo += count;
          }
        }
      }

      return { ...z, conteo, desglose };
    });

    const maxConteo = Math.max(...preliminares.map((p) => p.conteo), 0);

    return preliminares.map((z) => {
      const intensidadPct = maxConteo > 0 ? Math.round((z.conteo / maxConteo) * 100) : 0;

      // Determinar nivel térmico de alerta según severidad de casos y concentración
      let nivelCalculado = "BAJO";
      if (z.conteo === 0) {
        nivelCalculado = "BAJO";
      } else if (z.desglose.CRITICO > 0 || (intensidadPct >= 80 && z.conteo >= 5)) {
        nivelCalculado = "CRITICO";
      } else if (z.desglose.ALTO > 0 || (intensidadPct >= 50 && z.conteo >= 3)) {
        nivelCalculado = "ALTO";
      } else if (z.desglose.MEDIO > 0 || z.conteo >= 1) {
        nivelCalculado = "MEDIO";
      }

      return {
        ...z,
        nivel: nivelCalculado,
        reportes: z.conteo,
        intensidadPct,
        desgloseRiesgo: z.desglose,
        ...obtenerEstiloNivel(nivelCalculado),
      };
    });
  }, [stats, heatmapPoints]);

  // Mantener sincronizada la tarjeta de detalle si cambia el filtro de fechas
  const zonaDetalleActual = useMemo(() => {
    if (!zonaSeleccionada) return null;
    return zonasColegio.find((z) => z.id === zonaSeleccionada.id) || zonaSeleccionada;
  }, [zonaSeleccionada, zonasColegio]);

  // Agrupa ubicaciones equivalentes (ej. 'SALON' y 'Salón de clases') para que KPIs, gráfico y mapa de calor coincidan siempre
  const ubicacionesAgrupadas = useMemo(() => {
    if (stats === null) return null;
    const acumulado = {};
    for (const [locName, count] of Object.entries(stats.by_location || {})) {
      const lower = (locName || "").toLowerCase();
      const zonaMatch = zonasBase.find((z) => z.keywords.some((k) => lower.includes(k)));
      const etiqueta = zonaMatch ? zonaMatch.filtroUbicacion : locName || "Otro";
      acumulado[etiqueta] = (acumulado[etiqueta] || 0) + (count || 0);
    }
    return Object.entries(acumulado).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  // Preparar datos para BarChart a partir de ubicacionesAgrupadas o respaldo
  const datosFrecuencia = useMemo(() => {
    if (ubicacionesAgrupadas !== null) {
      if (ubicacionesAgrupadas.length === 0) return [];
      const total = stats?.total_reports || ubicacionesAgrupadas.reduce((a, [, b]) => a + b, 0);
      const palette = ["#f43f5e", "#f97316", "#f59e0b", "#1B5E9E", "#10b981", "#8b5cf6", "#06b6d4"];
      return ubicacionesAgrupadas.slice(0, 7).map(([lugar, count], i) => ({
        lugar: lugar.length > 15 ? lugar.slice(0, 15) + "..." : lugar,
        nombreCompleto: lugar,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
        color: palette[i % palette.length],
      }));
    }
    return [
      { lugar: "Canchas & Patios", count: 14, pct: 35, color: "#f43f5e" },
      { lugar: "Pasillos", count: 10, pct: 25, color: "#f97316" },
      { lugar: "Baños Sec.", count: 9, pct: 22, color: "#f59e0b" },
      { lugar: "Bloque A", count: 7, pct: 15, color: "#1B5E9E" },
      { lugar: "Biblioteca", count: 1, pct: 3, color: "#10b981" },
      { lugar: "Otro", count: 2, pct: 5, color: "#8b5cf6" },
    ];
  }, [ubicacionesAgrupadas, stats]);

  // Parser inteligente de curso escolar: extrae grado numérico y subdivisión de salón (ej. 11a -> 11A, 8 B -> 8B, 6° Básico -> 6°)
  const parsearCurso = (raw) => {
    if (!raw) return { grupo: "Sin especificar", gradoGeneral: "Sin especificar", nivelNum: 99, seccion: "" };
    const str = String(raw).trim();
    // Limpiar descriptores comunes que no son letras de sección (básico, medio, secundaria, primaria, grado, curso)
    const clean = str.replace(/\b(b[aá]sico|medio|secundaria|primaria|grado|curso)\b/gi, "").trim();

    const palabrasNum = {
      primero: 1, segundo: 2, tercero: 3, cuarto: 4, quinto: 5,
      sexto: 6, septimo: 7, séptimo: 7, octavo: 8, noveno: 9,
      decimo: 10, décimo: 10, once: 11, doce: 12
    };

    let num = null;
    const numMatch = clean.match(/\b(1[0-2]|[1-9])\b|\b(1[0-2]|[1-9])(?=[a-fA-F°\s]|$)/);
    if (numMatch) {
      num = parseInt(numMatch[1] || numMatch[2], 10);
    } else {
      for (const [palabra, n] of Object.entries(palabrasNum)) {
        if (clean.toLowerCase().includes(palabra)) {
          num = n;
          break;
        }
      }
    }

    let seccion = "";
    const secMatch = clean.match(/(?:[-_\s]|^|[0-9]°?)([a-fA-F])\b/);
    if (secMatch) {
      seccion = secMatch[1].toUpperCase();
    }

    if (num !== null) {
      const gradoGeneral = `${num}°`;
      const grupo = seccion ? `${num}${seccion}` : `${num}°`;
      return { grupo, gradoGeneral, nivelNum: num, seccion };
    }

    return { grupo: str, gradoGeneral: str, nivelNum: 98, seccion: "" };
  };

  // Preparar datos para BarChart de Incidencia por Grados Escolares (soporta vista por Salón individual o consolidado por Grado)
  const datosGrados = useMemo(() => {
    if (stats !== null && stats.by_grade) {
      const mapa = {};
      for (const [rawGrado, count] of Object.entries(stats.by_grade)) {
        if (!count || rawGrado === "SIN_DATO") continue;
        const parsed = parsearCurso(rawGrado);
        const clave = vistaGrados === "grupos" ? parsed.grupo : parsed.gradoGeneral;

        if (!mapa[clave]) {
          mapa[clave] = {
            grado: clave,
            count: 0,
            nivelNum: parsed.nivelNum,
            seccion: vistaGrados === "grupos" ? parsed.seccion : "",
            subgrupos: {}
          };
        }
        mapa[clave].count += count;
        mapa[clave].subgrupos[parsed.grupo] = (mapa[clave].subgrupos[parsed.grupo] || 0) + count;
      }

      const items = Object.values(mapa);
      if (items.length === 0) return [];

      // Orden natural pedagógico: nivel escolar (2, 6, 7, 8, 9, 10, 11) y secciones alfabéticas (A, B, C...)
      items.sort((a, b) => {
        if (a.nivelNum !== b.nivelNum) return a.nivelNum - b.nivelNum;
        if (!a.seccion && b.seccion) return -1;
        if (a.seccion && !b.seccion) return 1;
        return a.grado.localeCompare(b.grado);
      });

      const totalCasos = items.reduce((sum, item) => sum + item.count, 0);
      const maxCount = Math.max(...items.map((item) => item.count), 0);

      return items.map((item) => {
        const esCritico = item.count === maxCount && item.count > 0;
        const desglose = Object.entries(item.subgrupos)
          .map(([sub, c]) => `${sub} (${c})`)
          .join(", ");

        return {
          grado: item.grado,
          count: item.count,
          pct: totalCasos > 0 ? Math.round((item.count / totalCasos) * 100) : 0,
          color: esCritico ? "#f43f5e" : item.count >= 3 ? "#f97316" : item.count >= 2 ? "#1B5E9E" : "#2C5F57",
          esCritico,
          desglose,
        };
      });
    }

    if (vistaGrados === "grupos") {
      return [
        { grado: "6A", count: 2, pct: 15, color: "#2C5F57", esCritico: false, desglose: "6A (2)" },
        { grado: "7B", count: 1, pct: 8, color: "#2C5F57", esCritico: false, desglose: "7B (1)" },
        { grado: "8A", count: 2, pct: 15, color: "#1B5E9E", esCritico: false, desglose: "8A (2)" },
        { grado: "8B", count: 1, pct: 8, color: "#2C5F57", esCritico: false, desglose: "8B (1)" },
        { grado: "9A", count: 2, pct: 15, color: "#2C5F57", esCritico: false, desglose: "9A (2)" },
        { grado: "10A", count: 2, pct: 15, color: "#2C5F57", esCritico: false, desglose: "10A (2)" },
        { grado: "11A", count: 2, pct: 15, color: "#f43f5e", esCritico: true, desglose: "11A (2)" },
        { grado: "11B", count: 1, pct: 8, color: "#2C5F57", esCritico: false, desglose: "11B (1)" },
      ];
    }

    return [
      { grado: "6°", count: 2, pct: 15, color: "#2C5F57", esCritico: false, desglose: "6A (2)" },
      { grado: "7°", count: 1, pct: 8, color: "#2C5F57", esCritico: false, desglose: "7B (1)" },
      { grado: "8°", count: 3, pct: 23, color: "#f43f5e", esCritico: true, desglose: "8A (2), 8B (1)" },
      { grado: "9°", count: 2, pct: 15, color: "#2C5F57", esCritico: false, desglose: "9A (2)" },
      { grado: "10°", count: 2, pct: 15, color: "#2C5F57", esCritico: false, desglose: "10A (2)" },
      { grado: "11°", count: 3, pct: 23, color: "#f43f5e", esCritico: true, desglose: "11A (2), 11B (1)" },
    ];
  }, [stats, vistaGrados]);

  // Identificar el grado o salón con mayor incidencia para la alerta pedagógica
  const gradoCritico = useMemo(() => {
    if (!datosGrados || datosGrados.length === 0) return null;
    const sorted = [...datosGrados].sort((a, b) => b.count - a.count);
    if (!sorted[0] || sorted[0].count === 0) return null;
    return sorted[0];
  }, [datosGrados]);

  // Preparar datos para Donut Chart de Tipología de Agresión (Ley 1620)
  const datosTiposAgresion = useMemo(() => {
    if (stats !== null) {
      const rawEntries = Object.entries(stats.by_type || {});
      if (rawEntries.length === 0) return [];

      const mapeoTipos = {
        "Agresión Verbal": { nombre: "Agresión Verbal", icono: "🗣️", color: "#1B5E9E" },
        "Insultos, gritos o apodos ofensivos": { nombre: "Agresión Verbal", icono: "🗣️", color: "#1B5E9E" },
        "Ciberacoso / Digital": { nombre: "Ciberacoso / Redes", icono: "📱", color: "#8b5cf6" },
        "Ciberacoso (Mensajes, fotos sin permiso, redes sociales)": { nombre: "Ciberacoso / Redes", icono: "📱", color: "#8b5cf6" },
        "Agresión Física": { nombre: "Agresión Física", icono: "💥", color: "#f43f5e" },
        "Me pegaron, empujaron o lastimaron (o a mi compañero/a)": { nombre: "Agresión Física", icono: "💥", color: "#f43f5e" },
        "Exclusión Social": { nombre: "Exclusión & Chismes", icono: "👥", color: "#f59e0b" },
        "Intimidación Psicológica": { nombre: "Intimidación / Amenazas", icono: "⚠️", color: "#ea580c" },
        "Inventaron chismes, amenazaron o me excluyeron del grupo": { nombre: "Exclusión & Chismes", icono: "👥", color: "#f59e0b" },
        "Me quitaron, escondieron o dañaron cosas": { nombre: "Daño a Bienes", icono: "🎒", color: "#06b6d4" },
      };

      const acumulado = {};
      for (const [k, count] of rawEntries) {
        const info = mapeoTipos[k] || {
          nombre: k.replace(/\?\?/g, "ó").replace(/\?a/g, "ía"),
          icono: "📌",
          color: "#64748b",
        };
        const etiqueta = info.nombre;
        if (!acumulado[etiqueta]) {
          acumulado[etiqueta] = { ...info, count: 0 };
        }
        acumulado[etiqueta].count += count;
      }

      const lista = Object.values(acumulado).filter((x) => x.count > 0);
      const totalMenciones = lista.reduce((sum, item) => sum + item.count, 0);

      return lista
        .sort((a, b) => b.count - a.count)
        .map((item) => ({
          ...item,
          name: item.nombre,
          value: totalMenciones > 0 ? Math.round((item.count / totalMenciones) * 100) : 0,
        }));
    }

    return [
      { name: "Agresión Verbal", count: 9, value: 45, color: "#1B5E9E", icono: "🗣️" },
      { name: "Exclusión & Chismes", count: 6, value: 30, color: "#f59e0b", icono: "👥" },
      { name: "Ciberacoso / Redes", count: 3, value: 15, color: "#8b5cf6", icono: "📱" },
      { name: "Agresión Física", count: 2, value: 10, color: "#f43f5e", icono: "💥" },
    ];
  }, [stats]);

  // KPIs calculados
  const totalReportes = stats !== null ? (stats.total_reports ?? 0) : 41;
  const enRevision = useMemo(() => {
    if (stats === null) return 10;
    if (!stats.by_status) return 0;
    let sum = 0;
    const activos = ["EN_REVISION", "PENDIENTE", "NUEVO", "EN_SEGUIMIENTO"];
    for (const [st, val] of Object.entries(stats.by_status)) {
      if (activos.includes(st.toUpperCase())) sum += val;
    }
    return sum;
  }, [stats]);
  const resueltos = useMemo(() => {
    if (stats === null) return 31;
    if (!stats.by_status) return 0;
    let sum = 0;
    const finalizados = ["CERRADO", "ATENDIDO", "DESCARTADO"];
    for (const [st, val] of Object.entries(stats.by_status)) {
      if (finalizados.includes(st.toUpperCase())) sum += val;
    }
    return sum;
  }, [stats]);
  const zonaCritica = useMemo(() => {
    if (ubicacionesAgrupadas !== null) {
      if (ubicacionesAgrupadas.length === 0) {
        return { nombre: "Sin registros", count: 0 };
      }
      return { nombre: ubicacionesAgrupadas[0][0], count: ubicacionesAgrupadas[0][1] };
    }
    return { nombre: "Canchas & Patios", count: 14 };
  }, [ubicacionesAgrupadas]);

  // Tabla de reportes recientes
  const reportesTabla = useMemo(() => {
    if (stats !== null) {
      return (ultimosReportes || []).map((rep) => ({
        codigo: rep.codigo_seguimiento || `SV-2026-${rep.id}`,
        grado: rep.grado_victima ? `Grado ${rep.grado_victima}` : "General",
        ubicacion: rep.ubicacion || "Sin especificar",
        frecuencia: rep.frecuencia || "Reiterativo",
        estado: rep.estado || "PENDIENTE",
      }));
    }
    return [
      { codigo: "SV-2026-88A", grado: "Grado 8°", ubicacion: "Salón de clases", frecuencia: "Varias semanas", estado: "EN_REVISION" },
      { codigo: "SV-2026-42B", grado: "Grado 10°", ubicacion: "Redes sociales", frecuencia: "Primera vez", estado: "PENDIENTE" },
      { codigo: "SV-2026-19C", grado: "Grado 6°", ubicacion: "Descanso", frecuencia: "Varios meses", estado: "ATENDIDO" },
    ];
  }, [ultimosReportes, stats]);

  const hayFiltroActivo = Boolean(fechaInicio || fechaFin);

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
            onClick={() => {
              logout();
              navigate("/docente/login");
            }}
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

        {/* Barra de Navegación Rápida Móvil (sólo pantallas < md) */}
        <div className="flex md:hidden items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Link
              to="/docente/dashboard"
              className="px-3 py-1.5 rounded-xl bg-[#1B5E9E] text-white shadow-2xs font-extrabold"
            >
              Dashboard
            </Link>
            <Link
              to="/docente/reportes"
              className="px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Bandeja
            </Link>
            <Link
              to="/docente/menu"
              className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              Menú
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/docente/login");
            }}
            className="text-rose-600 hover:text-rose-800 text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Salir
          </button>
        </div>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-8 space-y-6 overflow-y-auto">
          
          {/* Encabezado Principal + Filtro por Rango de Fechas (HU-13) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#1B5E9E]">Resumen Estadístico</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supervisión física y digital de focos de acoso escolar filtrable por periodo.
                </p>
              </div>

              {/* Atajos rápidos de periodo */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
                {[
                  { id: "todo", label: "Histórico Completo" },
                  { id: "7dias", label: "Últimos 7 días" },
                  { id: "30dias", label: "Últimos 30 días" },
                  { id: "mes", label: "Este mes" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => aplicarPreset(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      presetActivo === item.id
                        ? "bg-[#1B5E9E] text-white shadow-2xs"
                        : "text-slate-600 hover:text-[#1B5E9E] hover:bg-white/60"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controles de Rango de Fechas Personalizado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="fecha-inicio" className="text-xs font-bold text-slate-600">
                    Desde:
                  </label>
                  <input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    max={fechaFin || undefined}
                    onChange={(e) => {
                      setPresetActivo("personalizado");
                      setFechaInicio(e.target.value);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="fecha-fin" className="text-xs font-bold text-slate-600">
                    Hasta:
                  </label>
                  <input
                    id="fecha-fin"
                    type="date"
                    value={fechaFin}
                    min={fechaInicio || undefined}
                    onChange={(e) => {
                      setPresetActivo("personalizado");
                      setFechaFin(e.target.value);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                  />
                </div>

                {hayFiltroActivo && (
                  <button
                    type="button"
                    onClick={limpiarFechas}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>✕ Limpiar filtro</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                {cargando ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#1B5E9E]">
                    <span className="w-2 h-2 rounded-full bg-[#1B5E9E] animate-ping" />
                    Actualizando métricas...
                  </span>
                ) : hayFiltroActivo ? (
                  <span className="font-bold text-[#2C5F57] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    📅 Mostrando: {fechaInicio || "Inicio"} &rarr; {fechaFin || "Hoy"}
                  </span>
                ) : (
                  <span className="font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                    📅 Periodo Lectivo Completo
                  </span>
                )}
              </div>
            </div>

            {errorFechas && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
                ⚠️ {errorFechas}
              </div>
            )}
          </div>

          {/* Tarjetas de Métricas Clave SafeVoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reportes</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{cargando ? "..." : totalReportes}</p>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {hayFiltroActivo ? "En rango seleccionado" : "Datos en vivo"}
                </span>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-[#1B5E9E] rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                📋
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zona Más Crítica</p>
                <p className="text-lg font-black text-rose-600 mt-1 truncate max-w-[150px]" title={zonaCritica.nombre}>
                  {zonaCritica.nombre}
                </p>
                <span className="text-[11px] text-rose-600 font-bold">{zonaCritica.count} casos registrados</span>
              </div>
              <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                🚨
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Revisión / Pendiente</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{cargando ? "..." : enRevision}</p>
                <span className="text-[11px] text-amber-600 font-bold">Requieren atención</span>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
                ⏳
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Casos Resueltos</p>
                <p className="text-2xl font-black text-[#2C5F57] mt-1">{cargando ? "..." : resueltos}</p>
                <span className="text-[11px] text-[#2C5F57] font-bold">
                  {totalReportes > 0 ? `${Math.round((resueltos / totalReportes) * 100)}% atendidos` : "0% atendidos"}
                </span>
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
                    const isSelected = zonaDetalleActual?.id === zona.id;
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
                          y={centerY + 13}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="10"
                          fontWeight="800"
                          className="pointer-events-none tracking-wide"
                        >
                          {zona.nombre}
                        </text>

                        {/* Barra sutil de intensidad del mapa de calor en la base del bloque */}
                        <rect
                          x={x + 14}
                          y={y + height - 10}
                          width={width - 28}
                          height="4"
                          rx="2"
                          fill="#1e293b"
                          className="pointer-events-none"
                        />
                        {zona.intensidadPct > 0 && (
                          <rect
                            x={x + 14}
                            y={y + height - 10}
                            width={Math.max(6, ((width - 28) * zona.intensidadPct) / 100)}
                            height="4"
                            rx="2"
                            fill={zona.barColor || "#10b981"}
                            className="pointer-events-none"
                          />
                        )}

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
                  MAPA DE CALOR EN VIVO &bull; COLEGIO SAFEVOICE
                </div>
              </div>

              {/* PANEL DE DETALLES DE LA ZONA SELECCIONADA */}
              <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/80 flex flex-col justify-between h-full min-h-[400px]">
                {zonaDetalleActual ? (
                  <div className="space-y-3.5">
                    <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{zonaDetalleActual.categoria}</span>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <span>{zonaDetalleActual.icono}</span>
                          <span>{zonaDetalleActual.nombre}</span>
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${zonaDetalleActual.colorBadge}`}>
                        {zonaDetalleActual.nivel}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Casos e Intensidad Relativa del Mapa de Calor */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Casos concentrados:</span>
                          <span className="text-base font-black text-[#1B5E9E]">{zonaDetalleActual.reportes} reportes</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-semibold">Intensidad del Mapa de Calor:</span>
                            <span className="font-extrabold text-slate-700">{zonaDetalleActual.intensidadPct ?? 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${zonaDetalleActual.intensidadPct ?? 0}%`,
                                backgroundColor: zonaDetalleActual.barColor || "#1B5E9E",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Desglose por Nivel de Riesgo en esta Zona */}
                      {zonaDetalleActual.desgloseRiesgo && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Desglose por Riesgo IA en la Zona
                          </span>
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            <div className="bg-rose-50 border border-rose-200/80 rounded-xl py-1.5 px-1">
                              <p className="text-[9px] font-bold text-rose-700 uppercase">Crítico</p>
                              <p className="text-xs font-black text-rose-700">{zonaDetalleActual.desgloseRiesgo.CRITICO || 0}</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200/80 rounded-xl py-1.5 px-1">
                              <p className="text-[9px] font-bold text-orange-700 uppercase">Alto</p>
                              <p className="text-xs font-black text-orange-700">{zonaDetalleActual.desgloseRiesgo.ALTO || 0}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200/80 rounded-xl py-1.5 px-1">
                              <p className="text-[9px] font-bold text-amber-700 uppercase">Medio</p>
                              <p className="text-xs font-black text-amber-700">{zonaDetalleActual.desgloseRiesgo.MEDIO || 0}</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl py-1.5 px-1">
                              <p className="text-[9px] font-bold text-emerald-700 uppercase">Bajo</p>
                              <p className="text-xs font-black text-emerald-700">{zonaDetalleActual.desgloseRiesgo.BAJO || 0}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <span className="text-slate-500 font-bold">Plan de Acompañamiento Sugerido:</span>
                        <p className="p-3 bg-white rounded-2xl border border-slate-200/80 text-slate-700 leading-relaxed font-medium shadow-2xs">
                          {zonaDetalleActual.recomendacion}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link
                        to={`/docente/reportes?ubicacion=${encodeURIComponent(zonaDetalleActual.filtroUbicacion || zonaDetalleActual.nombre)}`}
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

          {/* MÉTICAS COMPLEMENTARIAS DE CONVIVENCIA ESCOLAR (HU-13 / LEY 1620) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* GRÁFICA 1: Incidencia por Grados Escolares */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <span>🎒</span>
                      <span>Incidencia por {vistaGrados === "grupos" ? "Salón / Grupo" : "Grado Escolar"}</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      {vistaGrados === "grupos"
                        ? "Distingue aulas y secciones específicas (ej. 11A vs 11B, 8A vs 8B) para asignar directores de grupo"
                        : "Consolida el nivel educativo general para informes institucionales y comités de convivencia"}
                    </p>
                  </div>

                  {/* Selector de granularidad: Salón específico vs Grado consolidado */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center shrink-0 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setVistaGrados("grupos")}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        vistaGrados === "grupos"
                          ? "bg-white text-[#1B5E9E] shadow-2xs font-black"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Por Salón (11A, 11B...)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVistaGrados("general")}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        vistaGrados === "general"
                          ? "bg-white text-[#1B5E9E] shadow-2xs font-black"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Por Grado (11°, 8°...)
                    </button>
                  </div>
                </div>

                {/* Banner de alerta pedagógica para el salón o grado con mayor atención */}
                {gradoCritico && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 rounded-2xl flex items-center justify-between text-xs text-rose-950 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                        ⚠️
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900 leading-tight">
                          {vistaGrados === "grupos"
                            ? `Salón de Atención Prioritaria: Grupo ${gradoCritico.grado}`
                            : `Nivel de Atención Prioritaria: Grado ${gradoCritico.grado}`}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Concentra {gradoCritico.count} {gradoCritico.count === 1 ? "reporte" : "reportes"} ({gradoCritico.pct}% de los incidentes escolares)
                          {vistaGrados === "general" && gradoCritico.desglose ? ` · Desglose: ${gradoCritico.desglose}` : ""}.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shrink-0">
                      Taller Recomendado
                    </span>
                  </div>
                )}
              </div>

              {/* Contenedor del BarChart de Grados */}
              <div className="h-60 w-full pt-1">
                {datosGrados.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={datosGrados}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <XAxis dataKey="grado" tick={{ fontSize: 11, fill: "#64748b", fontWeight: "700" }} interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                      <Tooltip
                        formatter={(value, name, props) => {
                          const p = props.payload;
                          const lineas = [`${value} ${value === 1 ? "reporte" : "reportes"} (${p.pct}%)`];
                          if (vistaGrados === "general" && p.desglose && p.desglose.includes(",")) {
                            lineas.push(`Salones: ${p.desglose}`);
                          }
                          return [lineas.join(" · "), "Incidentes"];
                        }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                          fontWeight: "600",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {datosGrados.map((entry, index) => (
                          <Cell key={`grade-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold text-center">
                    No hay información de grados registrada para el periodo seleccionado.
                  </div>
                )}
              </div>

              {/* Leyenda y Pauta Formativa */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    Mayor atención
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E9E] inline-block" />
                    Atención preventiva
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 italic">
                  Eje pedagógico: Comité de Convivencia
                </span>
              </div>
            </div>

            {/* GRÁFICA 2: Distribución por Tipología de Agresión (Ley 1620) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <span>⚖️</span>
                      <span>Tipología de Agresión (Ley 1620)</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Porcentaje de afectaciones según categorías normativas de convivencia
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2C5F57] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    Ley 1620
                  </span>
                </div>
              </div>

              {datosTiposAgresion.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-auto">
                    {/* Donut Chart */}
                    <div className="h-52 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={datosTiposAgresion}
                            innerRadius={50}
                            outerRadius={76}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {datosTiposAgresion.map((entry, index) => (
                              <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name, props) => [
                              `${value}% (${props.payload.count} ${props.payload.count === 1 ? "caso" : "casos"})`,
                              props.payload.name,
                            ]}
                            contentStyle={{
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              fontSize: "12px",
                              fontWeight: "600",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Total</span>
                        <span className="text-xl font-black text-slate-800">
                          {datosTiposAgresion.reduce((a, b) => a + (b.count || 0), 0)}
                        </span>
                        <span className="text-[10px] text-slate-400">conductas</span>
                      </div>
                    </div>

                    {/* Leyenda detallada con badges */}
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      {datosTiposAgresion.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="flex items-center gap-2 truncate pr-2">
                            <span className="text-sm">{item.icono || "📌"}</span>
                            <span className="truncate">{item.name}</span>
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400">({item.count})</span>
                            <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {item.value}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-56 flex items-center justify-center text-slate-400 text-xs font-semibold text-center">
                  Sin registros de tipologías de agresión en este periodo.
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Clasificación según Decreto 1965 de 2013</span>
                <span className="text-[#1B5E9E] font-bold">SafeVoice Analytics</span>
              </div>
            </div>

          </div>

          {/* GRÁFICA DE DISTRIBUCIÓN POR UBICACIÓN DEL COLEGIO */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <span>📍</span>
                  <span>Distribución de Casos por Ubicación Física</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Volumen y porcentaje de reportes según los espacios de la sede escolar
                </p>
              </div>
              <span className="text-xs font-bold text-[#1B5E9E] bg-[#DCEAF7] px-3 py-1 rounded-xl">
                Espacios
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              {datosFrecuencia.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datosFrecuencia}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <XAxis dataKey="lugar" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name, props) => [`${value} casos (${props.payload.pct}%)`, "Incidentes"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "600" }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {datosFrecuencia.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                  <p>No hay reportes registrados en el rango de fechas seleccionado.</p>
                </div>
              )}
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
                  {reportesTabla.length > 0 ? (
                    reportesTabla.map((rep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3.5 font-mono font-bold text-[#1B5E9E]">{rep.codigo}</td>
                        <td className="py-3.5">{rep.grado}</td>
                        <td className="py-3.5">{rep.ubicacion}</td>
                        <td className="py-3.5">{rep.frecuencia}</td>
                        <td className="py-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            rep.estado === "CERRADO" || rep.estado === "ATENDIDO" || rep.estado === "cerrado"
                              ? "bg-emerald-50 text-[#2C5F57] border-emerald-200"
                              : rep.estado === "EN_REVISION" || rep.estado === "en_revision" || rep.estado === "en_seguimiento"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {rep.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400 font-semibold">
                        No se encontraron reportes en el rango de fechas seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
