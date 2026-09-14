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
    Se lanza cuando no existe un Reporte con el código de seguimiento indicado.
    Usa 404 y un mensaje genérico para no revelar si el código existe o no.
    """

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "No se encontró un reporte con el código proporcionado."
    default_code = "reporte_no_encontrado"
