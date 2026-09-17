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
};

export default reporteService;
