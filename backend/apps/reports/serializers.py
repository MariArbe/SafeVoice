"""
apps/reports/serializers.py — Serializers (DTOs) del dominio de reportes.

El serializer actúa como primera capa de validación de entrada.
El ReporteRepositoryProxy actúa como segunda capa (lista blanca en BD).
Ambas capas son independientes para garantizar anonimato en profundidad.
"""

from datetime import date

from rest_framework import serializers

from .models import Reporte, SeguimientoCaso, TipoAgresion


CATALOGO_TIPOS_BASE = {
    "VERBAL": (
        "Agresión Verbal",
        "Insultos, apodos denigrantes, burlas ofensivas o amenazas verbales reiteradas.",
    ),
    "FISICA": (
        "Agresión Física",
        "Golpes, empujones, zancadillas o agresión física directa.",
    ),
    "CIBERBULLYING": (
        "Ciberacoso / Digital",
        "Hostigamiento en redes sociales, difusión de mensajes o fotos sin permiso.",
    ),
    "EXCLUSION": (
        "Exclusión Social",
        "Aislamiento deliberado, ley del hielo o propagación de rumores difamatorios.",
    ),
    "PSICOLOGICA": (
        "Intimidación Psicológica",
        "Chantaje, amenazas veladas, manipulación y hostigamiento emocional.",
    ),
    "MATERIAL": (
        "Daño a Pertenencias",
        "Quitar, esconder, robar o dañar pertenencias personales o útiles escolares.",
    ),
}

ALIAS_TIPOS_AGRESION = {
    "verbal": "VERBAL",
    "agresión verbal": "VERBAL",
    "agresion verbal": "VERBAL",
    "insultos, gritos o apodos ofensivos": "VERBAL",
    "fisica": "FISICA",
    "física": "FISICA",
    "agresión física": "FISICA",
    "agresion fisica": "FISICA",
    "me pegaron, empujaron o lastimaron (o a mi compañero/a)": "FISICA",
    "ciberbullying": "CIBERBULLYING",
    "ciberacoso": "CIBERBULLYING",
    "ciberacoso / digital": "CIBERBULLYING",
    "ciberacoso / redes": "CIBERBULLYING",
    "ciberacoso (mensajes, fotos sin permiso, redes sociales)": "CIBERBULLYING",
    "exclusion": "EXCLUSION",
    "exclusión": "EXCLUSION",
    "exclusión social": "EXCLUSION",
    "exclusion social": "EXCLUSION",
    "social": "EXCLUSION",
    "inventaron chismes, amenazaron o me excluyeron del grupo": "EXCLUSION",
    "psicologica": "PSICOLOGICA",
    "psicológica": "PSICOLOGICA",
    "intimidación psicológica": "PSICOLOGICA",
    "intimidacion psicologica": "PSICOLOGICA",
    "material": "MATERIAL",
    "daño a pertenencias": "MATERIAL",
    "daño a bienes": "MATERIAL",
    "dano a pertenencias": "MATERIAL",
    "me quitaron, escondieron o dañaron cosas": "MATERIAL",
}


def resolver_objetos_tipo_agresion(valores) -> list[TipoAgresion]:
    """
    Convierte una lista heterogénea de IDs, códigos o nombres de tipos de agresión
    en instancias válidas de TipoAgresion (creándolas si pertenecen al catálogo base
    y aún no existen en la base de datos).
    """
    if valores is None:
        return []
    if isinstance(valores, str):
        valores = [v.strip() for v in valores.split(",") if v.strip()]

    objetos = []
    vistos = set()

    for val in valores:
        if isinstance(val, TipoAgresion):
            if val.pk not in vistos:
                objetos.append(val)
                vistos.add(val.pk)
            continue

        if isinstance(val, dict):
            val = val.get("codigo") or val.get("id") or val.get("nombre") or ""

        # Si es ID numérico
        if isinstance(val, int) or (isinstance(val, str) and val.strip().isdigit()):
            pk = int(val)
            existente = TipoAgresion.objects.filter(pk=pk).first()
            if existente:
                if existente.pk not in vistos:
                    objetos.append(existente)
                    vistos.add(existente.pk)
                continue
            # Fallback por orden estándar si el ID aún no estaba sembrado
            mapa_id_codigo = {
                1: "VERBAL",
                2: "FISICA",
                3: "CIBERBULLYING",
                4: "EXCLUSION",
                5: "PSICOLOGICA",
                6: "MATERIAL",
            }
            val = mapa_id_codigo.get(pk, str(pk))

        if isinstance(val, str) and val.strip():
            limpio = val.strip()
            codigo_canonico = ALIAS_TIPOS_AGRESION.get(limpio.lower())
            if not codigo_canonico:
                # Buscar por nombre o código existente
                existente = (
                    TipoAgresion.objects.filter(codigo__iexact=limpio).first()
                    or TipoAgresion.objects.filter(nombre__iexact=limpio).first()
                )
                if existente:
                    if existente.pk not in vistos:
                        objetos.append(existente)
                        vistos.add(existente.pk)
                    continue
                codigo_canonico = limpio.upper()[:30]

            existente = TipoAgresion.objects.filter(codigo__iexact=codigo_canonico).first()
            if not existente:
                nombre_def, desc_def = CATALOGO_TIPOS_BASE.get(
                    codigo_canonico, (limpio.title(), "")
                )
                existente, _ = TipoAgresion.objects.get_or_create(
                    codigo=codigo_canonico,
                    defaults={"nombre": nombre_def, "descripcion": desc_def},
                )
            if existente.pk not in vistos:
                objetos.append(existente)
                vistos.add(existente.pk)

    return objetos


