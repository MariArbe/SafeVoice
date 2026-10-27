"""
apps/reports/urls.py — Rutas de la app reports.
"""

from django.urls import path, re_path

from .views import (
    ActualizarClasificacionReporteView,
    ActualizarEstadoReporteView,
    ConsultarReporteView,
    CrearReporteView,
    ExportarReportesCSVView,
    HeatmapView,
    HistorialReporteView,
    ListarReportesView,
    RecomendacionesReporteView,
    RegistrarChequeoPostCierreView,
    RegistrarSeguimientoReporteView,
    StatisticsOverviewView,
    SubirEvidenciaView,
)

app_name = "reports"

urlpatterns = [
    # Creación anónima de reporte (POST) y listado para staff (GET)
    path("", CrearReporteView.as_view(), name="crear-reporte"),
    path("evidencia/", SubirEvidenciaView.as_view(), name="subir-evidencia"),
    path("listar/", ListarReportesView.as_view(), name="listar-reportes"),
    path("exportar/csv/", ExportarReportesCSVView.as_view(), name="exportar-csv"),
    path("statistics/", StatisticsOverviewView.as_view(), name="statistics"),
    path("heatmap/", HeatmapView.as_view(), name="heatmap"),

    # Consulta anónima de estado por código de seguimiento
    path("consultar/", ConsultarReporteView.as_view(), name="consultar-reporte"),

    # Gestión de reporte: estado, clasificación manual/IA, historial (HU-08) y recomendaciones (HU-15)
    re_path(r"^(?P<reporte_id>[^/]+)/estado/?$", ActualizarEstadoReporteView.as_view(), name="actualizar-estado"),
    re_path(r"^(?P<reporte_id>[^/]+)/clasificacion/?$", ActualizarClasificacionReporteView.as_view(), name="actualizar-clasificacion"),
    re_path(r"^(?P<reporte_id>[^/]+)/historial/?$", HistorialReporteView.as_view(), name="historial-reporte"),
    re_path(r"^(?P<reporte_id>[^/]+)/seguimiento/?$", RegistrarSeguimientoReporteView.as_view(), name="registrar-seguimiento"),
    re_path(r"^(?P<reporte_id>[^/]+)/chequeo-post-cierre/?$", RegistrarChequeoPostCierreView.as_view(), name="chequeo-post-cierre"),
    re_path(r"^(?P<reporte_id>[^/]+)/recomendaciones/?$", RecomendacionesReporteView.as_view(), name="recomendaciones-reporte"),
]
