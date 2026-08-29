"""
apps/users/admin.py — Registro del modelo Usuario en el panel de administración.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Personaliza el panel de admin para el modelo Usuario extendido.
    Añade el campo 'rol' a las secciones del formulario de edición.
    """

    # Columnas visibles en el listado
    list_display = ("email", "first_name", "last_name", "rol", "is_active", "date_joined")
    list_filter = ("rol", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)

    # Añadir 'rol' a los fieldsets del formulario de edición
    fieldsets = UserAdmin.fieldsets + (
        ("Rol SafeVoice", {"fields": ("rol",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Rol SafeVoice", {"fields": ("rol",)}),
    )
