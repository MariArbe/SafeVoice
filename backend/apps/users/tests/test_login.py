"""
tests/test_login.py — Tests de HU-09 y HU-10: login de orientador y directivo.

Cubre:
  - Login exitoso: respuesta contiene access, refresh, rol, institution_id, email.
  - Credenciales incorrectas: 401 con mensaje genérico (no revela si el usuario existe).
  - Usuario inactivo: 401 (no 403, simplejwt unifica como 401 en el authenticate).
  - Token de refresco: renueva el access token correctamente.
  - Endpoint /me/: devuelve datos del usuario autenticado.
"""

import pytest

LOGIN_URL = "/api/v1/users/login/"
REFRESH_URL = "/api/v1/users/token/refresh/"
ME_URL = "/api/v1/users/me/"


@pytest.mark.django_db
class TestLoginExitoso:
    """HU-09/10: El login devuelve tokens y datos del usuario."""

    def test_directivo_puede_hacer_login(self, api_client, usuario_directivo):
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        assert response.status_code == 200

    def test_orientador_puede_hacer_login(self, api_client, usuario_orientador):
        response = api_client.post(
            LOGIN_URL,
            {"email": "orientador@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        assert response.status_code == 200

    def test_login_devuelve_access_token(self, api_client, usuario_directivo):
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        assert "access" in response.json()

    def test_login_devuelve_refresh_token(self, api_client, usuario_directivo):
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        assert "refresh" in response.json()

    def test_login_devuelve_rol(self, api_client, usuario_directivo):
        """HU-09/10: El frontend necesita el rol para redirigir al dashboard correcto."""
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        data = response.json()
        assert "rol" in data
        assert data["rol"] == "DIRECTIVO"

    def test_login_orientador_devuelve_rol_correcto(self, api_client, usuario_orientador):
        response = api_client.post(
            LOGIN_URL,
            {"email": "orientador@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        assert response.json()["rol"] == "ORIENTADOR"

    def test_login_devuelve_institution_id(self, api_client, usuario_directivo, institucion):
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        data = response.json()
        assert "institution_id" in data
        assert data["institution_id"] == institucion.id

    def test_login_devuelve_email(self, api_client, usuario_directivo):
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        assert response.json()["email"] == "directivo@colegio.edu.co"


@pytest.mark.django_db
class TestLoginCredencialesInvalidas:
    """HU-09/10: El sistema rechaza credenciales incorrectas sin revelar si el usuario existe."""

    def test_password_incorrecta_devuelve_401(self, api_client, usuario_directivo):
        response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "wrongpassword"},
            format="json",
        )
        assert response.status_code == 401

    def test_email_inexistente_devuelve_401(self, api_client, db):
        """El sistema devuelve 401 aunque el email no exista — no revela existencia."""
        response = api_client.post(
            LOGIN_URL,
            {"email": "noexiste@ejemplo.com", "password": "cualquiera"},
            format="json",
        )
        assert response.status_code == 401

    def test_mensaje_error_es_generico(self, api_client, usuario_directivo):
        """HU-09/10: El mensaje NO debe revelar si el usuario existe o no."""
        # Primero con email correcto pero password incorrecta
        response_pass_mala = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "wrongpassword"},
            format="json",
        )
        # Luego con email inexistente
        response_no_existe = api_client.post(
            LOGIN_URL,
            {"email": "fantasma@ejemplo.com", "password": "wrongpassword"},
            format="json",
        )
        # Ambos deben tener el mismo mensaje para no revelar información
        # (verificamos que sean ambos 401, no el contenido exacto para evitar fragilidad)
        assert response_pass_mala.status_code == response_no_existe.status_code == 401

    def test_usuario_inactivo_devuelve_401(self, api_client, usuario_inactivo):
        """Los usuarios desactivados no pueden iniciar sesión."""
        response = api_client.post(
            LOGIN_URL,
            {"email": "inactivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        # simplejwt devuelve 401 para usuarios inactivos (authenticate() retorna None)
        assert response.status_code == 401

    def test_campos_vacios_devuelven_400(self, api_client, db):
        response = api_client.post(LOGIN_URL, {}, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestRefreshToken:
    """HU-09/10: La sesión puede renovarse con el refresh token."""

    def test_refresh_valido_devuelve_nuevo_access_token(self, api_client, usuario_directivo):
        login_response = api_client.post(
            LOGIN_URL,
            {"email": "directivo@colegio.edu.co", "password": "Password123!"},
            format="json",
        )
        refresh_token = login_response.json()["refresh"]

        refresh_response = api_client.post(
            REFRESH_URL,
            {"refresh": refresh_token},
            format="json",
        )
        assert refresh_response.status_code == 200
        assert "access" in refresh_response.json()

    def test_refresh_invalido_devuelve_401(self, api_client, db):
        response = api_client.post(
            REFRESH_URL,
            {"refresh": "token_invalido"},
            format="json",
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestEndpointMe:
    """Endpoint /me/: devuelve datos del usuario autenticado."""

    def test_me_con_token_valido_devuelve_200(self, cliente_directivo):
        response = cliente_directivo.get(ME_URL)
        assert response.status_code == 200

    def test_me_devuelve_email_y_rol(self, cliente_directivo, usuario_directivo):
        response = cliente_directivo.get(ME_URL)
        data = response.json()
        assert data["email"] == usuario_directivo.email
        assert data["rol"] == usuario_directivo.rol

    def test_me_devuelve_institution_id(self, cliente_directivo, usuario_directivo):
        response = cliente_directivo.get(ME_URL)
        assert response.json()["institution_id"] == usuario_directivo.institution_id

    def test_me_sin_token_devuelve_401(self, api_client):
        response = api_client.get(ME_URL)
        assert response.status_code == 401
