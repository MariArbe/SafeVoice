"""
apps/users/serializers.py — Serializers (DTOs) del dominio de usuarios.

Responsabilidades:
  - Validar la entrada de datos antes de llegar al service.
  - Controlar qué campos se exponen en las respuestas (never password en output).
  - Separar la representación HTTP del modelo de dominio.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Usuario


class UsuarioLecturaSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para exponer datos de un usuario.
    No expone campos sensibles (password, last_login, etc.).
    """

    rol_display = serializers.CharField(source="get_rol_display", read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "rol",
            "rol_display",
            "is_active",
            "date_joined",
        ]
        read_only_fields = fields


class CrearUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer de escritura para la creación de nuevos usuarios.
    Valida la contraseña usando los validadores de Django configurados en settings.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Mínimo 8 caracteres. Se almacena cifrada.",
    )
    password_confirmacion = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        help_text="Debe coincidir con el campo password.",
    )

    class Meta:
        model = Usuario
        fields = [
            "email",
            "first_name",
            "last_name",
            "rol",
            "password",
            "password_confirmacion",
        ]

    def validate_password(self, value: str) -> str:
        """Valida la contraseña con los validadores configurados en AUTH_PASSWORD_VALIDATORS."""
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        """Verifica que ambas contraseñas coincidan."""
        if attrs.get("password") != attrs.pop("password_confirmacion", None):
            raise serializers.ValidationError(
                {"password_confirmacion": "Las contraseñas no coinciden."}
            )
        return attrs

    def create(self, validated_data: dict) -> Usuario:
        """Crea el usuario usando create_user para hashear la contraseña correctamente."""
        password = validated_data.pop("password")
        # Genera username a partir del email para satisfacer AbstractUser
        email = validated_data["email"]
        validated_data.setdefault("username", email)
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CambiarPasswordSerializer(serializers.Serializer):
    """
    Serializer para cambio de contraseña por el propio usuario autenticado.
    No es un ModelSerializer porque no persiste directamente; lo hace el service.
    """

    password_actual = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )
    password_nuevo = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    password_nuevo_confirmacion = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_password_nuevo(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs.get("password_nuevo") != attrs.get("password_nuevo_confirmacion"):
            raise serializers.ValidationError(
                {"password_nuevo_confirmacion": "Las contraseñas no coinciden."}
            )
        return attrs
