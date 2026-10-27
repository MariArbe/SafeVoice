"""
apps/reports/models.py — Entidades del dominio de reportes.
"""

import uuid
from django.db import models
from django.utils import timezone


class TipoAgresion(models.Model):
    codigo = models.CharField(max_length=30, unique=True, verbose_name="código")
    nombre = models.CharField(max_length=100, verbose_name="nombre")
    descripcion = models.TextField(blank=True, null=True, verbose_name="descripción")

    class Meta:
        db_table = "tipos_agresion"
        verbose_name = "tipo de agresión"
        verbose_name_plural = "tipos de agresión"

    def __str__(self) -> str:
        return self.nombre


class Reporte(models.Model):
    class NivelRiesgo(models.TextChoices):
        BAJO = "BAJO", "Bajo"
        MEDIO = "MEDIO", "Medio"
        ALTO = "ALTO", "Alto"
        CRITICO = "CRITICO", "Crítico"

    class Estado(models.TextChoices):
        NUEVO = "nuevo", "Nuevo"
        EN_REVISION = "en_revision", "En Revisión"
        EN_SEGUIMIENTO = "en_seguimiento", "En Seguimiento"
        CERRADO = "cerrado", "Cerrado"

        # Compatibilidad con datos o tests heredados
        PENDIENTE = "PENDIENTE", "Pendiente"
        ATENDIDO = "ATENDIDO", "Atendido"
        DESCARTADO = "DESCARTADO", "Descartado"

    codigo_seguimiento = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="código de seguimiento"
    )

    institucion = models.ForeignKey(
        "institutions.Institution",
        on_delete=models.CASCADE,
        related_name="reportes",
        verbose_name="institución",
        db_column="institucion_id",
        null=True,
        blank=True
    )

    class Ubicacion(models.TextChoices):
        SALON = "Salón de clases", "Salón de clases"
        PASILLOS = "Pasillos o escaleras", "Pasillos o escaleras"
        BANOS = "Baños", "Baños"
        DESCANSO = "Descanso / zonas deportivas", "Descanso / zonas deportivas"
        SALIDA = "Salida del colegio", "Salida del colegio"
        INTERNET = "Internet / Redes sociales", "Internet / Redes sociales"
        OTRO = "Otro", "Otro"

    ubicacion = models.CharField(
        max_length=500,
        default="",
        verbose_name="ubicación",
        help_text="Lugar o lugares donde ocurrió la agresión (permite múltiples opciones).",
    )
    frecuencia = models.CharField(max_length=100, default="", verbose_name="frecuencia")
    grado_victima = models.CharField(max_length=50, null=True, blank=True, verbose_name="grado de la víctima")
    involucrados_tipo = models.CharField(max_length=50, null=True, blank=True, verbose_name="tipo de involucrados")
    involucrados_grado = models.CharField(max_length=50, null=True, blank=True, verbose_name="grado de involucrados")

    descripcion = models.TextField(default="", verbose_name="descripción")
    evidencia_url = models.CharField(max_length=255, null=True, blank=True, verbose_name="URL de evidencia")

    tipos_agresion = models.ManyToManyField(
        TipoAgresion,
        related_name="reportes",
        verbose_name="tipos de agresión",
        db_table="reportes_tipos_agresion",
        blank=True
    )

    nivel_riesgo_predicho = models.CharField(
        max_length=20, choices=NivelRiesgo.choices, null=True, blank=True, verbose_name="nivel de riesgo predicho"
    )
    nivel_riesgo_confirmado = models.CharField(
        max_length=20, choices=NivelRiesgo.choices, null=True, blank=True, verbose_name="nivel de riesgo confirmado"
    )

    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.NUEVO, verbose_name="estado"
    )

    historial_cambios = models.JSONField(
        default=list,
        blank=True,
        verbose_name="historial de cambios",
        help_text="Auditoría inmutable de transiciones de estado del reporte."
    )

    acepta_revelar_identidad = models.BooleanField(default=False, verbose_name="acepta revelar identidad")
    nombre_contacto_victima = models.TextField(null=True, blank=True, verbose_name="nombre contacto")
    medio_contacto_victima = models.TextField(null=True, blank=True, verbose_name="medio contacto")

    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="última actualización")

    class Meta:
        db_table = "reportes"
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        ordering = ["-fecha_creacion"]

    def __str__(self) -> str:
        return f"Reporte {self.codigo_seguimiento} ({self.fecha_creacion:%Y-%m-%d})"


class SeguimientoCaso(models.Model):
    reporte = models.ForeignKey(
        Reporte,
        on_delete=models.CASCADE,
        related_name="seguimientos",
        verbose_name="reporte"
    )
    orientador = models.ForeignKey(
        "users.Usuario",
        on_delete=models.CASCADE,
        related_name="seguimientos",
        verbose_name="orientador",
        db_column="orientador_id",
        null=True,
        blank=True,
    )
    observaciones = models.TextField(default="", verbose_name="observaciones")
    estado_anterior = models.CharField(max_length=20, null=True, blank=True, verbose_name="estado anterior")
    estado_nuevo = models.CharField(max_length=20, verbose_name="estado nuevo")
    fecha_atencion = models.DateTimeField(default=timezone.now, verbose_name="fecha de atención")

    class Meta:
        db_table = "seguimiento_casos"
        verbose_name = "seguimiento de caso"
        verbose_name_plural = "seguimientos de casos"
        ordering = ["-fecha_atencion"]


