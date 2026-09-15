import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inicio from "../pages/publico/Inicio";
import SeccionInformativa from "../pages/publico/SeccionInformativa";
import ContactosRecursos from "../pages/publico/ContactosRecursos";
import LineasAyuda from "../pages/publico/LineasAyuda";
import Reporte from "../pages/publico/Reporte";

import Login from "../pages/docente/Login";
import SignUp from "../pages/docente/SignUp";
import MenuDocente from "../pages/docente/MenuDocente";
import Dashboard from "../pages/docente/Dashboard";
import BandejaReportes from "../pages/docente/BandejaReportes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Zona pública — estudiantes, sin login */}
        <Route path="/" element={<Inicio />} />
        <Route path="/informacion" element={<SeccionInformativa />} />
        <Route path="/contactos" element={<ContactosRecursos />} />
        <Route path="/lineas-ayuda" element={<LineasAyuda />} />
        <Route path="/reporte" element={<Reporte />} />

        {/* Zona docente */}
        <Route path="/docente/login" element={<Login />} />
        <Route path="/docente/registro" element={<SignUp />} />
        <Route path="/docente/menu" element={<MenuDocente />} />
        <Route path="/docente/dashboard" element={<Dashboard />} />
        <Route path="/docente/reportes" element={<BandejaReportes />} />

        <Route path="*" element={<p>Página no encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}