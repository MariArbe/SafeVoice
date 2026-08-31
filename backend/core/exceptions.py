"""
core/exceptions.py — Handler global de excepciones para Django REST Framework.

Todas las respuestas de error del proyecto siguen el mismo esquema JSON:

    {
        "error": {
            "code":    "string identificador de la excepción",
            "message": "mensaje legible para el consumidor de la API",
            "details": { ... }   (opcional, detalles de validación u otros)
        }
    }

Configurado en settings/base.py mediante:
    REST_FRAMEWORK = {
        "EXCEPTION_HANDLER": "core.exceptions.safevoice_exception_handler",
        ...
    }
"""

import logging

from django.core.exceptions import PermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_handler

logger = logging.getLogger(__name__)


def _build_error_response(
    code: str,
    message: str,
    details: dict | None = None,
    http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
) -> Response:
    """Construye un Response con el esquema de error estándar de SafeVoice."""
    payload: dict = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details:
        payload["error"]["details"] = details

    return Response(payload, status=http_status)


def safevoice_exception_handler(exc: Exception, context: dict) -> Response | None:
    """
    Handler global de excepciones para DRF.

    Proceso:
    1. Traduce excepciones nativas de Django a su equivalente DRF.
    2. Delega al handler por defecto de DRF para que produzca el Response base.
    3. Reformatea el Response al esquema estándar de SafeVoice.
    4. Loguea excepciones inesperadas (5xx) con traceback completo.
    """

    # 1. Traducción de excepciones nativas de Django → DRF
    if isinstance(exc, Http404):
        from rest_framework.exceptions import NotFound
        exc = NotFound()
    elif isinstance(exc, PermissionDenied):
        from rest_framework.exceptions import PermissionDenied as DRFPermissionDenied
        exc = DRFPermissionDenied()
    elif isinstance(exc, DjangoValidationError):
        from rest_framework.exceptions import ValidationError
        exc = ValidationError(detail=exc.message_dict if hasattr(exc, "message_dict") else exc.messages)

    # 2. Delegación al handler por defecto de DRF
    response = drf_default_handler(exc, context)

    # Si DRF no sabe manejar la excepción (None), es un error interno no controlado
    if response is None:
        logger.exception(
            "Excepción no controlada en SafeVoice: %s",
            exc,
            exc_info=True,
            extra={"view": str(context.get("view")), "request": str(context.get("request"))},
        )
        return _build_error_response(
            code="internal_server_error",
            message="Se produjo un error interno. Por favor contacta al administrador.",
            http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # 3. Reformateo al esquema estándar
    if isinstance(exc, APIException):
        code = exc.default_code if hasattr(exc, "default_code") else "api_error"
        message = exc.default_detail if isinstance(exc.detail, str) else "Error en la solicitud."

        # Los errores de validación (422) incluyen detalles de campo en "details"
        details: dict | None = None
        if isinstance(exc.detail, dict):
            details = exc.detail
            message = "Los datos enviados contienen errores de validación."
        elif isinstance(exc.detail, list):
            details = {"non_field_errors": exc.detail}
            message = "Los datos enviados contienen errores de validación."

        response.data = {
            "error": {
                "code": code,
                "message": message,
                **({"details": details} if details else {}),
            }
        }

    return response
