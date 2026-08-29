"""
apps/users/permissions.py — Permisos específicos del dominio de usuarios.

Importa y reexporta los permisos globales de core/ para que los imports
dentro de la app sean internos, y añade permisos específicos de este dominio.
"""

# Reexportar permisos globales como conveniencia para esta app
from core.permissions import (  # noqa: F401
    EsDirectivo,
    EsDirectivoOOrientador,
    EsOrientador,
)
from rest_framework.permissions import BasePermission


class EsPropietario(BasePermission):
    """
    Permite que un usuario acceda únicamente a sus propios recursos.
    Útil para endpoints como /users/{id}/change-password/

    Requiere que el objeto tenga un atributo que apunte al usuario propietario.
    """

    message = "No tienes permiso para acceder a los datos de otro usuario."

    def has_object_permission(self, request, view, obj) -> bool:
        # El objeto es el propio usuario
        if isinstance(obj, request.user.__class__):
            return obj == request.user
        # El objeto tiene un campo 'usuario' que apunta al propietario
        return getattr(obj, "usuario", None) == request.user
