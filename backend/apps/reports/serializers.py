"""
apps/reports/serializers.py — Serializers (DTOs) del dominio de reportes.

El serializer actúa como primera capa de validación de entrada.
El ReporteRepositoryProxy actúa como segunda capa (lista blanca en BD).
Ambas capas son independientes para garantizar anonimato en profundidad.
"""

from rest_framework import serializers

from .models import Reporte


class ReporteLecturaSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para exponer un Reporte.
    Solo expone campos públicos y anónimos; nunca datos identificables.
    """

    class Meta:
        model = Reporte
        fields = [
            "codigo_seguimiento",
            "fecha_creacion",
            "fecha_actualizacion",
            # Los campos de contenido (descripcion, tipo_bullying, etc.)
            # se añadirán en Etapa 2.
        ]
        read_only_fields = fields


class CrearReporteSerializer(serializers.ModelSerializer):
    """
    Serializer de escritura para la creación de reportes anónimos.
    No requiere autenticación (la vista define AllowAny).

    GARANTÍA: Este serializer NUNCA debe incluir campos identificables.
    La segunda garantía es el ReporteRepositoryProxy (lista blanca ALLOWED_FIELDS).
    """

    class Meta:
        model = Reporte
        fields: list[str] = [
            # Los campos de contenido se añadirán en Etapa 2.
            # Por ahora, crear un Reporte genera solo el codigo_seguimiento.
        ]

    def create(self, validated_data: dict) -> Reporte:
        """
        Delegación al proxy en lugar de llamar al ORM directamente.
        El service llama a este método via serializer.save().
        """
        from .repository import ReporteRepositoryProxy
        proxy = ReporteRepositoryProxy()
        return proxy.crear(validated_data)


class ConsultarReporteSerializer(serializers.Serializer):
    """
    Serializer para la consulta anónima de estado por código de seguimiento.
    Valida que el input sea un UUID válido antes de consultar.
    """

    codigo_seguimiento = serializers.UUIDField(
        help_text="UUID del código de seguimiento entregado al crear el reporte."
    )
