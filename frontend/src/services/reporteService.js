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
};

export default reporteService;
