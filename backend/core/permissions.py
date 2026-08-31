"""
core/permissions.py — Permisos base reutilizables en todas las apps.

Proporciona clases de permiso genéricas que las apps (users, reports)
pueden extender o componer sin duplicar lógica.
"""

from rest_framework.permissions import BasePermission

from apps.users.models import Usuario


class EsDirectivo(BasePermission):
    """
    Permite el acceso únicamente a usuarios autenticados con rol DIRECTIVO.
    """

    message = "Solo los directivos pueden realizar esta acción."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol == Usuario.RolUsuario.DIRECTIVO
        )


class EsOrientador(BasePermission):
    """
    Permite el acceso únicamente a usuarios autenticados con rol ORIENTADOR.
    """

    message = "Solo los orientadores pueden realizar esta acción."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol == Usuario.RolUsuario.ORIENTADOR
        )


class EsDirectivoOOrientador(BasePermission):
    """
    Permite el acceso a usuarios autenticados con rol DIRECTIVO u ORIENTADOR.
    Equivale a (EsDirectivo | EsOrientador) con un solo mensaje de error.
    """

    message = "Solo el personal autorizado (directivos u orientadores) puede realizar esta acción."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol in (
                Usuario.RolUsuario.DIRECTIVO,
                Usuario.RolUsuario.ORIENTADOR,
            )
        )
