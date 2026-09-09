"""
apps/institutions/admin.py — Registro del modelo Institution en el admin de Django.
"""

from django.contrib import admin

from .models import Institution


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    """Panel de administración para instituciones educativas."""

    list_display = ("nombre", "codigo_dane", "ciudad", "is_active", "fecha_creacion")
    list_filter = ("is_active", "ciudad")
    search_fields = ("nombre", "codigo_dane", "ciudad")
    ordering = ("nombre",)
    readonly_fields = ("fecha_creacion",)

    fieldsets = (
        (
            "Información de la institución",
            {"fields": ("nombre", "codigo_dane", "ciudad")},
        ),
        (
            "Estado",
            {"fields": ("is_active", "fecha_creacion")},
        ),
    )
