/**
 * Utilidades de gestión de autenticación y sesión en el frontend.
 */

/**
 * Decodifica de forma segura la fecha de expiración de un token JWT.
 * @param {string} token - Token JWT
 * @returns {boolean} - true si el token está expirado o malformado, false si sigue vigente
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Decodificar Base64Url estándar de JWT
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;

    // Comparar expiración (exp en segundos vs Date.now en milisegundos)
    return payload.exp * 1000 < Date.now();
  } catch (err) {
    console.error("Error al verificar expiración del token:", err);
    return true;
  }
}

/**
 * Cierra la sesión activa eliminando tokens y datos de usuario de localStorage.
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

/**
 * Obtiene el token de acceso actual.
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem("token");
}

/**
 * Obtiene el objeto de datos del usuario autenticado guardado en el login.
 * @returns {Object|null}
 */
export function getUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Valida si existe una sesión activa y no expirada.
 * Si el token existe pero ya expiró, limpia la sesión y retorna false.
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  if (isTokenExpired(token)) {
    logout();
    return false;
  }

  return true;
}
