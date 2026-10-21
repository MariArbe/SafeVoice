import { Navigate, useLocation, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

/**
 * Componente Guardián de Rutas (Route Guard).
 * Impide el acceso a las vistas de docentes y orientadores si el usuario
 * no ha iniciado sesión con un token JWT válido y no expirado.
 *
 * Si no está autenticado, redirige automáticamente a /docente/login
 * recordando la ubicación solicitada para retornar tras el inicio de sesión.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/docente/login" replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
}