class TipoAgresionSerializer(serializers.ModelSerializer):
    """Serializer ligero para exponer los tipos de agresión asociados a un reporte."""

    class Meta:
        model = TipoAgresion
        fields = ["id", "codigo", "nombre"]
        read_only_fields = fields


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
    tipos_agresion = TipoAgresionSerializer(many=True, read_only=True)

    class Meta:
        model = Reporte
        fields = [
            "id",
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
            "evidencia_url",
            "institucion_id",
            "tipos_agresion",
            "acepta_revelar_identidad",
            "nombre_contacto_victima",
            "medio_contacto_victima",
            "historial_cambios",
            "historial_estados",
        ]
        read_only_fields = fields


class ReporteConsultaPublicaSerializer(serializers.ModelSerializer):
    """
    Serializer seguro de solo lectura para la consulta pública por código (HU-04).
    Omite deliberadamente datos de contacto personal (nombre_contacto_victima,
    medio_contacto_victima), la narrativa sensible (descripcion) y URLs de archivos
    para garantizar privacidad en endpoints sin autenticación.
    """

    historial_estados = HistorialEstadoSerializer(
        source="seguimientos", many=True, read_only=True,
    )

    class Meta:
        model = Reporte
        fields = [
            "id",
            "codigo_seguimiento",
            "fecha_creacion",
            "fecha_actualizacion",
            "estado",
            "ubicacion",
            "frecuencia",
            "acepta_revelar_identidad",
            "historial_cambios",
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

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        if "ubicaciones" in data and not data.get("ubicacion"):
            data["ubicacion"] = data["ubicaciones"]
        if "ubicacion" in data and isinstance(data["ubicacion"], list):
            data["ubicacion"] = ", ".join(str(u).strip() for u in data["ubicacion"] if str(u).strip())
        if "tipo_agresion" in data and "tipos_agresion" not in data:
            raw_tipo = data.get("tipo_agresion")
            data["tipos_agresion"] = raw_tipo if isinstance(raw_tipo, list) else ([raw_tipo] if raw_tipo else [])
        if "tipos_agresion" in data and data["tipos_agresion"] is not None:
            objetos = resolver_objetos_tipo_agresion(data["tipos_agresion"])
            data["tipos_agresion"] = [obj.pk for obj in objetos]
        return super().to_internal_value(data)

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
    Serializer para la consulta anónima de estado por código de seguimiento (HU-04).
    Valida que el input sea un UUID válido antes de consultar.
    Soporta tanto 'codigo_seguimiento' como 'codigo' en los query params.
    """

    codigo_seguimiento = serializers.UUIDField(
        required=False,
        help_text="UUID del código de seguimiento entregado al crear el reporte.",
    )
    codigo = serializers.UUIDField(
        required=False,
        help_text="Alias de codigo_seguimiento para consultas por query param ?codigo=.",
    )

    def validate(self, attrs):
        codigo = attrs.get("codigo_seguimiento") or attrs.get("codigo")
        if not codigo:
            raise serializers.ValidationError(
                {"codigo_seguimiento": "Debes proporcionar un código de seguimiento válido."}
            )
        attrs["codigo_seguimiento"] = codigo
        return attrs


class ActualizarEstadoSerializer(serializers.Serializer):
    """
    Serializer de entrada para PATCH /reportes/<id>/estado/ (HU-08).
    Valida el nuevo estado y el comentario opcional del orientador.
    """

    nuevo_estado = serializers.CharField(
        required=False,
        help_text="Nuevo estado al que se quiere transicionar el reporte.",
    )
    estado = serializers.CharField(
        required=False,
        help_text="Alias de nuevo_estado para flexibilidad con clientes API.",
    )
    comentario = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Comentario u observación del orientador sobre el cambio de estado.",
    )
    observaciones = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Alias de comentario para compatibilidad hacia atrás.",
    )

    def validate(self, attrs):
        nuevo_estado = attrs.get("nuevo_estado") or attrs.get("estado")
        if not nuevo_estado:
            raise serializers.ValidationError(
                {"nuevo_estado": "El campo 'nuevo_estado' es requerido."}
            )
        attrs["nuevo_estado"] = nuevo_estado.strip().lower()
        attrs["comentario"] = (attrs.get("comentario") or attrs.get("observaciones") or "").strip()
        attrs["observaciones"] = attrs["comentario"]
        return attrs


class ActualizarClasificacionSerializer(serializers.Serializer):
    """
    Serializer de entrada para PATCH /api/v1/reports/<id>/clasificacion/.
    Permite a docentes/orientadores/directivos confirmar el nivel de riesgo predicho por IA,
    modificarlo manualmente (BAJO, MEDIO, ALTO, CRITICO) y/o actualizar los tipos de agresión.
    """

    NIVELES_VALIDOS = ("BAJO", "MEDIO", "ALTO", "CRITICO")

    nivel_riesgo_confirmado = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Nivel de riesgo confirmado o ajustado por el docente (BAJO, MEDIO, ALTO, CRITICO).",
    )
    nivel_riesgo = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Alias de nivel_riesgo_confirmado.",
    )
    confirmar_ia = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Si es True y no se envía nivel_riesgo_confirmado, confirma el riesgo predicho por la IA.",
    )
    tipos_agresion = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        help_text="Lista de códigos, nombres o IDs de tipos de agresión confirmados por el docente.",
    )
    comentario = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Motivo u observación opcional sobre el ajuste o confirmación.",
    )

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        if "tipos_agresion" in data and isinstance(data["tipos_agresion"], list):
            normalizados = []
            for item in data["tipos_agresion"]:
                if isinstance(item, dict):
                    val = item.get("codigo") or item.get("id") or item.get("nombre")
                    if val is not None:
                        normalizados.append(str(val))
                elif item is not None:
                    normalizados.append(str(item))
            data["tipos_agresion"] = normalizados
        return super().to_internal_value(data)

    def validate(self, attrs):
        riesgo_raw = attrs.get("nivel_riesgo_confirmado") or attrs.get("nivel_riesgo")
        confirmar_ia = bool(attrs.get("confirmar_ia", False))
        tiene_tipos = "tipos_agresion" in attrs

        if not riesgo_raw and not confirmar_ia and not tiene_tipos:
            raise serializers.ValidationError(
                "Debe proporcionar 'nivel_riesgo_confirmado', 'confirmar_ia=true' o 'tipos_agresion'."
            )

        if riesgo_raw:
            riesgo_norm = (
                riesgo_raw.strip()
                .upper()
                .replace("Í", "I")
            )
            if riesgo_norm not in self.NIVELES_VALIDOS:
                raise serializers.ValidationError(
                    {
                        "nivel_riesgo_confirmado": f"Nivel de riesgo inválido '{riesgo_raw}'. Opciones válidas: {', '.join(self.NIVELES_VALIDOS)}."
                    }
                )
            attrs["nivel_riesgo_confirmado"] = riesgo_norm
        else:
            attrs["nivel_riesgo_confirmado"] = None

        attrs["comentario"] = (attrs.get("comentario") or "").strip()
        return attrs


class HistorialEntradaSerializer(serializers.Serializer):
    """
    Serializer de solo lectura para exponer registros de auditoría
    del historial de cambios de estado (HU-08).
    """

    estado_anterior = serializers.CharField()
    estado_nuevo = serializers.CharField()
    usuario_id = serializers.IntegerField(required=False, allow_null=True)
    usuario_nombre = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    nombre_orientador = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    fecha_cambio = serializers.CharField()
    fecha = serializers.CharField(required=False)
    comentario = serializers.CharField(allow_blank=True, default="")
    tipo_accion = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    metadata = serializers.DictField(required=False, default=dict)


class FiltroFechasSerializer(serializers.Serializer):
    """Filtro opcional por rango de fechas (YYYY-MM-DD) para estadísticas y mapa de calor."""

    fecha_inicio = serializers.DateField(required=False)
    fecha_fin = serializers.DateField(required=False)

    def validate(self, attrs):
        inicio, fin = attrs.get("fecha_inicio"), attrs.get("fecha_fin")
        if inicio and fin and inicio > fin:
            raise serializers.ValidationError(
                {"fecha_fin": "La fecha final no puede ser anterior a la fecha inicial."}
            )
        return attrs
