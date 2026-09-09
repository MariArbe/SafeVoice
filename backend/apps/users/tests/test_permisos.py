"""
tests/test_permisos.py — Tests de control de acceso por rol.

Cubre:
  - Orientador no puede acceder a rutas exclusivas de directivo.
  - Directivo no puede acceder a rutas exclusivas de orientador (si aplica).
  - Sin token → 401 en endpoints protegidos.
  - Token válido con rol correcto → acceso permitido.
"""

import pytest

CREAR_USUARIO_URL = "/api/v1/users/"
ME_URL = "/api/v1/users/me/"


@pytest.mark.django_db
class TestAccesoSinAutenticacion:
    """Endpoints protegidos rechazan requests sin token JWT."""

    def test_me_sin_token_devuelve_401(self, api_client):
        response = api_client.get(ME_URL)
        assert response.status_code == 401

    def test_crear_usuario_sin_token_devuelve_401(self, api_client):
        response = api_client.post(CREAR_USUARIO_URL, {}, format="json")
        assert response.status_code == 401


@pytest.mark.django_db
class TestControlAccesoPorRol:
    """Solo el directivo puede crear usuarios."""

    def test_orientador_no_puede_crear_usuarios(self, cliente_orientador):
        """HU-09: El orientador no tiene permisos de gestión de usuarios."""
        payload = {
            "email": "nuevo@colegio.edu.co",
            "first_name": "Nuevo",
            "last_name": "Usuario",
            "rol": "ORIENTADOR",
            "password": "SeguraPass123!",
            "password_confirmacion": "SeguraPass123!",
        }
        response = cliente_orientador.post(CREAR_USUARIO_URL, payload, format="json")
        assert response.status_code == 403

    def test_directivo_puede_acceder_a_crear_usuarios(
        self, cliente_directivo, institucion
    ):
        """HU-10: El directivo tiene permiso para el endpoint de creación."""
        payload = {
            "email": "nuevo.orientador@colegio.edu.co",
            "first_name": "Nuevo",
            "last_name": "Orientador",
            "rol": "ORIENTADOR",
            "password": "SeguraPass123!",
            "password_confirmacion": "SeguraPass123!",
        }
        response = cliente_directivo.post(CREAR_USUARIO_URL, payload, format="json")
        # 201 (creado) o 400 (validación), pero NO 401 ni 403
        assert response.status_code not in (401, 403)


@pytest.mark.django_db
class TestRespuestasError:
    """Formato de las respuestas de error de control de acceso."""

    def test_401_tiene_campo_error(self, api_client):
        """El handler global de excepciones formatea correctamente el 401."""
        response = api_client.get(ME_URL)
        data = response.json()
        # El handler de core/exceptions.py envuelve en {"error": {...}}
        assert "error" in data

    def test_403_tiene_campo_error(self, cliente_orientador):
        """El 403 de permiso denegado también sigue el esquema estándar."""
        response = cliente_orientador.post(CREAR_USUARIO_URL, {}, format="json")
        data = response.json()
        assert "error" in data
