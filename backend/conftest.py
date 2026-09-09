"""
conftest.py — Fixtures de pytest compartidos en todo el proyecto backend.

Convención de nombres:
  - Los fixtures que crean objetos en BD tienen el prefijo 'db_' o son
    funciones que reciben 'db' implícitamente vía `pytest.mark.django_db`.
  - El cliente HTTP autenticado usa el prefijo 'cliente_'.
"""

import pytest
from django.test import Client

from apps.institutions.models import Institution
from apps.users.models import Usuario


# ── Fixtures de dominio ──────────────────────────────────────────────────────

@pytest.fixture
def institucion(db) -> Institution:
    """Institución educativa de prueba."""
    return Institution.objects.create(
        nombre="Colegio de Prueba",
        codigo_dane="900000001-0",
        ciudad="Bogotá",
    )


@pytest.fixture
def institucion_secundaria(db) -> Institution:
    """Segunda institución, para tests de aislamiento de datos."""
    return Institution.objects.create(
        nombre="Instituto Secundario",
        codigo_dane="900000002-0",
        ciudad="Medellín",
    )


@pytest.fixture
def usuario_directivo(db, institucion) -> Usuario:
    """Usuario con rol DIRECTIVO, asociado a `institucion`."""
    usuario = Usuario(
        email="directivo@colegio.edu.co",
        username="directivo@colegio.edu.co",
        first_name="Carlos",
        last_name="Director",
        rol=Usuario.RolUsuario.DIRECTIVO,
        institution=institucion,
    )
    usuario.set_password("Password123!")
    usuario.save()
    return usuario


@pytest.fixture
def usuario_orientador(db, institucion) -> Usuario:
    """Usuario con rol ORIENTADOR, asociado a `institucion`."""
    usuario = Usuario(
        email="orientador@colegio.edu.co",
        username="orientador@colegio.edu.co",
        first_name="Ana",
        last_name="Orientadora",
        rol=Usuario.RolUsuario.ORIENTADOR,
        institution=institucion,
    )
    usuario.set_password("Password123!")
    usuario.save()
    return usuario


@pytest.fixture
def usuario_inactivo(db, institucion) -> Usuario:
    """Usuario desactivado — para tests de login de cuenta inactiva."""
    usuario = Usuario(
        email="inactivo@colegio.edu.co",
        username="inactivo@colegio.edu.co",
        rol=Usuario.RolUsuario.DIRECTIVO,
        institution=institucion,
        is_active=False,
    )
    usuario.set_password("Password123!")
    usuario.save()
    return usuario


# ── Fixtures de cliente HTTP ─────────────────────────────────────────────────

@pytest.fixture
def api_client():
    """Cliente HTTP sin autenticación (para endpoints públicos)."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def cliente_directivo(api_client, usuario_directivo):
    """Cliente HTTP autenticado como directivo (JWT Bearer token)."""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(usuario_directivo)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return api_client


@pytest.fixture
def cliente_orientador(api_client, usuario_orientador):
    """Cliente HTTP autenticado como orientador (JWT Bearer token)."""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(usuario_orientador)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return api_client
