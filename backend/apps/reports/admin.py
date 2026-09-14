"""
apps/reports/admin.py — Registro del modelo Reporte en el panel de administración.
"""

from django.contrib import admin

from .models import Reporte


@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    """
    Panel de admin para Reporte.

    NOTA: El admin solo debe usarse para consulta y gestión por staff.
    No se permite edición del codigo_seguimiento ni de fechas automáticas.
    """

    list_display = ("codigo_seguimiento", "fecha_creacion", "fecha_actualizacion")
    list_filter = ("fecha_creacion",)
    search_fields = ("codigo_seguimiento",)
    readonly_fields = ("codigo_seguimiento", "fecha_creacion", "fecha_actualizacion")
    ordering = ("-fecha_creacion",)

    def has_add_permission(self, request) -> bool:
        """Los reportes solo se crean via API anónima, nunca desde el admin."""
        return False
