"""
apps/users/tokens.py — Personalización del token JWT para SafeVoice.

Extiende TokenObtainPairSerializer de simplejwt para:
  1. Incluir `rol` e `institution_id` en el payload del access token
     (útil para validación en el frontend sin extra requests).
  2. Incluir los mismos datos en el body de la respuesta JSON
     (para que el frontend pueda hidratar su estado al hacer login).
  3. Mantener el mensaje de error genérico que no revela si el usuario existe
     (criterio de aceptación de HU-09 y HU-10).
"""

import logging

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .brute_force import (
    check_login_lockout,
    get_client_ip,
    record_failed_login,
    reset_failed_logins,
)

logger = logging.getLogger(__name__)

# Mensaje genérico que no revela si el email existe en el sistema
_MSG_CREDENCIALES_INVALIDAS = "Correo electrónico o contraseña incorrectos."


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login personalizado.

    Añade al token JWT y a la respuesta:
      - rol: "DIRECTIVO" o "ORIENTADOR"
      - institution_id: ID de la institución del usuario (None si es superusuario)
      - email: correo del usuario autenticado

    Incorpora control anti fuerza bruta:
      - Verificación de bloqueo temporal previo.
      - Límite de 5 intentos fallidos consecutivos con contador.
      - Reseteo de intentos tras autenticación exitosa.
    """

    @classmethod
    def get_token(cls, user):
        """
        Enriquece el payload del token JWT con datos de rol e institución.
        Este payload es decodificable por el frontend para evitar un
        request adicional a /me/ solo para obtener el rol.
        """
        token = super().get_token(user)

        # Claims personalizados dentro del JWT
        token["rol"] = user.rol
        token["institution_id"] = user.institution_id  # None si no tiene institución
        token["institution_nombre"] = user.institution.nombre if user.institution else None
        token["email"] = user.email

        return token

    def validate(self, attrs: dict) -> dict:
        """
        Valida credenciales, aplica control anti fuerza bruta y enriquece la respuesta.
        """
        request = self.context.get("request")
        email = attrs.get(self.username_field, "")
        ip = get_client_ip(request)

        # 1. Verificar si la cuenta/IP se encuentra temporalmente bloqueada
        check_login_lockout(email, ip)

        try:
            data = super().validate(attrs)
        except (AuthenticationFailed, InvalidToken, TokenError) as exc:
            # 2. Registrar intento fallido y lanzar advertencia de intentos o bloqueo (429/401)
            record_failed_login(email, ip)

        # 3. Autenticación exitosa: resetear contador de intentos fallidos
        reset_failed_logins(email, ip)

        # Enriquecer el body de la respuesta (además del payload del token)
        user = self.user
        data["rol"] = user.rol
        data["institution_id"] = user.institution_id
        data["institution_nombre"] = user.institution.nombre if user.institution else None
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name

        logger.info(
            "Login exitoso: %s (rol=%s, institution_id=%s)",
            user.email,
            user.rol,
            user.institution_id,
        )

        return data
