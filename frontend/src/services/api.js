import axios from "axios";

// Para desarrollo local, la URL por defecto será la de Django (8000)
// En producción, debería tomarse de variables de entorno, ej. import.meta.env.VITE_API_URL
const API_URL = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
