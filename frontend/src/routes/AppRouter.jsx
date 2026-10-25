import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inicio from "../pages/publico/Inicio";
import SeccionInformativa from "../pages/publico/SeccionInformativa";
import ContactosRecursos from "../pages/publico/ContactosRecursos";
import LineasAyuda from "../pages/publico/LineasAyuda";
import Reporte from "../pages/publico/Reporte";
import ConsultarReporte from "../pages/publico/ConsultarReporte";
import PaginaNoEncontrada from "../pages/publico/PaginaNoEncontrada";

import Login from "../pages/docente/Login";
import SignUp from "../pages/docente/SignUp";
import MenuDocente from "../pages/docente/MenuDocente";
import Dashboard from "../pages/docente/Dashboard";
import BandejaReportes from "../pages/docente/BandejaReportes";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Zona pública — estudiantes y visitantes, sin login */}
        <Route path="/" element={<Inicio />} />
        <Route path="/informacion" element={<SeccionInformativa />} />
        <Route path="/contactos" element={<ContactosRecursos />} />
        <Route path="/lineas-ayuda" element={<LineasAyuda />} />
        <Route path="/reporte" element={<Reporte />} />
        <Route path="/reportar" element={<Reporte />} />
        <Route path="/consultar" element={<ConsultarReporte />} />
        <Route path="/consultar-reporte" element={<ConsultarReporte />} />

        {/* Zona pública docente — acceso y registro */}
        <Route path="/docente/login" element={<Login />} />
        <Route path="/docente/registro" element={<SignUp />} />

        {/* Zona protegida del orientador/docente — requiere inicio de sesión */}
        <Route element={<ProtectedRoute />}>
          <Route path="/docente/menu" element={<MenuDocente />} />
          <Route path="/docente/dashboard" element={<Dashboard />} />
          <Route path="/docente/reportes" element={<BandejaReportes />} />
          <Route path="/docente/bandeja" element={<BandejaReportes />} />
          <Route path="/docente/casos" element={<BandejaReportes />} />
        </Route>

        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
