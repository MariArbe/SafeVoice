import axios from "axios";

// Para desarrollo local, la URL por defecto será la de Django (8000)
// En producción, debería tomarse de variables de entorno, ej. import.meta.env.VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints públicos: no deben enviar el token, porque un token vencido o inválido
// hace que el backend responda 401 aunque el endpoint no requiera autenticación.
const PUBLIC_ENDPOINTS = ["/users/register/", "/users/login/"];

api.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));
    const token = localStorage.getItem("token");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: ante un 401 en endpoints protegidos, limpia la sesión y redirige
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublic = PUBLIC_ENDPOINTS.some((path) => error.config?.url?.includes(path));
    if (error.response?.status === 401 && !isPublic) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/docente/") &&
        !["/docente/login", "/docente/registro"].includes(window.location.pathname)
      ) {
        window.location.href = "/docente/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
