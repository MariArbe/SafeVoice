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

from .permissions import EsDirectivo
from .serializers import CrearUsuarioSerializer, UsuarioLecturaSerializer
from .services import UsuarioService
from .tokens import CustomTokenObtainPairSerializer

# Instancia única del service para esta app (stateless, seguro en concurrencia)
_service = UsuarioService()


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/users/login/

    Autenticación por email/contraseña. Retorna access token, refresh token
    y datos del usuario (rol, institution_id, email) para hidratar el frontend
    sin necesidad de un request adicional a /me/.

    Respuesta exitosa (200):
        {
            "access": "<jwt>",
            "refresh": "<jwt>",
            "rol": "DIRECTIVO",
            "institution_id": 1,
            "email": "director@colegio.edu.co"
        }

    Error de credenciales (401):
        {
            "error": {
                "code": "authentication_failed",
                "message": "Correo electrónico o contraseña incorrectos."
            }
        }

    Cumple HU-09 (orientador) y HU-10 (directivo): mismo endpoint, el frontend
    redirige según el campo `rol` devuelto.
    """

    serializer_class = CustomTokenObtainPairSerializer
    # Rate limiting específico para login (mitigación de fuerza bruta)
    throttle_scope = "login"


class RefreshTokenView(TokenRefreshView):
    """
    POST /api/v1/users/token/refresh/
    Renueva el access token usando el refresh token.
    El refresh token se rota automáticamente (ROTATE_REFRESH_TOKENS=True en settings).
    """


class UsuarioMeView(APIView):
    """
    GET /api/v1/users/me/

    Retorna los datos del usuario autenticado actualmente.
    Útil para hidratar el frontend tras recargar la página (el access token
    sigue válido pero el estado en memoria se perdió).

    Requiere: Bearer token válido.
    """

    def get(self, request: Request) -> Response:
        serializer = UsuarioLecturaSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CrearUsuarioView(APIView):
    """
    POST /api/v1/users/

    Crea un nuevo usuario (Directivo u Orientador) dentro de la institución
    del directivo autenticado.

    Solo un Directivo autenticado puede crear usuarios.
    El usuario creado queda automáticamente asociado a la misma institución
    que el directivo solicitante.
    """

    permission_classes = [EsDirectivo]

    def post(self, request: Request) -> Response:
        serializer = CrearUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # El usuario creado hereda la institución del directivo autenticado
        datos = serializer.validated_data
        datos["institution"] = request.user.institution

        usuario = _service.crear_usuario(datos)
        return Response(
            UsuarioLecturaSerializer(usuario).data,
            status=status.HTTP_201_CREATED,
        )
