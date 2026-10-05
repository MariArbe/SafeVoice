"""
apps/reports/serializers.py — Serializers (DTOs) del dominio de reportes.

El serializer actúa como primera capa de validación de entrada.
El ReporteRepositoryProxy actúa como segunda capa (lista blanca en BD).
Ambas capas son independientes para garantizar anonimato en profundidad.
"""

from datetime import date

from rest_framework import serializers

from .models import Reporte, SeguimientoCaso


class HistorialEstadoSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para exponer registros de auditoría
    de cambios de estado (SeguimientoCaso).
    """

    usuario_email = serializers.EmailField(
        source="orientador.email", read_only=True, default=None,
    )

    class Meta:
        model = SeguimientoCaso
        fields = [
            "id",
            "estado_anterior",
            "estado_nuevo",
            "observaciones",
            "fecha_atencion",
            "usuario_email",
        ]
        read_only_fields = fields


class ReporteLecturaSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para exponer un Reporte.
    Solo expone campos públicos y anónimos; nunca datos identificables.
    """

    historial_estados = HistorialEstadoSerializer(
        source="seguimientos", many=True, read_only=True,
    )

    class Meta:
        model = Reporte
        fields = [
            "codigo_seguimiento",
            "fecha_creacion",
            "fecha_actualizacion",
            "estado",
            "nivel_riesgo_predicho",
            "nivel_riesgo_confirmado",
            "ubicacion",
            "frecuencia",
            "grado_victima",
            "involucrados_tipo",
            "descripcion",
            "institucion_id",
            "acepta_revelar_identidad",
            "nombre_contacto_victima",
            "medio_contacto_victima",
            "historial_estados",
        ]
        read_only_fields = fields


class CrearReporteSerializer(serializers.ModelSerializer):
    """
    Serializer de escritura para la creación de reportes anónimos.
    No requiere autenticación (la vista define AllowAny).
    """

    tipo_incidente = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rol_reportante = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    fecha_aproximada = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Reporte
        fields: list[str] = [
            "institucion",
            "ubicacion",
            "frecuencia",
            "grado_victima",
            "involucrados_tipo",
            "involucrados_grado",
            "descripcion",
            "evidencia_url",
            "tipos_agresion",
            "acepta_revelar_identidad",
            "nombre_contacto_victima",
            "medio_contacto_victima",
            "tipo_incidente",
            "rol_reportante",
            "fecha_aproximada",
        ]

    def create(self, validated_data: dict) -> Reporte:
        """
        Delegación al proxy en lugar de llamar al ORM directamente.
        El service llama a este método via serializer.save().
        """
        from .repository import ReporteRepositoryProxy

        if "rol_reportante" in validated_data and not validated_data.get("involucrados_tipo"):
            validated_data["involucrados_tipo"] = validated_data["rol_reportante"]

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


class ActualizarEstadoSerializer(serializers.Serializer):
    """
    Serializer de entrada para PATCH /reportes/<id>/estado/ (HU-08).
    Valida el nuevo estado y las observaciones opcionales del orientador.
    """

    nuevo_estado = serializers.ChoiceField(
        choices=Reporte.Estado.choices,
        help_text="Nuevo estado al que se quiere transicionar el reporte.",
    )
    observaciones = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Notas u observaciones del orientador sobre el cambio.",
    )
