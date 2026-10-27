import api from "./api";

const reporteService = {
  /**
   * Envía un nuevo reporte anónimo al backend.
   * @param {Object} datos - Los datos del formulario de reporte
   * @returns {Promise<Object>} - La respuesta del backend (ej. código de seguimiento)
   */
  crearReporte: async (datos) => {
    try {
      const response = await api.post("/reports/", datos);
      return response.data;
    } catch (error) {
      console.error("Error al crear el reporte:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de reportes para el docente/orientador (paginado y filtrado).
   */
  listarReportes: async (params = {}) => {
    try {
      const response = await api.get("/reports/listar/", { params });
      return response.data;
    } catch (error) {
      console.error("Error al listar reportes:", error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de un reporte (HU-08).
   * @param {number|string} reporteId - ID (PK) o código de seguimiento del reporte a actualizar
   * @param {Object} datos - { estado / nuevo_estado, notas_orientador / comentario }
   * @returns {Promise<Object>} - El reporte actualizado
   */
  actualizarReporte: async (reporteId, datos) => {
    try {
      const response = await api.patch(`/reports/${reporteId}/estado/`, {
        nuevo_estado: datos.nuevo_estado || datos.estado,
        comentario: datos.comentario || datos.notas_orientador || "",
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el estado del reporte:", error);
      throw error;
    }
  },

  /**
   * Confirma o modifica manualmente el nivel de riesgo (gravedad) predicho por la IA
   * y/o los tipos de agresión asociados al reporte.
   * @param {number|string} reporteId - ID (PK) o código de seguimiento del reporte
   * @param {Object} datos - { nivel_riesgo_confirmado, confirmar_ia, tipos_agresion, comentario }
   * @returns {Promise<Object>} - El reporte actualizado
   */
  actualizarClasificacion: async (reporteId, datos) => {
    try {
      const response = await api.patch(`/reports/${reporteId}/clasificacion/`, datos);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar la clasificación del reporte:", error);
      throw error;
    }
  },

  /**
   * Registra una nota de seguimiento, intervención o activación de Ruta Externa
   * sin requerir forzosamente un cambio de estado en el reporte (Ley 1620).
   * @param {number|string} reporteId - ID o código de seguimiento
   * @param {Object} datos - { comentario, tipo_accion, metadata }
   * @returns {Promise<Object>}
   */
  registrarSeguimiento: async (reporteId, datos) => {
    try {
      const response = await api.post(`/reports/${reporteId}/seguimiento/`, {
        comentario: datos.comentario || datos.observaciones || "",
        tipo_accion: datos.tipo_accion || "NOTA_SEGUIMIENTO",
        metadata: datos.metadata || {},
      });
      return response.data;
    } catch (error) {
      console.error("Error al registrar seguimiento del reporte:", error);
      throw error;
    }
  },

  /**
   * Registra un chequeo de seguimiento longitudinal post-cierre (15, 30 o 60 días)
   * con semáforo de convivencia (VERDE, AMARILLO, ROJO) y reactivación opcional por reincidencia.
   * @param {number|string} reporteId - ID o código de seguimiento
   * @param {Object} datos - { hito: 'DIA_15'|'DIA_30'|'DIA_60', semaforo: 'VERDE'|'AMARILLO'|'ROJO', observaciones, reactivar_caso }
   * @returns {Promise<Object>}
   */
  registrarChequeoPostCierre: async (reporteId, datos) => {
    try {
      const response = await api.post(`/reports/${reporteId}/chequeo-post-cierre/`, {
        hito: datos.hito,
        semaforo: datos.semaforo,
        observaciones: datos.observaciones || "",
        reactivar_caso: !!datos.reactivar_caso,
      });
      return response.data;
    } catch (error) {
      console.error("Error al registrar chequeo post-cierre:", error);
      throw error;
    }
  },

  /**
   * Obtiene el historial cronológico de cambios de estado del reporte (HU-08).
   * @param {number|string} reporteId - ID o código de seguimiento del reporte
   * @returns {Promise<Array>} - Lista de cambios ordenada de más reciente a más antiguo
   */
  obtenerHistorial: async (reporteId) => {
    try {
      const response = await api.get(`/reports/${reporteId}/historial/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener historial del reporte:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas agregadas de la institución (HU-13).
   */
  obtenerEstadisticas: async (params = {}) => {
    try {
      const response = await api.get("/reports/statistics/", { params });
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    }
  },

  /**
   * Obtiene datos para el mapa de calor por zonas (HU-14).
   */
  obtenerMapaCalor: async (params = {}) => {
    try {
      const response = await api.get("/reports/heatmap/", { params });
      return response.data;
    } catch (error) {
      console.error("Error al obtener mapa de calor:", error);
      throw error;
    }
  },

  /**
   * Obtiene recomendaciones automáticas de intervención y protocolos (HU-15).
   * @param {number|string} reporteId - ID o código de seguimiento del reporte
   * @returns {Promise<Object>} - Protocolo, acciones clave, medidas específicas y líneas de ayuda
   */
  obtenerRecomendaciones: async (reporteId) => {
    try {
      const response = await api.get(`/reports/${reporteId}/recomendaciones/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener recomendaciones de intervención:", error);
      throw error;
    }
  },

  /**
   * Consulta pública y anónima del estado de un reporte por su código UUID (HU-04).
   * @param {string} codigo - Código UUID de seguimiento entregado al reportante
   * @returns {Promise<Object>} - Datos de estado, riesgo e historial de seguimiento del reporte
   */
  consultarReporte: async (codigo) => {
    try {
      const cleanCodigo = String(codigo || "").trim();
      const response = await api.get("/reports/consultar/", {
        params: { codigo_seguimiento: cleanCodigo },
      });
      return response.data;
    } catch (error) {
      console.error("Error al consultar el reporte por código:", error);
      throw error;
    }
  },

  /**
   * Exporta los reportes a archivo CSV con formato compatible con Microsoft Excel y SIUCE.
   * @param {Object} params - Filtros aplicados (riesgo, estado, ubicacion, fechas)
   * @param {Array} fallbackData - Datos locales de contingencia si la API falla
   */
  exportarReportesCSV: async (params = {}, fallbackData = []) => {
    try {
      const response = await api.get("/reports/exportar/csv/", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      const fecha = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `reportes_convivencia_${fecha}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.warn("Fallo endpoint backend CSV, generando exportación desde datos locales:", error);
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        // Fallback en cliente
        const headers = [
          "Código de Seguimiento",
          "Fecha Radicación",
          "Nivel Riesgo",
          "Estado Actual",
          "Ubicación",
          "Grado",
          "Contacto Víctima",
        ];
        const rows = fallbackData.map((r) => [
          r.codigo_seguimiento || "",
          r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleString("es-CO") : "",
          r.nivel_riesgo_confirmado || r.nivel_riesgo_predicho || "",
          r.estado || "",
          r.ubicacion || "",
          r.grado_victima || "",
          r.nombre_contacto_victima ? `${r.nombre_contacto_victima} (${r.medio_contacto_victima || ""})` : "Anónimo",
        ]);
        const csvContent =
          "\ufeff" +
          [headers.join(";"), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fecha = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `reportes_convivencia_${fecha}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return true;
      }
      throw error;
    }
  },

  /**
   * Sube un archivo de evidencia anónima al servidor.
   * @param {File} archivo - Archivo a subir
   * @returns {Promise<Object>} - { evidencia_url, nombre_archivo, tamano }
   */
  subirEvidencia: async (archivo) => {
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const response = await api.post("/reports/evidencia/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al subir evidencia:", error);
      throw error;
    }
  },
};

export default reporteService;
