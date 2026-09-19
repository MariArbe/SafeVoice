"""
apps/reports/serializers.py — Serializers (DTOs) del dominio de reportes.

El serializer actúa como primera capa de validación de entrada.
El ReporteRepositoryProxy actúa como segunda capa (lista blanca en BD).
Ambas capas son independientes para garantizar anonimato en profundidad.
"""

from datetime import date

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
            "estado",
            "nivel_riesgo",
            "tipo_incidente",
            "descripcion",
            "institucion_id",
        ]
        read_only_fields = fields


class CrearReporteSerializer(serializers.Serializer):
    """
    Serializer de escritura para la creación de reportes anónimos.

    Mantiene el contrato actual del modelo existente y añade validación explícita
    de los campos del formulario para HU-01 sin tocar la base de datos ni la
    estructura de migración.
    """

    institucion = serializers.IntegerField(min_value=1, required=True)
    rol_reportante = serializers.ChoiceField(
        choices=("victima", "testigo"),
        required=True,
    )
    grado_victima = serializers.CharField(min_length=1, max_length=50, required=True)
    ubicacion = serializers.ChoiceField(
        choices=(
            "SALON",
            "PASILLOS",
            "BANOS",
            "DESCANSO",
            "SALIDA",
            "INTERNET",
        ),
        required=True,
    )
    frecuencia = serializers.ChoiceField(
        choices=("PRIMERA_VEZ", "SEMANAS", "MESES"),
        required=True,
    )
    tipo_incidente = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        required=True,
    )
    descripcion = serializers.CharField(
        min_length=10,
        max_length=5000,
        trim_whitespace=True,
        required=True,
    )
    fecha_aproximada = serializers.DateField(required=False, allow_null=True)

    def validate_tipo_incidente(self, value: list[str]) -> list[str]:
        """Normaliza la lista de tipos de incidente antes de persistir."""
        tipos = [str(item).strip() for item in value if str(item).strip()]
        if not tipos:
            raise serializers.ValidationError("Debes seleccionar al menos un tipo de incidente.")
        return tipos

    def validate_descripcion(self, value: str) -> str:
        """Quita espacios innecesarios y rechaza descripciones vacías. """
        texto = " ".join(value.split())
        if not texto:
            raise serializers.ValidationError("La descripción no puede estar vacía.")
        return texto

    def validate_fecha_aproximada(self, value):
        """La fecha aproximada no puede ser futura."""
        if value and value > date.today():
            raise serializers.ValidationError("La fecha aproximada no puede ser una fecha futura.")
        return value

    def create(self, validated_data: dict) -> Reporte:
        """
        Delegación al proxy manteniendo el modelo actual de almacenamiento.
        La información adicional del formulario se incorpora a la descripción
        para conservar el contrato existente sin tocar la BD.
        """
        from .repository import ReporteRepositoryProxy

        fecha_aproximada = validated_data.pop("fecha_aproximada", None)
        tipo_incidente = validated_data.pop("tipo_incidente")
        rol_reportante = validated_data.pop("rol_reportante")
        grado_victima = validated_data.pop("grado_victima")
        ubicacion = validated_data.pop("ubicacion")
        frecuencia = validated_data.pop("frecuencia")

        descripcion_base = validated_data["descripcion"]
        descripcion_contexto = (
            f"Rol reportante: {rol_reportante} | "
            f"Grado víctima: {grado_victima} | "
            f"Ubicación: {ubicacion} | "
            f"Frecuencia: {frecuencia}"
        )
        if fecha_aproximada:
            descripcion_contexto += f" | Fecha aproximada: {fecha_aproximada.isoformat()}"

        payload = {
            "institucion": validated_data["institucion"],
            "tipo_incidente": ", ".join(tipo_incidente),
            "descripcion": f"{descripcion_contexto}\n\n{descripcion_base}",
        }

        proxy = ReporteRepositoryProxy()
        return proxy.crear(payload)


class ConsultarReporteSerializer(serializers.Serializer):
    """
    Serializer para la consulta anónima de estado por código de seguimiento.
    Valida que el input sea un UUID válido antes de consultar.
    """

    codigo_seguimiento = serializers.UUIDField(
        help_text="UUID del código de seguimiento entregado al crear el reporte."
    )
