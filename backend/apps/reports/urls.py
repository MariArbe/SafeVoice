"""
apps/reports/urls.py — Rutas de la app reports.
"""

from django.urls import path, re_path

from .views import (
    ActualizarEstadoReporteView,
    ConsultarReporteView,
    CrearReporteView,
    HeatmapView,
    HistorialReporteView,
    ListarReportesView,
    StatisticsOverviewView,
)

app_name = "reports"

urlpatterns = [
    # Creación anónima de reporte (POST) y listado para staff (GET)
    path("", CrearReporteView.as_view(), name="crear-reporte"),
    path("listar/", ListarReportesView.as_view(), name="listar-reportes"),
    path("statistics/", StatisticsOverviewView.as_view(), name="statistics"),
    path("heatmap/", HeatmapView.as_view(), name="heatmap"),

    # Consulta anónima de estado por código de seguimiento
    path("consultar/", ConsultarReporteView.as_view(), name="consultar-reporte"),

    # Actualización de estado e historial de cambios de un reporte (HU-08)
    re_path(r"^(?P<reporte_id>[^/]+)/estado/?$", ActualizarEstadoReporteView.as_view(), name="actualizar-estado"),
    re_path(r"^(?P<reporte_id>[^/]+)/historial/?$", HistorialReporteView.as_view(), name="historial-reporte"),
]
