"""
apps/institutions/exceptions.py — Excepciones específicas del dominio de instituciones.

Extienden APIException de DRF para que el handler global (core/exceptions.py)
las procese automáticamente y devuelva el esquema de error estándar.
"""

from rest_framework import status
from rest_framework.exceptions import APIException


class InstitucionDuplicadaError(APIException):
    """
    Se lanza cuando ya existe una institución registrada con el mismo NIT/código.
    Usa 409 Conflict para indicar que el recurso ya existe.
    """

    status_code = status.HTTP_409_CONFLICT
    default_detail = "Ya existe una institución registrada con ese NIT/código."
    default_code = "institucion_duplicada"


class InstitucionNoEncontradaError(APIException):
    """
    Se lanza cuando se intenta acceder a una institución que no existe.
    """

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "La institución solicitada no existe."
    default_code = "institucion_no_encontrada"


class UsuarioDirectivoDuplicadoError(APIException):
    """Se lanza cuando el correo del directivo ya está registrado."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = "Ya existe un usuario con ese correo electrónico."
    default_code = "usuario_directivo_duplicado"
