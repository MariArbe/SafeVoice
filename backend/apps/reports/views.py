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

from core.permissions import EsDirectivo, EsDirectivoOOrientador

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


from rest_framework.pagination import PageNumberPagination

class ListarReportesView(APIView):
    """
    GET /api/v1/reports/
    Lista todos los reportes. Solo para Directivo u Orientador autenticado.
    Soporta filtros y paginación.
    """

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request: Request) -> Response:
        filtros = {
            "institucion_id": request.query_params.get("institucion_id"),
            "estado": request.query_params.get("estado"),
            "nivel_riesgo_predicho": request.query_params.get("nivel_riesgo_predicho"),
            "fecha_inicio": request.query_params.get("fecha_inicio"),
            "fecha_fin": request.query_params.get("fecha_fin"),
        }
        # Eliminar valores None
        filtros = {k: v for k, v in filtros.items() if v is not None}

        reportes = _service.listar_reportes(filtros)
        
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(reportes, request, view=self)
        
        if page is not None:
            serializer = ReporteLecturaSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ReporteLecturaSerializer(reportes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StatisticsOverviewView(APIView):
    """Contrato de estadísticas para HU-13; la lógica real queda fuera de este sprint."""

    permission_classes = [EsDirectivo]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "total_reports": None,
                "by_status": {},
                "by_risk_level": {},
            },
            status=status.HTTP_200_OK,
        )


class HeatmapView(APIView):
    """Contrato de mapa de calor para HU-14; la lógica real queda fuera de este sprint."""

    permission_classes = [EsDirectivo]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "points": [],
                "dimensions": {
                    "latitude": None,
                    "longitude": None,
                    "intensity": None,
                },
            },
            status=status.HTTP_200_OK,
        )
