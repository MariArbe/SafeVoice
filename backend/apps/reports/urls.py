"""
apps/reports/urls.py — Rutas de la app reports.
"""

from django.urls import path

from .views import ConsultarReporteView, CrearReporteView, ListarReportesView

app_name = "reports"

urlpatterns = [
    # Creación anónima de reporte (POST) y listado para staff (GET)
    path("", CrearReporteView.as_view(), name="crear-reporte"),
    path("listar/", ListarReportesView.as_view(), name="listar-reportes"),

    # Consulta anónima de estado por código de seguimiento
    path("consultar/", ConsultarReporteView.as_view(), name="consultar-reporte"),
]
