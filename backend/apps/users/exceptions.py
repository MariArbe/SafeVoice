"""
apps/users/exceptions.py — Excepciones específicas del dominio de usuarios.

Extienden APIException de DRF para que el handler global (core/exceptions.py)
las procese automáticamente y devuelva el esquema de error estándar.
"""

from rest_framework import status
from rest_framework.exceptions import APIException


class CredencialesInvalidasError(APIException):
    """
    Se lanza cuando las credenciales de login (email/contraseña) son incorrectas.
    Usa 401 en lugar del 400 genérico de DRF para ser semánticamente correcto.
    """
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Correo electrónico o contraseña incorrectos."
    default_code = "credenciales_invalidas"


class UsuarioInactivoError(APIException):
    """
    Se lanza cuando el usuario existe pero está desactivado (is_active=False).
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Esta cuenta de usuario está desactivada."
    default_code = "usuario_inactivo"


class RolNoPermitidoError(APIException):
    """
    Se lanza cuando un usuario intenta acceder a un recurso que no corresponde
    a su rol.
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "No tienes los permisos necesarios para esta acción."
    default_code = "rol_no_permitido"
