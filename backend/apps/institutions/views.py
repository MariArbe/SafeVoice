"""
apps/institutions/views.py — Controladores HTTP del dominio de instituciones.

REGLA: Las views son delgadas. Solo se encargan de:
  1. Deserializar la entrada (serializer.is_valid()).
  2. Llamar al service correspondiente.
  3. Serializar y retornar la respuesta.

Toda la lógica de negocio vive en services.py.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    InstitutionCatalogoSerializer,
    InstitutionLecturaSerializer,
    RegistrarInstitucionSerializer,
)
from .services import InstitutionService

_service = InstitutionService()


class ListarInstitucionesView(APIView):
    """
    GET /api/v1/institutions/

    Endpoint público y ligero para obtener el catálogo de colegios activos.
    Alimenta los selectores del formulario de reporte y el registro docente.

    Respuesta (200 OK):
        [
            {
                "id": 1,
                "nombre": "Colegio UPB",
                "ciudad": "Medellín"
            },
            ...
        ]
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        instituciones = _service.listar_activas()
        serializer = InstitutionCatalogoSerializer(instituciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistrarInstitucionView(APIView):
    """
    POST /api/v1/institutions/register/

    Endpoint público (no requiere autenticación) para que un directivo
    registre su institución y cree su cuenta en una sola operación (HU-11).

    Payload esperado:
        {
            "institucion": {
                "nombre": "Colegio San José",
                "codigo_dane": "900123456-7",
                "ciudad": "Bogotá"
            },
            "directivo": {
                "email": "director@sanjose.edu.co",
                "first_name": "Carlos",
                "last_name": "Pérez",
                "password": "contraseña_segura",
                "password_confirmacion": "contraseña_segura"
            }
        }

    Respuesta exitosa (201):
        {
            "detail": "Institución registrada exitosamente.",
            "institution_id": 1,
            "nombre": "Colegio San José"
        }
    """

    # Endpoint público: cualquier directivo nuevo puede registrar su institución
    permission_classes = [AllowAny]
    # Throttle específico para limitar registros masivos
    throttle_scope = "registro"

    def post(self, request: Request) -> Response:
        serializer = RegistrarInstitucionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        datos = serializer.validated_data
        institution, _ = _service.registrar_institucion(
            datos_institucion=datos["institucion"],
            datos_directivo=datos["directivo"],
        )

        return Response(
            {
                "detail": "Institución registrada exitosamente. Ya puede iniciar sesión.",
                "institution_id": institution.id,
                "nombre": institution.nombre,
            },
            status=status.HTTP_201_CREATED,
        )
