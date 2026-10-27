"""
apps/reports/views.py — Controladores HTTP del dominio de reportes.

REGLA: Las views son delgadas.
  1. Deserializar entrada.
  2. Llamar al service.
  3. Serializar y retornar respuesta.

El service es el único punto de acceso a ReporteRepositoryProxy.
"""

import csv
import os
import uuid
from io import StringIO

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import EsDirectivo, EsDirectivoOOrientador, EsOrientador

from .serializers import (
    ActualizarClasificacionSerializer,
    ActualizarEstadoSerializer,
    ConsultarReporteSerializer,
    CrearReporteSerializer,
    FiltroFechasSerializer,
    HistorialEntradaSerializer,
    ReporteConsultaPublicaSerializer,
    ReporteLecturaSerializer,
)
from .services import ReporteService

_service = ReporteService()


class SubirEvidenciaView(APIView):
    """
    POST /api/v1/reports/evidencia/
    Carga un archivo de evidencia (imagen, captura, PDF, documento) de forma 100% anónima.
    El nombre original del archivo se anonimiza con un UUID para proteger la identidad
    del estudiante o reportante.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_EXTENSIONS = {
        ".png", ".jpg", ".jpeg", ".webp", ".gif",
        ".pdf", ".doc", ".docx", ".txt",
        ".mp3", ".wav", ".mp4", ".mov"
    }
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    def post(self, request: Request) -> Response:
        archivo = request.FILES.get("archivo") or request.FILES.get("evidencia")
        if not archivo:
            return Response(
                {"error": "No se recibió ningún archivo de evidencia en la petición."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if archivo.size > self.MAX_FILE_SIZE:
            return Response(
                {"error": f"El archivo excede el tamaño máximo permitido de 10 MB (tamaño: {round(archivo.size / (1024 * 1024), 2)} MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ext = os.path.splitext(archivo.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response(
                {
                    "error": f"El formato de archivo '{ext}' no está permitido.",
                    "formatos_permitidos": sorted(list(self.ALLOWED_EXTENSIONS)),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        safe_filename = f"evidencia_{uuid.uuid4().hex}{ext}"
        evidencias_dir = os.path.join(settings.MEDIA_ROOT, "evidencias")
        os.makedirs(evidencias_dir, exist_ok=True)

        file_path = os.path.join(evidencias_dir, safe_filename)
        with open(file_path, "wb+") as destination:
            for chunk in archivo.chunks():
                destination.write(chunk)

        evidencia_url = f"/media/evidencias/{safe_filename}"

        return Response(
            {
                "evidencia_url": evidencia_url,
                "nombre_archivo": safe_filename,
                "tamano": archivo.size,
                "tipo": ext,
            },
            status=status.HTTP_201_CREATED,
        )


class ActualizarEstadoReporteView(APIView):
    """
    PATCH /api/v1/reports/<id>/estado/
    Actualiza el estado de un reporte y registra el cambio en el historial
    de auditoría dentro del reporte (HU-08).
    Solo accesible por Orientadores de la misma institución del reporte.
    """

    permission_classes = [EsOrientador]

    def patch(self, request: Request, reporte_id: int | str) -> Response:
        serializer = ActualizarEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reporte = _service.actualizar_estado(
            reporte_id=reporte_id,
            nuevo_estado=serializer.validated_data["nuevo_estado"],
            usuario=request.user,
            comentario=serializer.validated_data.get("comentario", ""),
            observaciones=serializer.validated_data.get("observaciones", ""),
        )

        respuesta = ReporteLecturaSerializer(reporte)
        return Response(respuesta.data, status=status.HTTP_200_OK)


class ActualizarClasificacionReporteView(APIView):
    """
    PATCH /api/v1/reports/<id>/clasificacion/
    Permite al docente (Orientador o Directivo) confirmar el nivel de riesgo predicho
    por la IA, cambiarlo manualmente (BAJO, MEDIO, ALTO, CRITICO) y/o confirmar o
    modificar los tipos de agresión asociados al reporte.
    """

    permission_classes = [EsDirectivoOOrientador]

    def patch(self, request: Request, reporte_id: int | str) -> Response:
        serializer = ActualizarClasificacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        datos = serializer.validated_data
        tipos_agresion = datos["tipos_agresion"] if "tipos_agresion" in datos else None

        reporte = _service.actualizar_clasificacion(
            reporte_id=reporte_id,
            usuario=request.user,
            nivel_riesgo_confirmado=datos.get("nivel_riesgo_confirmado"),
            confirmar_ia=datos.get("confirmar_ia", False),
            tipos_agresion=tipos_agresion,
            comentario=datos.get("comentario", ""),
        )

        respuesta = ReporteLecturaSerializer(reporte)
        return Response(respuesta.data, status=status.HTTP_200_OK)

    def post(self, request: Request, reporte_id: int | str) -> Response:
        return self.patch(request, reporte_id)


class HistorialReporteView(APIView):
    """
    GET /api/v1/reports/<id>/historial/
    Devuelve los cambios de estado del reporte del más reciente al más antiguo.
    Solo accesible por Orientadores de la misma institución del reporte (HU-08).
    """

    permission_classes = [EsOrientador]

    def get(self, request: Request, reporte_id: int | str) -> Response:
        historial = _service.obtener_historial(
            reporte_id=reporte_id,
            usuario=request.user,
        )
        serializer = HistorialEntradaSerializer(historial, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistrarSeguimientoReporteView(APIView):
    """
    POST /api/v1/reports/<id>/seguimiento/
    Permite al orientador registrar una nota de seguimiento, acuerdo pedagógico
    o la activación formal de la Ruta Externa (Ley 1620) sin alterar forzosamente el estado.
    """

    permission_classes = [EsOrientador]

    def post(self, request: Request, reporte_id: int | str) -> Response:
        comentario = request.data.get("comentario") or request.data.get("observaciones") or ""
        tipo_accion = request.data.get("tipo_accion", "NOTA_SEGUIMIENTO")
        metadata = request.data.get("metadata", {})

        if not str(comentario).strip():
            return Response(
                {"comentario": "El comentario u observación es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reporte = _service.registrar_seguimiento(
            reporte_id=reporte_id,
            usuario=request.user,
            comentario=comentario,
            tipo_accion=tipo_accion,
            metadata=metadata,
        )
        return Response(ReporteLecturaSerializer(reporte).data, status=status.HTTP_201_CREATED)


class RegistrarChequeoPostCierreView(APIView):
    """
    POST /api/v1/reports/<id>/chequeo-post-cierre/
    Registra una verificación longitudinal de convivencia a los 15, 30 o 60 días
    después del cierre del caso con semáforo (VERDE, AMARILLO, ROJO).
    Si se detecta reincidencia (ROJO), permite reactivar automáticamente el caso
    al estado 'en_seguimiento'.
    """

    permission_classes = [EsOrientador]

    def post(self, request: Request, reporte_id: int | str) -> Response:
        hito = request.data.get("hito")
        semaforo = request.data.get("semaforo")
        observaciones = request.data.get("observaciones", "")
        reactivar_caso = bool(request.data.get("reactivar_caso", False))

        if not hito:
            return Response(
                {"hito": "El campo 'hito' es requerido (DIA_15, DIA_30, DIA_60)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not semaforo:
            return Response(
                {"semaforo": "El campo 'semaforo' es requerido (VERDE, AMARILLO, ROJO)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reporte = _service.registrar_chequeo_post_cierre(
                reporte_id=reporte_id,
                usuario=request.user,
                hito=hito,
                semaforo=semaforo,
                observaciones=observaciones,
                reactivar_caso=reactivar_caso,
            )
        except ValueError as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ReporteLecturaSerializer(reporte).data, status=status.HTTP_200_OK)


class CrearReporteView(APIView):
    """
    POST /api/v1/reports/
    Crea un nuevo reporte anónimo. No requiere autenticación.
    Soporta JSON y multipart/form-data con archivo de evidencia.
    """

    authentication_classes = []   # Sin autenticación requerida
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request: Request) -> Response:
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)

        # Si se envió un archivo en el mismo formulario multipart
        archivo = request.FILES.get("evidencia") or request.FILES.get("archivo")
        if archivo:
            ext = os.path.splitext(archivo.name)[1].lower()
            if ext in SubirEvidenciaView.ALLOWED_EXTENSIONS and archivo.size <= SubirEvidenciaView.MAX_FILE_SIZE:
                safe_filename = f"evidencia_{uuid.uuid4().hex}{ext}"
                evidencias_dir = os.path.join(settings.MEDIA_ROOT, "evidencias")
                os.makedirs(evidencias_dir, exist_ok=True)
                file_path = os.path.join(evidencias_dir, safe_filename)
                with open(file_path, "wb+") as destination:
                    for chunk in archivo.chunks():
                        destination.write(chunk)
                data["evidencia_url"] = f"/media/evidencias/{safe_filename}"

        serializer = CrearReporteSerializer(data=data)
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

        respuesta = ReporteConsultaPublicaSerializer(reporte)
        return Response(respuesta.data, status=status.HTTP_200_OK)


class ListarReportesView(APIView):
    """
    GET /api/v1/reports/
    Lista todos los reportes. Solo para Directivo u Orientador autenticado.
    Soporta filtros y paginación.
    """

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request: Request) -> Response:
        inst_id = getattr(request.user, "institution_id", None) or request.query_params.get("institucion_id")
        q = request.query_params.get("q") or request.query_params.get("search") or request.query_params.get("busqueda")
        filtros = {
            "institucion_id": inst_id,
            "estado": request.query_params.get("estado"),
            "nivel_riesgo_predicho": request.query_params.get("nivel_riesgo_predicho"),
            "ubicacion": request.query_params.get("ubicacion"),
            "fecha_inicio": request.query_params.get("fecha_inicio"),
            "fecha_fin": request.query_params.get("fecha_fin"),
            "q": q.strip() if q else None,
        }
        # Eliminar valores None y vacíos
        filtros = {k: v for k, v in filtros.items() if v is not None and v != ""}

        reportes = _service.listar_reportes(filtros)
        
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(reportes, request, view=self)
        
        if page is not None:
            serializer = ReporteLecturaSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ReporteLecturaSerializer(reportes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ExportarReportesCSVView(APIView):
    """
    GET /api/v1/reports/exportar/csv/
    Exporta el listado completo de reportes de la institución (con los filtros aplicados)
    a formato CSV estructurado con BOM UTF-8 para apertura directa en Microsoft Excel
    y compatibilidad con los reportes al sistema SIUCE del Ministerio de Educación.
    """

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request: Request) -> HttpResponse:
        inst_id = getattr(request.user, "institution_id", None) or request.query_params.get("institucion_id")
        q = request.query_params.get("q") or request.query_params.get("search") or request.query_params.get("busqueda")
        filtros = {
            "institucion_id": inst_id,
            "estado": request.query_params.get("estado"),
            "nivel_riesgo_predicho": request.query_params.get("nivel_riesgo_predicho"),
            "ubicacion": request.query_params.get("ubicacion"),
            "fecha_inicio": request.query_params.get("fecha_inicio"),
            "fecha_fin": request.query_params.get("fecha_fin"),
            "q": q.strip() if q else None,
        }
        filtros = {k: v for k, v in filtros.items() if v is not None and v != ""}

        reportes = _service.listar_reportes(filtros)

        output = StringIO()
        # Prefijo BOM UTF-8 (\ufeff) para que Microsoft Excel reconozca tildes y caracteres latinos
        output.write("\ufeff")
        writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)

        writer.writerow([
            "Código de Seguimiento",
            "Fecha Radicación",
            "Nivel Riesgo",
            "Estado Actual",
            "Ubicación",
            "Grado Víctima",
            "Rol Reportante",
            "Frecuencia",
            "Tipos de Agresión",
            "Condición Identidad",
            "Nombre Contacto",
            "Medio Contacto",
            "Última Actualización",
        ])

        for r in reportes:
            tipos = ""
            if hasattr(r, "tipos_agresion"):
                try:
                    tipos = ", ".join([t.nombre for t in r.tipos_agresion.all()])
                except Exception:
                    tipos = ""

            condicion_id = "Identificado Voluntario" if getattr(r, "acepta_revelar_identidad", False) else "100% Anónimo"
            fecha_creacion = r.fecha_creacion.strftime("%Y-%m-%d %H:%M") if getattr(r, "fecha_creacion", None) else ""
            fecha_act = r.fecha_actualizacion.strftime("%Y-%m-%d %H:%M") if getattr(r, "fecha_actualizacion", None) else fecha_creacion
            riesgo = getattr(r, "nivel_riesgo_confirmado", None) or getattr(r, "nivel_riesgo_predicho", "MEDIO")

            writer.writerow([
                str(r.codigo_seguimiento),
                fecha_creacion,
                riesgo,
                getattr(r, "estado", "NUEVO"),
                getattr(r, "ubicacion", "No especificada"),
                getattr(r, "grado_victima", "No indicado"),
                getattr(r, "involucrados_tipo", "No indicado"),
                getattr(r, "frecuencia", "No indicada"),
                tipos,
                condicion_id,
                getattr(r, "nombre_contacto_victima", None) or "N/A (Anónimo)",
                getattr(r, "medio_contacto_victima", None) or "N/A (Anónimo)",
                fecha_act,
            ])

        response = HttpResponse(output.getvalue(), content_type="text/csv; charset=utf-8")
        timestamp = timezone.now().strftime("%Y%m%d_%H%M")
        response["Content-Disposition"] = f'attachment; filename="reportes_convivencia_{timestamp}.csv"'
        return response


class StatisticsOverviewView(APIView):
    """
    GET /api/v1/reports/statistics/?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
    Estadísticas agregadas (HU-13). Orientador o Directivo; solo ve su institución.
    """

    permission_classes = [EsDirectivoOOrientador]

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
    Concentración de casos por zona de la sede (HU-14). Orientador o Directivo;
    solo ve su institución.
    """

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request: Request) -> Response:
        filtros = FiltroFechasSerializer(data=request.query_params)
        filtros.is_valid(raise_exception=True)

        datos = _service.obtener_mapa_calor(
            institucion_id=request.user.institution_id,
            fecha_inicio=filtros.validated_data.get("fecha_inicio"),
            fecha_fin=filtros.validated_data.get("fecha_fin"),
        )
        return Response(datos, status=status.HTTP_200_OK)


class RecomendacionesReporteView(APIView):
    """
    GET /api/v1/reports/<reporte_id>/recomendaciones/
    Devuelve las recomendaciones automáticas de intervención y protocolos
    pedagógicos / convivenciales asociados al reporte según el nivel de riesgo
    (HU-12) y tipo de agresión (HU-15).
    Solo accesible por Orientador o Directivo de la misma institución.
    """

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request: Request, reporte_id: int | str) -> Response:
        recomendaciones = _service.obtener_recomendaciones(
            reporte_id=reporte_id,
            usuario=request.user,
        )
        return Response(recomendaciones, status=status.HTTP_200_OK)
