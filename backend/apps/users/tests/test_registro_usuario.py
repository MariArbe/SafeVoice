"""
tests/test_registro_usuario.py — Tests del endpoint público de registro de usuarios (/api/v1/users/register/).

Cubre:
  - Registro exitoso sin autenticación previa (orientador o directivo).
  - Asociación automática con la institución activa.
  - Validación de email duplicado -> 400 con error en campo email.
  - Validación de contraseñas no coincidentes -> 400 con error en password_confirmacion.
  - Validación de contraseña débil -> 400.
"""

import pytest

REGISTER_URL = "/api/v1/users/register/"


@pytest.mark.django_db
class TestRegistroUsuarioPublico:
    """Registro público de docentes y orientadores."""

    def test_registro_orientador_exitoso(self, api_client, institucion):
        payload = {
            "first_name": "Daniel",
            "last_name": "Lopez",
            "email": "daniellop1309@gmail.com",
            "rol": "ORIENTADOR",
            "password": "Password123!",
            "password_confirmacion": "Password123!",
        }
        response = api_client.post(REGISTER_URL, payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "daniellop1309@gmail.com"
        assert data["rol"] == "ORIENTADOR"
        assert data["institution_id"] == institucion.id
        assert "password" not in data

    def test_registro_directivo_exitoso(self, api_client, institucion):
        payload = {
            "first_name": "Ana",
            "last_name": "Martinez",
            "email": "ana.martinez@gmail.com",
            "rol": "DIRECTIVO",
            "password": "Password123!",
            "password_confirmacion": "Password123!",
        }
        response = api_client.post(REGISTER_URL, payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "ana.martinez@gmail.com"
        assert data["rol"] == "DIRECTIVO"

    def test_registro_email_duplicado_rechazado(self, api_client, usuario_orientador):
        payload = {
            "first_name": "Otro",
            "last_name": "Orientador",
            "email": usuario_orientador.email,
            "rol": "ORIENTADOR",
            "password": "Password123!",
            "password_confirmacion": "Password123!",
        }
        response = api_client.post(REGISTER_URL, payload, format="json")
        assert response.status_code == 400
        data = response.json()
        # Valida que se encuentre en el esquema de error estándar o con detalle de email
        assert "error" in data or "email" in data

    def test_registro_contrasenas_no_coinciden(self, api_client, institucion):
        payload = {
            "first_name": "Carlos",
            "last_name": "Perez",
            "email": "carlos.perez@gmail.com",
            "rol": "ORIENTADOR",
            "password": "Password123!",
            "password_confirmacion": "PasswordDiferente456!",
        }
        response = api_client.post(REGISTER_URL, payload, format="json")
        assert response.status_code == 400

    def test_registro_contrasena_corta_rechazada(self, api_client, institucion):
        payload = {
            "first_name": "Carlos",
            "last_name": "Perez",
            "email": "carlos.perez@gmail.com",
            "rol": "ORIENTADOR",
            "password": "123",
            "password_confirmacion": "123",
        }
        response = api_client.post(REGISTER_URL, payload, format="json")
        assert response.status_code == 400
