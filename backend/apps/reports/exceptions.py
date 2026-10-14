"""
apps/reports/exceptions.py — Excepciones específicas del dominio de reportes.
"""

from rest_framework import status
from rest_framework.exceptions import APIException


class ReporteCampoNoPermitidoError(APIException):
    """
    Se lanza por ReporteRepositoryProxy cuando se intenta persistir un campo
    fuera de la lista blanca ALLOWED_FIELDS.

    Esta excepción representa una violación de la política de anonimato
    y debe tratarse como un error de programación (500), no un error de usuario.
    """

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = (
        "Error interno: intento de persistir datos no permitidos en un Reporte. "
        "Contacta al equipo de desarrollo."
    )
    default_code = "reporte_campo_no_permitido"

    def __init__(self, campos_prohibidos: list | None = None):
        super().__init__()
        # Se loguea internamente pero NO se expone al cliente por seguridad
        self.campos_prohibidos = campos_prohibidos or []


class ReporteNoEncontradoError(APIException):
    """
    Se lanza cuando no existe un Reporte con el ID o código de seguimiento indicado.
    Usa 404 y un mensaje claro para el cliente.
    """

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "No se encontró el reporte solicitado."
    default_code = "reporte_no_encontrado"


class TransicionEstadoInvalidaError(APIException):
    """
    Se lanza cuando la transición solicitada no está permitida según las reglas de negocio.
    Retorna 400 Bad Request con el estado actual y los estados permitidos.
    """

    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "transicion_invalida"

    def __init__(self, mensaje: str, estado_actual: str = "", estados_permitidos: list = None):
        super().__init__(detail={"error": mensaje, "detail": mensaje, "estado_actual": estado_actual, "estados_permitidos": estados_permitidos or []})


class MismoEstadoError(APIException):
    """
    Se lanza cuando se intenta actualizar un reporte al mismo estado en el que ya se encuentra.
    Retorna 400 Bad Request.
    """

    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "mismo_estado"

    def __init__(self, estado_actual: str):
        mensaje = f"El nuevo estado es igual al estado actual ('{estado_actual}'). No se realizaron cambios."
        super().__init__(detail={"error": mensaje, "detail": mensaje, "estado_actual": estado_actual})


class PermisoOrientadorRequeridoError(APIException):
    """
    Se lanza cuando un usuario sin rol de Orientador intenta actualizar o consultar el historial.
    Retorna 403 Forbidden.
    """

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Solo los usuarios con rol de Orientador pueden realizar esta acción."
    default_code = "rol_orientador_requerido"


class InstitucionNoCoincideError(APIException):
    """
    Se lanza cuando el orientador pertenece a una institución diferente a la del reporte.
    Retorna 403 Forbidden.
    """

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Solo los orientadores de la misma institución del reporte tienen acceso."
    default_code = "institucion_no_coincide"
