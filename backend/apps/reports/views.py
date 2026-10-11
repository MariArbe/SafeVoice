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
    ActualizarEstadoSerializer,
    ConsultarReporteSerializer,
    CrearReporteSerializer,
    FiltroFechasSerializer,
    ReporteLecturaSerializer,
)
from .services import ReporteService

_service = ReporteService()


class ActualizarEstadoReporteView(APIView):
    """
    PATCH /api/v1/reports/<id>/estado/
    Actualiza el estado de un reporte y registra el cambio en el historial
    de auditoría (HU-08). Solo accesible por Directivo u Orientador.

    Flujo:
      ActualizarEstadoSerializer (validación) → Service (lógica + auditoría) → ORM
    """

    permission_classes = [EsDirectivoOOrientador]

    def patch(self, request: Request, reporte_id: int) -> Response:
        serializer = ActualizarEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reporte = _service.actualizar_estado(
            reporte_id=reporte_id,
            nuevo_estado=serializer.validated_data["nuevo_estado"],
            usuario=request.user,
            observaciones=serializer.validated_data.get("observaciones", ""),
        )

        respuesta = ReporteLecturaSerializer(reporte)
        return Response(respuesta.data, status=status.HTTP_200_OK)



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
    """
    GET /api/v1/reports/statistics/?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
    Estadísticas agregadas (HU-13). Solo Directivo; solo ve su institución.
    """

    permission_classes = [EsDirectivo]

    def get(self, request: Request) -> Response:
        filtros = FiltroFechasSerializer(data=request.query_params)
        filtros.is_valid(raise_exception=True)

        datos = _service.obtener_estadisticas(
            institucion_id=request.user.institution_id,
            fecha_inicio=filtros.validated_data.get("fecha_inicio"),
            fecha_fin=filtros.validated_data.get("fecha_fin"),
        )
        return Response(datos, status=status.HTTP_200_OK)


class HeatmapView(APIView):
    """
    GET /api/v1/reports/heatmap/?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
    Concentración de casos por zona de la sede (HU-14). Solo Directivo;
    solo ve su institución.
    """

    permission_classes = [EsDirectivo]

    def get(self, request: Request) -> Response:
        filtros = FiltroFechasSerializer(data=request.query_params)
        filtros.is_valid(raise_exception=True)

        datos = _service.obtener_mapa_calor(
            institucion_id=request.user.institution_id,
            fecha_inicio=filtros.validated_data.get("fecha_inicio"),
            fecha_fin=filtros.validated_data.get("fecha_fin"),
        )
        return Response(datos, status=status.HTTP_200_OK)

