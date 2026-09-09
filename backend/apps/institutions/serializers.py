"""
apps/institutions/serializers.py — Serializers del dominio de instituciones.

Responsabilidades:
  - Validar entrada para registro de institución + directivo.
  - Controlar campos expuestos en respuestas.
  - RegistrarInstitucionSerializer agrupa datos de institución y del directivo
    en un único payload para simplificar el request del cliente.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Institution


class InstitutionLecturaSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para exponer datos de una institución.
    No expone campos de configuración interna.
    """

    class Meta:
        model = Institution
        fields = [
            "id",
            "nombre",
            "codigo_dane",
            "ciudad",
            "is_active",
            "fecha_creacion",
        ]
        read_only_fields = fields


class DirectivoRegistroSerializer(serializers.Serializer):
    """
    Sub-serializer con los datos del usuario directivo que se creará
    junto con la institución (HU-11).
    """

    email = serializers.EmailField(
        help_text="Correo institucional del directivo. Será su identificador de login.",
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Mínimo 8 caracteres.",
    )
    password_confirmacion = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs.get("password") != attrs.pop("password_confirmacion", None):
            raise serializers.ValidationError(
                {"password_confirmacion": "Las contraseñas no coinciden."}
            )
        return attrs


class InstitucionRegistroSerializer(serializers.Serializer):
    """Campos de institución definidos por el diseño de base de datos."""

    nombre = serializers.CharField(max_length=150)
    codigo_dane = serializers.CharField(max_length=20, required=False, allow_blank=True)
    ciudad = serializers.CharField(max_length=100)

    def validate(self, attrs: dict) -> dict:
        attrs["nombre"] = attrs["nombre"].strip()
        attrs["ciudad"] = attrs["ciudad"].strip()
        attrs["codigo_dane"] = attrs.get("codigo_dane", "").strip() or None

        errors = {}
        if not attrs["nombre"]:
            errors["nombre"] = "El campo 'nombre' es obligatorio."
        if not attrs["ciudad"]:
            errors["ciudad"] = "El campo 'ciudad' es obligatorio."
        if errors:
            raise serializers.ValidationError(errors)

        if (
            attrs["codigo_dane"]
            and Institution.objects.filter(codigo_dane=attrs["codigo_dane"]).exists()
        ):
            raise serializers.ValidationError(
                {"codigo_dane": "Ya existe una institución con ese código DANE/NIT."}
            )
        return attrs


class RegistrarInstitucionSerializer(serializers.Serializer):
    """
    Serializer de escritura para HU-11: registro de institución + directivo.

    El payload agrupa datos de la institución y del directivo que la administrará.
    La validación de unicidad de NIT se realiza aquí Y en la BD para garantizar
    integridad en entornos concurrentes.

    Ejemplo de payload:
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
    """

    institucion = InstitucionRegistroSerializer(
        help_text="Datos de la institución a registrar.",
    )
    directivo = DirectivoRegistroSerializer(
        help_text="Datos del usuario directivo que administrará la institución.",
    )

    def validate_directivo(self, value: dict) -> dict:
        email = value["email"].strip().lower()
        from apps.users.models import Usuario

        if Usuario.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                {"email": "Ya existe un usuario con ese correo electrónico."}
            )
        value["email"] = email
        return value
