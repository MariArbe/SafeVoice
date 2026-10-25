import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { logout, getUser } from "../../utils/auth";
import reporteService from "../../services/reporteService";
import api from "../../services/api";
import {
  ESTADOS_CONFIG,
  TRANSICIONES_PERMITIDAS,
  normalizarEstado,
  getNombreEstado,
  getColorEstado,
  formatearFechaLocal,
  formatearFechaCompleta,
} from "../../utils/estadosReporte";
import ModalActaOficial from "../../components/reportes/ModalActaOficial";
import ModalRemisionExterna from "../../components/reportes/ModalRemisionExterna";
import AsistenteLegalLey1620 from "../../components/reportes/AsistenteLegalLey1620";
import ModuloSemaforoPostCierre from "../../components/reportes/ModuloSemaforoPostCierre";

export default function BandejaReportesDocente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(() => getUser());

  // Hidratar nombre de institución y perfil del usuario autenticado si faltan en caché
  useEffect(() => {
    const u = getUser();
    if (u && (!u.institution_nombre || !u.first_name)) {
      api
        .get("/users/me/")
        .then((res) => {
          if (res.data) {
            const updated = { ...u, ...res.data };
            localStorage.setItem("user", JSON.stringify(updated));
            setUsuario(updated);
          }
        })
        .catch((err) => {
          console.warn("No se pudo hidratar perfil docente:", err);
        });
    }
  }, []);
  const [searchParams] = useSearchParams();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroSemaforo, setFiltroSemaforo] = useState("");
  const [filtros, setFiltros] = useState({
    nivel_riesgo_predicho: "",
    ubicacion: searchParams.get("ubicacion") || "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
    q: "",
    page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);

  // Estado para el Modal de Detalle/Edición
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formDataModal, setFormDataModal] = useState({
    estado: "",
    notas_orientador: "",
  });

  // Estado para la Línea de Tiempo de Cambios (HU-08)
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorGuardar, setErrorGuardar] = useState(null);

  // Estado para Sugerencias de Intervención (HU-15)
  const [recomendaciones, setRecomendaciones] = useState(null);
  const [cargandoRecomendaciones, setCargandoRecomendaciones] = useState(false);
  const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(true);

  // Estado para Acta Oficial, Remisión Externa y Exportación CSV (Ley 1620)
  const [mostrarActa, setMostrarActa] = useState(false);
  const [mostrarRemisionExterna, setMostrarRemisionExterna] = useState(false);
  const [rutaExternaInfo, setRutaExternaInfo] = useState(null);
  const [exportandoCSV, setExportandoCSV] = useState(false);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== "")
      );
      const data = await reporteService.listarReportes(params);

      if (data.results) {
        setReportes(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setReportes(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error al cargar reportes", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/docente/login");
        return;
      }
      // Fallback mock si la API aún no está disponible en desarrollo
      setReportes([
        {
          id: 1,
          codigo_seguimiento: "SV-88A92-2026",
          fecha_creacion: "2026-09-28T14:30:00Z",
          nivel_riesgo_predicho: "ALTO",
          estado: "en_revision",
          ubicacion: "Salón de clases",
          descripcion: "Insultos constantes por parte de dos compañeros durante el trabajo en equipo.",
          notas_orientador: "Se programó citación preliminar con el docente titular.",
          historial_cambios: [
            {
              estado_anterior: "nuevo",
              estado_nuevo: "en_revision",
              usuario_id: 1,
              usuario_nombre: "Psicorientadora Ana",
              fecha_cambio: "2026-09-28T15:00:00Z",
              comentario: "Apertura formal de revisión en comité.",
            },
          ],
        },
        {
          id: 2,
          codigo_seguimiento: "SV-42B10-2026",
          fecha_creacion: "2026-09-29T09:15:00Z",
          nivel_riesgo_predicho: "CRITICO",
          estado: "nuevo",
          ubicacion: "Internet / Redes sociales",
          descripcion: "Creación de grupo anónimo en WhatsApp difundiendo imágenes no autorizadas.",
          notas_orientador: "",
          historial_cambios: [],
        },
        {
          id: 3,
          codigo_seguimiento: "SV-19C03-2026",
          fecha_creacion: "2026-09-25T11:00:00Z",
          nivel_riesgo_predicho: "MEDIO",
          estado: "cerrado",
          ubicacion: "Descanso / zonas deportivas",
          descripcion: "Exclusión sistemática durante los juegos del descanso.",
          notas_orientador: "Caso atendido mediante taller de convivencia y acuerdo firmado.",
          historial_cambios: [
            {
              estado_anterior: "en_seguimiento",
              estado_nuevo: "cerrado",
              usuario_id: 1,
              usuario_nombre: "Psicorientadora Ana",
              fecha_cambio: "2026-09-27T10:30:00Z",
              comentario: "Compromisos cumplidos por ambas partes. Se archiva el caso.",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar búsqueda debounced con los filtros del backend (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => {
        const clean = busqueda.trim();
        if (prev.q === clean) return prev;
        return { ...prev, q: clean, page: 1 };
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.nivel_riesgo_predicho, filtros.ubicacion, filtros.estado, filtros.fecha_inicio, filtros.fecha_fin, filtros.q, filtros.page]);

  // Búsqueda instantánea en cliente (0ms de latencia) sobre la lista cargada
  const reportesFiltrados = useMemo(() => {
    let resultado = reportes;

    if (filtroSemaforo) {
      resultado = resultado.filter((item) => {
        const cambios = item.historial_cambios || [];
        const chequeos = cambios.filter(
          (c) =>
            c.tipo_accion === "CHEQUEO_POST_CIERRE" ||
            c.tipo_accion === "REACTIVACION_REINCIDENCIA"
        );
        if (filtroSemaforo === "PENDIENTE") {
          return normalizarEstado(item.estado) === "cerrado" && chequeos.length === 0;
        }
        if (chequeos.length === 0) return false;
        const ultimo = chequeos[chequeos.length - 1];
        return ultimo.metadata?.semaforo === filtroSemaforo;
      });
    }

    if (!busqueda.trim()) return resultado;
    const q = busqueda.trim().toLowerCase();
    return resultado.filter((item) => {
      const cod = String(item.codigo_seguimiento || "").toLowerCase();
      const desc = String(item.descripcion || "").toLowerCase();
      const ubi = String(item.ubicacion || "").toLowerCase();
      const nom = String(item.nombre_contacto_victima || "").toLowerCase();
      const medio = String(item.medio_contacto_victima || "").toLowerCase();
      const grado = String(item.grado_victima || "").toLowerCase();
      return (
        cod.includes(q) ||
        desc.includes(q) ||
        ubi.includes(q) ||
        nom.includes(q) ||
        medio.includes(q) ||
        grado.includes(q)
      );
    });
  }, [reportes, busqueda, filtroSemaforo]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const getColorRiesgo = (riesgo) => {
    switch (riesgo) {
      case "BAJO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "MEDIO":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "ALTO":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "CRITICO":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Cargar historial del reporte seleccionado
  const cargarHistorial = async (idOcodigo, reporteRef = null) => {
    setCargandoHistorial(true);
    try {
      const data = await reporteService.obtenerHistorial(idOcodigo);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("No se pudo obtener el historial desde la API, usando datos locales:", err);
      const target = reporteRef || reporteSeleccionado;
      if (target && Array.isArray(target.historial_cambios)) {
        // Ordenar más reciente primero
        setHistorial([...target.historial_cambios].reverse());
      } else {
        setHistorial([]);
      }
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Cargar sugerencias de intervención y protocolos (HU-15)
  const cargarRecomendaciones = async (targetId, fallbackItem) => {
    setCargandoRecomendaciones(true);
    try {
      if (reporteService.obtenerRecomendaciones) {
        const data = await reporteService.obtenerRecomendaciones(targetId);
        if (data && data.protocolo_principal) {
          setRecomendaciones(data);
          return;
        }
      }
    } catch (err) {
      console.warn("No se pudieron cargar recomendaciones desde la API, usando catálogo de contingencia:", err);
    } finally {
      setCargandoRecomendaciones(false);
    }

    // Catálogo de contingencia en frontend alineado con la Ley 1620
    const nivel = (fallbackItem?.nivel_riesgo_predicho || "MEDIO").toUpperCase();
    const fallbackMap = {
      CRITICO: {
        nivel_riesgo: "CRITICO",
        tipo_situacion: "Situación Tipo III (Presuntos Delitos / Riesgo Vital / Violencia Severa)",
        urgencia: "Inmediata (< 2 horas)",
        color: "rose",
        protocolo_principal: "Activación de Ruta de Atención Integral en Salud, Protección y Justicia",
        acciones_clave: [
          "Brindar atención médica de urgencias o primeros auxilios psicológicos si hay afectación física o ideación suicida.",
          "Garantizar la protección física y contención emocional inmediata del estudiante en un espacio seguro y confidencial.",
          "Notificar de inmediato a Rectoría y citar con carácter urgente a padres o acudientes por separado.",
          "Efectuar la remisión obligatoria a autoridades competentes: Policía de Infancia (123), ICBF (141) o Fiscalía.",
          "Convocar sesión extraordinaria del Comité Escolar de Convivencia y reportar en el aplicativo SIUCE dentro de las 48 horas.",
        ],
        lineas_ayuda: [
          { nombre: "Policía de Infancia y Adolescencia / Emergencias", contacto: "123" },
          { nombre: "Línea 141 ICBF (Protección de Niñas, Niños y Adolescentes)", contacto: "141" },
          { nombre: "Línea 106 (Salud Mental y Prevención del Suicidio)", contacto: "106" },
          { nombre: "Línea 155 (Orientación a Mujeres Víctimas de Violencia)", contacto: "155" },
        ],
        recomendaciones_especificas: [],
      },
      ALTO: {
        nivel_riesgo: "ALTO",
        tipo_situacion: "Situación Tipo II (Acoso Escolar Sistemático / Daño Físico o Emocional)",
        urgencia: "Alta (< 24 horas hábiles)",
        color: "orange",
        protocolo_principal: "Protocolo de Intervención Tipo II - Contención, Protección Activa y Comité de Convivencia",
        acciones_clave: [
          "Garantizar medidas cautelares de protección para evitar coincidencias de las partes en recesos o grupos.",
          "Citar de forma individual a los padres o acudientes de las partes para formalizar compromisos por escrito.",
          "Brindar espacio de escucha individual y acompañamiento socioemocional desde Orientación Escolar.",
          "Remitir el caso al Comité Escolar de Convivencia para estructurar el plan de acción pedagógico.",
          "Establecer monitoreo semanal documentado del clima en el aula y de la seguridad del estudiante reportante.",
        ],
        lineas_ayuda: [
          { nombre: "Línea 106 (Acompañamiento Psicológico Escolar)", contacto: "106" },
          { nombre: "Comité Escolar de Convivencia", contacto: "Orientación Escolar" },
        ],
        recomendaciones_especificas: [],
      },
      MEDIO: {
        nivel_riesgo: "MEDIO",
        tipo_situacion: "Situación Tipo I Reiterada (Frecuencia Continua / Hostigamiento Incipiente)",
        urgencia: "Media (< 48 horas)",
        color: "yellow",
        protocolo_principal: "Estrategia Pedagógica Formativa y Mediación Asistida",
        acciones_clave: [
          "Realizar entrevistas diagnósticas individuales con cada estudiante para clarificar la dinámica relacional.",
          "Establecer acuerdos restaurativos claros y compromisos firmados de buen trato y respeto mutuo.",
          "Involucrar al docente titular o director de grupo en la supervisión preventiva durante clases y recesos.",
          "Desarrollar talleres grupales en el aula sobre empatía, límites y convivencia constructiva.",
        ],
        lineas_ayuda: [
          { nombre: "Orientación Escolar y Docencia Titular", contacto: "Convivencia" },
        ],
        recomendaciones_especificas: [],
      },
      BAJO: {
        nivel_riesgo: "BAJO",
        tipo_situacion: "Situación Tipo I (Conflictos Esporádicos / Roce Convivencial Menor)",
        urgencia: "Normal (< 72 horas)",
        color: "emerald",
        protocolo_principal: "Mediación Escolar y Diálogo Restaurativo",
        acciones_clave: [
          "Facilitar un espacio pedagógico de diálogo constructivo guiado por el docente de grupo u orientador.",
          "Fomentar el reconocimiento del impacto de los actos y acordar compromisos voluntarios de respeto.",
          "Monitoreo pedagógico discreto en el salón de clases durante las siguientes dos semanas.",
        ],
        lineas_ayuda: [
          { nombre: "Docente Director de Grupo", contacto: "Aula de Clases" },
        ],
        recomendaciones_especificas: [],
      },
    };
    setRecomendaciones(fallbackMap[nivel] || fallbackMap.MEDIO);
  };

  // Helpers para manejo y visualización de archivos de evidencia (HU-02)
  const getEvidenciaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const esImagen = (url) => {
    if (!url) return false;
    const clean = url.toLowerCase().split("?")[0];
    return [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) => clean.endsWith(ext));
  };

  const esPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().split("?")[0].endsWith(".pdf");
  };

  // Copiar el protocolo y acciones recomendadas a las notas de seguimiento
  const handleCopiarRecomendacion = (protocolo, acciones) => {
    const textoAcciones = (acciones || []).map((a, i) => `${i + 1}. ${a}`).join("\n");
    const textoCompleto = `[Protocolo Ley 1620]: ${protocolo}\nAcciones a seguir:\n${textoAcciones}`;
    setFormDataModal((prev) => ({
      ...prev,
      notas_orientador: prev.notas_orientador
        ? `${prev.notas_orientador}\n\n${textoCompleto}`
        : textoCompleto,
    }));
  };

  // Exportar listado de reportes a CSV (Excel / SIUCE)
  const handleExportarCSV = async () => {
    setExportandoCSV(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([k, v]) => v !== "" && k !== "page")
      );
      await reporteService.exportarReportesCSV(params, reportesFiltrados);
    } catch (err) {
      console.error("Error al exportar reportes:", err);
      alert("No se pudo exportar el archivo CSV. Por favor intente de nuevo.");
    } finally {
      setExportandoCSV(false);
    }
  };

  // Abrir modal con los datos del reporte
  const handleAbrirModal = (item) => {
    const estadoNorm = normalizarEstado(item.estado);
    const itemNormalizado = { ...item, estado: estadoNorm };

    setReporteSeleccionado(itemNormalizado);
    setFormDataModal({
      estado: estadoNorm,
      notas_orientador: "",
    });
    setMostrarHistorial(false);
    setHistorial([]);
    setMensajeExito(null);
    setErrorGuardar(null);
    setMostrarRecomendaciones(true);

    // Verificar si en el historial ya existe registro previo de Ruta Externa activada
    const rutaEnHistorial = (itemNormalizado.historial_cambios || []).find(
      (h) => h.tipo_accion === "ACTIVACION_RUTA_EXTERNA"
    );
    if (rutaEnHistorial && rutaEnHistorial.metadata) {
      setRutaExternaInfo({
        entidad: rutaEnHistorial.metadata.entidad_nombre || rutaEnHistorial.metadata.entidad,
        radicado: rutaEnHistorial.metadata.radicado,
        fecha: rutaEnHistorial.fecha_cambio,
      });
    } else {
      setRutaExternaInfo(null);
    }

    cargarRecomendaciones(itemNormalizado.id || itemNormalizado.codigo_seguimiento, itemNormalizado);
    cargarHistorial(itemNormalizado.id || itemNormalizado.codigo_seguimiento, itemNormalizado);
  };

  // Confirmar y registrar formalmente la activación de Ruta Externa (Tipo III)
  const handleConfirmarActivacionRuta = async (datos) => {
    if (!reporteSeleccionado) return;
    const targetId = reporteSeleccionado.id || reporteSeleccionado.codigo_seguimiento;
    try {
      if (reporteService.registrarSeguimiento) {
        await reporteService.registrarSeguimiento(targetId, {
          comentario: `🚨 Activación Formal de Ruta Externa Ley 1620: Remisión efectuada ante ${datos.entidad_nombre} bajo radicado institucional ${datos.radicado}. Medidas cautelares: ${datos.observaciones || "Protección y atención prioritaria."}`,
          tipo_accion: "ACTIVACION_RUTA_EXTERNA",
          metadata: datos,
        });
      }
      setRutaExternaInfo({
        entidad: datos.entidad_nombre,
        radicado: datos.radicado,
        fecha: datos.fecha_activacion,
      });
      setMensajeExito(
        `¡Ruta Externa activada exitosamente ante ${datos.entidad_nombre}! Se generó el oficio formal y quedó registrado en auditoría.`
      );
      setTimeout(() => setMensajeExito(null), 6000);
      await cargarHistorial(targetId);
      setMostrarHistorial(true);
    } catch (err) {
      console.error("Error al activar ruta externa:", err);
      setErrorGuardar("No se pudo registrar la activación de ruta externa en el servidor.");
    }
  };

  // Manejo de chequeo post-cierre registrado (15, 30 o 60 días)
  const handleChequeoRegistrado = (reporteActualizado) => {
    const estadoNorm = normalizarEstado(reporteActualizado.estado);
    const itemActualizado = { ...reporteActualizado, estado: estadoNorm };

    setReporteSeleccionado(itemActualizado);
    setFormDataModal((prev) => ({
      ...prev,
      estado: estadoNorm,
    }));
    setReportes((prev) =>
      prev.map((r) =>
        (r.id && r.id === itemActualizado.id) ||
        r.codigo_seguimiento === itemActualizado.codigo_seguimiento
          ? { ...r, ...itemActualizado }
          : r
      )
    );

    if (estadoNorm === "en_seguimiento" && reporteSeleccionado?.estado === "cerrado") {
      setMensajeExito(
        "⚠️ ¡ALERTA DE REINCIDENCIA! El caso fue reactivado automáticamente a estado «En Seguimiento» para intervención prioritaria."
      );
    } else {
      setMensajeExito("¡Chequeo post-cierre registrado exitosamente en la bitácora del caso!");
    }
    setTimeout(() => setMensajeExito(null), 6000);

    const targetId = itemActualizado.id || itemActualizado.codigo_seguimiento;
    cargarHistorial(targetId);
  };

  // Toggle de la línea de tiempo de cambios
  const handleToggleHistorial = () => {
    const siguienteEstado = !mostrarHistorial;
    setMostrarHistorial(siguienteEstado);
    if (siguienteEstado && historial.length === 0 && reporteSeleccionado) {
      const targetId = reporteSeleccionado.id || reporteSeleccionado.codigo_seguimiento;
      cargarHistorial(targetId, reporteSeleccionado);
    }
  };

  // Guardar cambios del reporte (cambio de estado o notas de seguimiento)
  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setErrorGuardar(null);
    setMensajeExito(null);

    const estadoActual = normalizarEstado(reporteSeleccionado.estado);
    const nuevoEstado = normalizarEstado(formDataModal.estado);
    const targetId = reporteSeleccionado.id || reporteSeleccionado.codigo_seguimiento;

    // Si el estado es el mismo, pero escribió una nota de seguimiento / mediación
    if (nuevoEstado === estadoActual) {
      if (!formDataModal.notas_orientador.trim()) {
        setErrorGuardar("Seleccione un estado diferente al actual o ingrese una nota de seguimiento.");
        return;
      }

      setGuardando(true);
      try {
        if (reporteService.registrarSeguimiento) {
          await reporteService.registrarSeguimiento(targetId, {
            comentario: formDataModal.notas_orientador,
            tipo_accion: "NOTA_SEGUIMIENTO",
          });
        }
        setFormDataModal((prev) => ({ ...prev, notas_orientador: "" }));
        setMensajeExito("¡Nota de seguimiento guardada exitosamente en la bitácora del caso!");
        setTimeout(() => setMensajeExito(null), 5000);
        await cargarHistorial(targetId);
        setMostrarHistorial(true);
        return;
      } catch (err) {
        console.error("Error al registrar nota de seguimiento:", err);
        setErrorGuardar("No se pudo guardar la nota de seguimiento.");
        return;
      } finally {
        setGuardando(false);
      }
    }

    setGuardando(true);

    try {
      if (reporteService.actualizarReporte) {
        await reporteService.actualizarReporte(targetId, {
          estado: nuevoEstado,
          notas_orientador: formDataModal.notas_orientador,
        });
      }

      // Actualizar estado en el modal sin cerrarlo
      setReporteSeleccionado((prev) => ({
        ...prev,
        estado: nuevoEstado,
      }));
      setFormDataModal((prev) => ({
        ...prev,
        estado: nuevoEstado,
        notas_orientador: "",
      }));

      // Actualizar tabla en background
      setReportes((prev) =>
        prev.map((r) =>
          (r.id && r.id === reporteSeleccionado.id) ||
          r.codigo_seguimiento === reporteSeleccionado.codigo_seguimiento
            ? { ...r, estado: nuevoEstado }
            : r
        )
      );

      setMensajeExito("¡Estado del reporte actualizado exitosamente!");
      setTimeout(() => setMensajeExito(null), 5000);

      // Refrescar inmediatamente el historial sin cerrar el modal
      await cargarHistorial(targetId);
      setMostrarHistorial(true);
    } catch (err) {
      console.error("Error actualizando reporte:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "No se pudo actualizar el estado del reporte. Verifique que la transición sea permitida.";
      setErrorGuardar(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setGuardando(false);
    }
  };

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
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#1B5E9E] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Dashboard de Datos</span>
            </Link>

            <Link
              to="/docente/reportes"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#2C5F57] text-white shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>Bandeja de Reportes</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1 text-xs font-bold text-slate-600">
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
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Central de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-sm font-extrabold text-[#2C5F57]">Gestión de Casos de Convivencia</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCEAF7] flex items-center justify-center font-bold text-xs text-[#1B5E9E]">
              {usuario?.first_name ? usuario.first_name[0].toUpperCase() : "PO"}
            </div>
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-slate-800">
                {usuario?.first_name ? `${usuario.first_name} ${usuario.last_name || ""}`.trim() : "Psicorientador(a)"}
              </p>
              <p className="text-[10px] text-[#2C5F57] font-semibold">
                {usuario?.institution_nombre || "Institución Educativa"}
              </p>
            </div>
          </div>
        </header>

        {/* Barra de Navegación Rápida Móvil (sólo pantallas < md) */}
        <div className="flex md:hidden items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Link
              to="/docente/dashboard"
              className="px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/docente/reportes"
              className="px-3 py-1.5 rounded-xl bg-[#2C5F57] text-white shadow-2xs font-extrabold"
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

        <main className="p-4 sm:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#2C5F57]">Bandeja de Entrada de Reportes</h1>
              <p className="text-xs text-slate-500 mt-0.5">Revise, clasifique y dé seguimiento a las alertas recibidas.</p>
            </div>

            <button
              onClick={handleExportarCSV}
              disabled={exportandoCSV || loading}
              className="self-start sm:self-auto flex items-center gap-2 bg-[#2C5F57] hover:bg-[#234c45] active:scale-[0.98] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Descarga el listado filtrado en formato CSV para Microsoft Excel o reportes al SIUCE"
            >
              {exportandoCSV ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exportando datos...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Exportar a Excel / CSV</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
            {/* Buscador y Filtros */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-extrabold text-slate-800 text-base">Bandeja de Casos</h2>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {reportesFiltrados.length} {reportesFiltrados.length === 1 ? "caso" : "casos"}
                  </span>
                </div>

                {/* Filtros desplegables */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    name="nivel_riesgo_predicho"
                    value={filtros.nivel_riesgo_predicho}
                    onChange={handleFilterChange}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2C5F57] cursor-pointer"
                  >
                    <option value="">Todos los Riesgos IA</option>
                    <option value="CRITICO">Riesgo Crítico</option>
                    <option value="ALTO">Riesgo Alto</option>
                    <option value="MEDIO">Riesgo Medio</option>
                    <option value="BAJO">Riesgo Bajo</option>
                  </select>

                  <select
                    name="ubicacion"
                    value={filtros.ubicacion}
                    onChange={handleFilterChange}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2C5F57] cursor-pointer"
                  >
                    <option value="">Todas las Ubicaciones</option>
                    <option value="Salón de clases">Salón de clases</option>
                    <option value="Pasillos o escaleras">Pasillos o escaleras</option>
                    <option value="Baños">Baños</option>
                    <option value="Descanso / zonas deportivas">Descanso / zonas deportivas</option>
                    <option value="Salida del colegio">Salida del colegio</option>
                    <option value="Internet / Redes sociales">Internet / Redes sociales</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <select
                    name="estado"
                    value={filtros.estado}
                    onChange={handleFilterChange}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2C5F57] cursor-pointer"
                  >
                    <option value="">Todos los Estados</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="en_seguimiento">En Seguimiento</option>
                    <option value="cerrado">Cerrado</option>
                  </select>

                  {/* Filtro por Semáforo de Convivencia Post-Cierre */}
                  <select
                    name="filtroSemaforo"
                    value={filtroSemaforo}
                    onChange={(e) => setFiltroSemaforo(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2C5F57] cursor-pointer"
                  >
                    <option value="">Semáforo Post-Cierre</option>
                    <option value="PENDIENTE">⏳ D15 Pendiente</option>
                    <option value="VERDE">🟢 Convivencia Estable</option>
                    <option value="AMARILLO">🟡 Tensión Residual</option>
                    <option value="ROJO">🔴 Reincidencia</option>
                  </select>

                  {/* Filtro por Rango de Fechas (Desde / Hasta) */}
                  <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600">
                    <span className="text-[11px] font-bold text-slate-500">Desde:</span>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={filtros.fecha_inicio || ""}
                      onChange={handleFilterChange}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                      title="Filtrar casos a partir de esta fecha"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600">
                    <span className="text-[11px] font-bold text-slate-500">Hasta:</span>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={filtros.fecha_fin || ""}
                      onChange={handleFilterChange}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                      title="Filtrar casos hasta esta fecha"
                    />
                  </div>

                  {(filtros.fecha_inicio || filtros.fecha_fin) && (
                    <button
                      type="button"
                      onClick={() => setFiltros((prev) => ({ ...prev, fecha_inicio: "", fecha_fin: "", page: 1 }))}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Limpiar fechas"
                    >
                      ✕ Limpiar fechas
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de Búsqueda Instantánea */}
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Búsqueda instantánea por código de seguimiento (ej. SV-2026-..., UUID) o fragmento de la descripción..."
                  className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#1B5E9E] rounded-2xl pl-10 pr-24 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]/20"
                />
                {busqueda && (
                  <div className="absolute right-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                      {reportesFiltrados.length} encontrados
                    </span>
                    <button
                      type="button"
                      onClick={() => setBusqueda("")}
                      className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs flex items-center justify-center transition-all cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de Registros */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Código / Ticket</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Riesgo IA</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                        Cargando reportes...
                      </td>
                    </tr>
                  ) : reportesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <div className="max-w-md mx-auto space-y-2">
                          <span className="text-2xl block">🔍</span>
                          <p className="font-bold text-slate-700 text-sm">
                            No se encontraron reportes coincidentes
                          </p>
                          <p className="text-xs text-slate-500">
                            {busqueda
                              ? `Ningún caso coincide con "${busqueda}". Intenta buscar por otro código o palabra clave.`
                              : "No hay reportes que coincidan con los filtros seleccionados."}
                          </p>
                          {busqueda && (
                            <button
                              type="button"
                              onClick={() => setBusqueda("")}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <span>✕ Limpiar búsqueda</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reportesFiltrados.map((item) => (
                      <tr key={item.codigo_seguimiento} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1B5E9E]">
                          <div>{item.codigo_seguimiento}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.evidencia_url && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md"
                                title="Reporte con archivo de evidencia adjunto"
                              >
                                📎 Evidencia
                              </span>
                            )}
                            {(item.nombre_contacto_victima || item.medio_contacto_victima) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                👤 Con contacto
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(item.fecha_creacion).toLocaleDateString("es-CO")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getColorRiesgo(item.nivel_riesgo_predicho)}`}>
                            {item.nivel_riesgo_predicho}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-slate-700">{item.ubicacion}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getColorEstado(item.estado)}`}>
                            {getNombreEstado(item.estado)}
                          </span>
                          {/* Mini indicador de semáforo post-cierre si el caso está cerrado */}
                          {(() => {
                            if (normalizarEstado(item.estado) !== "cerrado") return null;
                            const cambios = item.historial_cambios || [];
                            const chequeos = cambios.filter(
                              (c) =>
                                c.tipo_accion === "CHEQUEO_POST_CIERRE" ||
                                c.tipo_accion === "REACTIVACION_REINCIDENCIA"
                            );
                            if (chequeos.length === 0) {
                              return (
                                <span className="block mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-center">
                                  ⏳ D15 Pendiente
                                </span>
                              );
                            }
                            const ultimo = chequeos[chequeos.length - 1];
                            const sem = ultimo.metadata?.semaforo;
                            if (sem === "ROJO") {
                              return (
                                <span className="block mt-1 text-[9px] font-black text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-center">
                                  🔴 Reincidencia
                                </span>
                              );
                            }
                            if (sem === "AMARILLO") {
                              return (
                                <span className="block mt-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-center">
                                  🟡 Tensión D{ultimo.metadata?.hito?.replace("DIA_", "")}
                                </span>
                              );
                            }
                            return (
                              <span className="block mt-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-center">
                                🟢 Estable D{ultimo.metadata?.hito?.replace("DIA_", "")}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleAbrirModal(item)}
                            className="bg-[#1B5E9E] hover:bg-blue-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            Ver / Editar Detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 font-semibold">
                <p>Mostrando página {filtros.page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={filtros.page === 1}
                    onClick={() => setFiltros((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={filtros.page === totalPages}
                    onClick={() => setFiltros((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL DE EDICIÓN Y DETALLE DEL REPORTE */}
      {reporteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden space-y-0">
            
            {/* Header Modal */}
            <div className="bg-[#1B5E9E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-white/20 px-2 py-0.5 rounded-md">
                  Caso #{reporteSeleccionado.codigo_seguimiento}
                </span>
                <h3 className="text-lg font-black mt-1">Detalle y Gestión del Reporte</h3>
              </div>
              <button
                onClick={() => setReporteSeleccionado(null)}
                className="text-white/80 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleGuardarCambios} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Información General */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Ubicación</p>
                  <p className="font-bold text-slate-800">{reporteSeleccionado.ubicacion}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Riesgo predicho por IA</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getColorRiesgo(reporteSeleccionado.nivel_riesgo_predicho)}`}>
                    {reporteSeleccionado.nivel_riesgo_predicho}
                  </span>
                </div>
              </div>

              {/* Descripción Anónima del Estudiante */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción enviada por el estudiante:
                </label>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed">
                  "{reporteSeleccionado.descripcion}"
                </div>
              </div>

              {/* Evidencia Adjunta al Reporte (HU-02) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Evidencia adjunta por el reportante:
                  </label>
                  {reporteSeleccionado.evidencia_url && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>✓</span> 1 archivo adjunto
                    </span>
                  )}
                </div>

                {reporteSeleccionado.evidencia_url ? (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                    {/* Si es imagen: miniatura + acciones */}
                    {esImagen(reporteSeleccionado.evidencia_url) ? (
                      <div className="space-y-3">
                        <div className="relative group max-h-64 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2 shadow-2xs">
                          <img
                            src={getEvidenciaUrl(reporteSeleccionado.evidencia_url)}
                            alt="Evidencia fotográfica adjunta"
                            className="max-h-56 object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <span>🔒</span> Archivo anonimizado en servidor
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={getEvidenciaUrl(reporteSeleccionado.evidencia_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>Ver tamaño completo</span>
                            </a>
                            <a
                              href={getEvidenciaUrl(reporteSeleccionado.evidencia_url)}
                              download
                              className="px-3 py-1.5 rounded-xl bg-[#1B5E9E] hover:bg-[#154a7d] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span>Descargar</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Si es PDF o documento */
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B5E9E] flex items-center justify-center text-xl shrink-0">
                            {esPdf(reporteSeleccionado.evidencia_url) ? "📄" : "📎"}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {esPdf(reporteSeleccionado.evidencia_url) ? "Documento PDF de Evidencia" : "Archivo de Evidencia Adjunto"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Custodiado bajo código de seguridad SafeVoice
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <a
                            href={getEvidenciaUrl(reporteSeleccionado.evidencia_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Abrir archivo</span>
                          </a>
                          <a
                            href={getEvidenciaUrl(reporteSeleccionado.evidencia_url)}
                            download
                            className="px-3 py-1.5 rounded-xl bg-[#1B5E9E] hover:bg-[#154a7d] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Descargar</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs text-slate-400 italic flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Sin archivos de evidencia adjuntos en este reporte.</span>
                  </div>
                )}
              </div>

              {/* Datos de contacto (si el estudiante decidió identificarse) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Datos de contacto del estudiante:
                </label>
                {reporteSeleccionado.nombre_contacto_victima || reporteSeleccionado.medio_contacto_victima ? (
                  <div className="grid grid-cols-2 gap-3 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs">
                    <div>
                      <p className="text-emerald-700/80 font-bold uppercase text-[10px]">Nombre</p>
                      <p className="font-bold text-slate-800 break-words mt-0.5">
                        {reporteSeleccionado.nombre_contacto_victima || "No indicado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700/80 font-bold uppercase text-[10px]">Medio de contacto</p>
                      <p className="font-bold text-slate-800 break-words mt-0.5">
                        {reporteSeleccionado.medio_contacto_victima || "No indicado"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-500 italic">
                    El estudiante prefirió mantener el reporte 100% anónimo (no suministró nombre ni medio de contacto).
                  </div>
                )}
              </div>

              {/* ASISTENTE LEGAL Y PROTOCOLO LEY 1620 (CHECKLIST SEGÚN GRAVEDAD) */}
              <AsistenteLegalLey1620
                reporte={reporteSeleccionado}
                recomendaciones={recomendaciones}
                rutaExternaInfo={rutaExternaInfo}
                onCopiarNotas={(texto) => {
                  setFormDataModal((prev) => ({
                    ...prev,
                    notas_orientador: prev.notas_orientador
                      ? `${prev.notas_orientador}\n\n${texto}`
                      : texto,
                  }));
                }}
                onAbrirRemisionExterna={() => setMostrarRemisionExterna(true)}
              />

              {/* SEMÁFORO DE CONVIVENCIA Y CHEQUEOS POST-CIERRE (15, 30 Y 60 DÍAS) */}
              {(normalizarEstado(reporteSeleccionado.estado) === "cerrado" ||
                (reporteSeleccionado.historial_cambios || []).some(
                  (c) =>
                    c.tipo_accion === "CHEQUEO_POST_CIERRE" ||
                    c.tipo_accion === "REACTIVACION_REINCIDENCIA"
                )) && (
                <ModuloSemaforoPostCierre
                  reporte={reporteSeleccionado}
                  onChequeoRegistrado={handleChequeoRegistrado}
                />
              )}

              {/* Alertas de éxito o error */}
              {mensajeExito && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fade-in">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{mensajeExito}</span>
                </div>
              )}

              {errorGuardar && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-800 animate-fade-in">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errorGuardar}</span>
                </div>
              )}

              {/* Selector Estado del Reporte */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="selector-estado" className="block text-xs font-bold text-slate-700">
                    Estado del Reporte:
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getColorEstado(
                      reporteSeleccionado.estado
                    )}`}
                  >
                    Actual: {getNombreEstado(reporteSeleccionado.estado)}
                  </span>
                </div>

                {(() => {
                  const estadoActual = normalizarEstado(reporteSeleccionado.estado);
                  const permitidos = TRANSICIONES_PERMITIDAS[estadoActual] || [];

                  return (
                    <>
                      <select
                        id="selector-estado"
                        value={formDataModal.estado}
                        onChange={(e) => {
                          setFormDataModal({ ...formDataModal, estado: e.target.value });
                          setErrorGuardar(null);
                        }}
                        disabled={permitidos.length === 0}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E] disabled:opacity-60 cursor-pointer"
                      >
                        {/* Estado actual */}
                        <option value={estadoActual}>
                          {getNombreEstado(estadoActual)} — (Estado actual)
                        </option>

                        {/* Opciones disponibles según transiciones permitidas */}
                        {Object.keys(ESTADOS_CONFIG).map((clave) => {
                          if (clave === estadoActual) return null;
                          const esPermitido = permitidos.includes(clave);
                          return (
                            <option key={clave} value={clave} disabled={!esPermitido}>
                              {getNombreEstado(clave)} — {ESTADOS_CONFIG[clave].subtext}{" "}
                              {!esPermitido ? "(No permitido)" : ""}
                            </option>
                          );
                        })}
                      </select>

                      {permitidos.length === 0 && (
                        <p className="text-[11px] text-slate-500 italic mt-1">
                          El reporte está en estado cerrado y no admite más transiciones.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Campo de texto de notas / comentarios */}
              <div>
                <label htmlFor="notas-seguimiento" className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Seguimiento (Orientación / Dirección):
                </label>
                <textarea
                  id="notas-seguimiento"
                  rows="2"
                  value={formDataModal.notas_orientador}
                  onChange={(e) => setFormDataModal({ ...formDataModal, notas_orientador: e.target.value })}
                  placeholder="Escriba las acciones tomadas, compromisos o citaciones (opcional)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                />
              </div>

              {/* Botón Cambios del reporte */}
              <div>
                <button
                  id="btn-cambios-reporte"
                  type="button"
                  aria-expanded={mostrarHistorial}
                  aria-controls="panel-historial-cambios"
                  onClick={handleToggleHistorial}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-300 hover:border-[#1B5E9E] bg-white hover:bg-slate-50 text-slate-700 hover:text-[#1B5E9E] text-xs font-bold transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B5E9E]"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-slate-500 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Cambios del reporte</span>
                    {historial.length > 0 && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {historial.length}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      mostrarHistorial ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Panel de Línea de Tiempo de Cambios (Estilo GitHub issue timeline) */}
              {mostrarHistorial && (
                <div
                  id="panel-historial-cambios"
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Línea de tiempo de cambios
                    </h4>
                    {cargandoHistorial && (
                      <span className="text-[10px] text-slate-400 font-semibold animate-pulse">
                        Cargando...
                      </span>
                    )}
                  </div>

                  {cargandoHistorial ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      Cargando historial de cambios...
                    </div>
                  ) : historial.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium italic">
                      Sin cambios de estado todavía
                    </div>
                  ) : (
                    <div className="relative pl-6 pt-1 space-y-4">
                      {/* Línea vertical conectora continua */}
                      <div
                        className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />

                      {historial.map((cambio, idx) => (
                        <div key={idx} className="relative text-xs">
                          {/* Ícono de evento sobre la línea */}
                          <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-[#1B5E9E] text-[#1B5E9E] flex items-center justify-center shadow-2xs z-10">
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </div>

                          {/* Fila del evento */}
                          <div className="flex flex-wrap items-baseline gap-1.5 text-slate-700 leading-relaxed">
                            <span className="font-extrabold text-slate-900">
                              {cambio.usuario_nombre || cambio.nombre_orientador || "Orientador"}
                            </span>
                            <span className="text-slate-500">cambió el estado de</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getColorEstado(
                                cambio.estado_anterior
                              )}`}
                            >
                              {getNombreEstado(cambio.estado_anterior)}
                            </span>
                            <span className="text-slate-500">a</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getColorEstado(
                                cambio.estado_nuevo
                              )}`}
                            >
                              {getNombreEstado(cambio.estado_nuevo)}
                            </span>
                            <span
                              className="text-[11px] text-slate-400 font-medium ml-auto"
                              title={formatearFechaCompleta(cambio.fecha_cambio || cambio.fecha)}
                            >
                              {formatearFechaLocal(cambio.fecha_cambio || cambio.fecha)}
                            </span>
                          </div>

                          {/* Comentario secundario si existe */}
                          {cambio.comentario && (
                            <div className="mt-1.5 bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-600 text-xs italic shadow-2xs">
                              "{cambio.comentario}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Modal */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarActa(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#1B5E9E] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  title="Generar documento formal con membrete y tipología Ley 1620 para imprimir o guardar como PDF"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Generar Acta Oficial (PDF)</span>
                </button>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setReporteSeleccionado(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      guardando ||
                      (normalizarEstado(formDataModal.estado) === normalizarEstado(reporteSeleccionado.estado) &&
                        !formDataModal.notas_orientador.trim())
                    }
                    className="px-5 py-2.5 rounded-xl bg-[#2C5F57] hover:bg-[#234b44] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardando
                      ? "Guardando..."
                      : normalizarEstado(formDataModal.estado) !== normalizarEstado(reporteSeleccionado.estado)
                      ? "Guardar Cambios"
                      : "Guardar Nota de Seguimiento"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REMISIÓN EXTERNA URGENTE (LEY 1620 - TIPO III) */}
      {mostrarRemisionExterna && reporteSeleccionado && (
        <ModalRemisionExterna
          reporte={reporteSeleccionado}
          onClose={() => setMostrarRemisionExterna(false)}
          onConfirmarActivacion={handleConfirmarActivacionRuta}
        />
      )}

      {/* MODAL DE ACTA OFICIAL PARA IMPRESIÓN Y PDF */}
      {mostrarActa && reporteSeleccionado && (
        <ModalActaOficial
          reporte={reporteSeleccionado}
          historial={historial}
          recomendaciones={recomendaciones}
          rutaExternaInfo={rutaExternaInfo}
          onClose={() => setMostrarActa(false)}
        />
      )}

    </div>
  );
}
