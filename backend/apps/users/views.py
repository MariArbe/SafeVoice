"""
apps/users/views.py — Controladores HTTP del dominio de usuarios.

REGLA: Las views son delgadas. Solo se encargan de:
  1. Deserializar la entrada (serializer.is_valid()).
  2. Llamar al service correspondiente.
  3. Serializar y retornar la respuesta.

Toda la lógica de negocio vive en services.py.
"""

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import CrearUsuarioSerializer, UsuarioLecturaSerializer
from .services import UsuarioService

# Instancia única del service para esta app (stateless, seguro en concurrencia)
_service = UsuarioService()


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/users/login/
    Autenticación por email/contraseña. Retorna access y refresh JWT.

    Hereda de TokenObtainPairView de simplejwt; en Etapa 2 se personalizará
    el payload del token para incluir el rol del usuario.
    """
    # TODO (Etapa 2): Sobreescribir el serializer para incluir 'rol' en el token


class RefreshTokenView(TokenRefreshView):
    """
    POST /api/v1/users/token/refresh/
    Renueva el access token usando el refresh token.
    """


class UsuarioMeView(APIView):
    """
    GET /api/v1/users/me/
    Retorna los datos del usuario autenticado actualmente.

    Requiere: Bearer token válido.
    """

    def get(self, request: Request) -> Response:
        serializer = UsuarioLecturaSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CrearUsuarioView(APIView):
    """
    POST /api/v1/users/
    Crea un nuevo usuario (Directivo u Orientador).

    Solo un Directivo autenticado puede crear usuarios.
    Implementación completa en Etapa 2.
    """

    from .permissions import EsDirectivo
    permission_classes = [EsDirectivo]

    def post(self, request: Request) -> Response:
        serializer = CrearUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO (Etapa 2): _service.crear_usuario(serializer.validated_data)
        return Response(
            {"detail": "Endpoint en construcción. Disponible en Etapa 2."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
