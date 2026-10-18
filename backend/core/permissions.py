"""
core/permissions.py — Permisos base reutilizables en todas las apps.

Proporciona clases de permiso genéricas que las apps (users, reports)
pueden extender o componer sin duplicar lógica.
"""

from rest_framework.permissions import BasePermission

from apps.users.models import Usuario


class IsDirectivo(BasePermission):
    """
    Permite el acceso a usuarios autenticados con rol DIRECTIVO u ORIENTADOR (unificados).
    """

    message = "Solo el personal autorizado puede realizar esta acción."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol in (
                Usuario.RolUsuario.DIRECTIVO,
                Usuario.RolUsuario.ORIENTADOR,
            )
        )


# Alias en español para mantener compatibilidad con las views existentes.
EsDirectivo = IsDirectivo


class EsOrientador(BasePermission):
    """
    Permite el acceso a usuarios autenticados con rol ORIENTADOR o DIRECTIVO (unificados).
    """

    message = "Solo el personal autorizado puede realizar esta acción."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol in (
                Usuario.RolUsuario.DIRECTIVO,
                Usuario.RolUsuario.ORIENTADOR,
            )
        )


class EsDirectivoOOrientador(BasePermission):
    """
    Permite el acceso a usuarios autenticados con rol DIRECTIVO u ORIENTADOR.
    """

    message = "Solo el personal autorizado puede realizar esta acción."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol in (
                Usuario.RolUsuario.DIRECTIVO,
                Usuario.RolUsuario.ORIENTADOR,
            )
        )
