"""
apps/reports/admin.py — Registro del modelo Reporte en el panel de administración.
"""

from django.contrib import admin

from .models import Reporte, SeguimientoCaso


class SeguimientoCasoInline(admin.TabularInline):
    """Historial de cambios de estado, visible desde el detalle del reporte."""
    model = SeguimientoCaso
    extra = 0
    readonly_fields = ("estado_anterior", "estado_nuevo", "orientador", "observaciones", "fecha_atencion")
    can_delete = False

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    """
    Panel de admin para Reporte.

    NOTA: El admin solo debe usarse para consulta y gestión por staff.
    No se permite edición del codigo_seguimiento ni de fechas automáticas.
    """

    list_display = ("codigo_seguimiento", "estado", "fecha_creacion", "fecha_actualizacion")
    list_filter = ("estado", "fecha_creacion",)
    search_fields = ("codigo_seguimiento",)
    readonly_fields = ("codigo_seguimiento", "fecha_creacion", "fecha_actualizacion")
    ordering = ("-fecha_creacion",)
    inlines = [SeguimientoCasoInline]

    def has_add_permission(self, request) -> bool:
        """Los reportes solo se crean via API anónima, nunca desde el admin."""
        return False


@admin.register(SeguimientoCaso)
class SeguimientoCasoAdmin(admin.ModelAdmin):
    """Panel de admin para consultar el historial de auditoría de cambios de estado."""

    list_display = ("reporte", "estado_anterior", "estado_nuevo", "orientador", "fecha_atencion")
    list_filter = ("estado_nuevo", "fecha_atencion")
    readonly_fields = ("reporte", "estado_anterior", "estado_nuevo", "orientador", "observaciones", "fecha_atencion")
    ordering = ("-fecha_atencion",)

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False

