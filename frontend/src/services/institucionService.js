import api from "./api";

const institucionService = {
  /**
   * Obtiene el catálogo público de instituciones educativas activas.
   * Retorna una lista con { id, nombre, ciudad }.
   */
  listarInstitucionesActivas: async () => {
    try {
      const response = await api.get("/institutions/");
      return response.data;
    } catch (error) {
      console.error("Error al obtener catálogo de instituciones:", error);
      throw error;
    }
  },
};

export default institucionService;
