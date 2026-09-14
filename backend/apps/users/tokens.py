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

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

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

    El mensaje de error en caso de credenciales incorrectas es genérico
    para cumplir con el requisito de no revelar si un email existe.
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
        token["email"] = user.email

        return token

    def validate(self, attrs: dict) -> dict:
        """
        Valida credenciales y enriquece el body de la respuesta.

        En caso de error, captura la excepción de simplejwt y la reemplaza
        por nuestro mensaje genérico (HU-09/10: no revelar si el usuario existe).
        """
        try:
            data = super().validate(attrs)
        except (AuthenticationFailed, InvalidToken) as exc:
            # Re-lanzar con mensaje genérico sin revelar si el email existe
            logger.warning(
                "Intento de login fallido para email: %s",
                attrs.get(self.username_field, "desconocido"),
            )
            raise AuthenticationFailed(_MSG_CREDENCIALES_INVALIDAS) from exc

        # Enriquecer el body de la respuesta (además del payload del token)
        user = self.user
        data["rol"] = user.rol
        data["institution_id"] = user.institution_id
        data["email"] = user.email

        logger.info(
            "Login exitoso: %s (rol=%s, institution_id=%s)",
            user.email,
            user.rol,
            user.institution_id,
        )

        return data
