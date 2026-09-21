import api from "./api";

const recursoService = {
  /**
   * Obtiene la lista de recursos de ayuda activos.
   * Opcionalmente se puede filtrar por categoría (ej. 'TELEFONO', 'WEB', 'PRESENCIAL').
   */
  listarRecursosPublicos: async (categoria = null) => {
    try {
      const params = categoria ? { categoria } : {};
      const response = await api.get("/resources/", { params });
      return response.data;
    } catch (error) {
      console.error("Error al obtener recursos:", error);
      throw error;
    }
  },
};

export default recursoService;
