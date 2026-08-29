"""
apps/reports/views.py — Controladores HTTP del dominio de reportes.

REGLA: Las views son delgadas.
  1. Deserializar entrada.
  2. Llamar al service.
  3. Serializar y retornar respuesta.

El service es el único punto de acceso a ReporteRepositoryProxy.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import EsDirectivoOOrientador

from .serializers import (
    ConsultarReporteSerializer,
    CrearReporteSerializer,
    ReporteLecturaSerializer,
)
from .services import ReporteService

_service = ReporteService()


class CrearReporteView(APIView):
    """
    POST /api/v1/reports/
    Crea un nuevo reporte anónimo. No requiere autenticación.

    Flujo:
      Serializer (validación) → Service → Proxy (lista blanca) → ORM
    """

    authentication_classes = []   # Sin autenticación requerida
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = CrearReporteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reporte = _service.crear_reporte(serializer.validated_data)

        respuesta = ReporteLecturaSerializer(reporte)
        return Response(respuesta.data, status=status.HTTP_201_CREATED)


class ConsultarReporteView(APIView):
    """
    GET /api/v1/reports/consultar/?codigo=<uuid>
    Consulta el estado de un reporte por código de seguimiento. Sin autenticación.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        serializer = ConsultarReporteSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        reporte = _service.consultar_por_codigo(
            serializer.validated_data["codigo_seguimiento"]
        )

        respuesta = ReporteLecturaSerializer(reporte)
        return Response(respuesta.data, status=status.HTTP_200_OK)


class ListarReportesView(APIView):
    """
    GET /api/v1/reports/
    Lista todos los reportes. Solo para Directivo u Orientador autenticado.
    """

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request: Request) -> Response:
        reportes = _service.listar_reportes()
        serializer = ReporteLecturaSerializer(reportes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
