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
};

export default reporteService;

