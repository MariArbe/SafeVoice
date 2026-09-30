import api from "./api";

/**
 * Servicio para consumir los endpoints del dominio de Usuarios.
 */
const userService = {
  /**
   * Envía los datos para crear/registrar un nuevo usuario (Directivo u Orientador).
   * @param {Object} userData - Datos del usuario ({ email, first_name, last_name, rol, password, password_confirmacion })
   * @returns {Promise<Object>} - Datos del usuario creado devueltos por el backend
   */
  crearUsuario: async (userData) => {
    const response = await api.post("/users/", userData);
    return response.data;
  },
};

export default userService;
