"""
apps/reports/models.py — Entidades del dominio de reportes.

Decisión de diseño fundamental:
  `Reporte` NO tiene ninguna FK ni relación con `Usuario`.
  El anonimato es estructural: es imposible vincular un reporte a un
  remitente desde la base de datos, no por política de aplicación.

  Ver implementation_plan.md §Decisión 2 para la justificación completa.
  Ver repository.py para la segunda capa de protección (Proxy pattern).
"""

import uuid

from django.db import models


class Reporte(models.Model):
    """
    Modelo base de reporte anónimo de bullying.

    Invariante de anonimato:
      - Sin FK a Usuario ni a ninguna entidad identificable.
      - Sin campo de IP, sesión, user-agent ni ningún metadato del remitente.
      - El único vínculo externo permitido en el futuro es hacia una entidad
        `GestionCaso` (no hacia el denunciante).

    El campo `codigo_seguimiento` es un UUID público que el denunciante puede
    usar para consultar el estado de su reporte SIN que quede vinculado a su
    identidad (es imposible saber quién generó ese UUID).

    Los campos de contenido se añadirán en Etapa 2 junto con la lógica de
    negocio completa.
    """

    codigo_seguimiento = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="código de seguimiento",
        help_text=(
            "UUID público generado automáticamente. Permite al denunciante "
            "consultar el estado de su reporte de forma anónima."
        ),
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de creación",
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="última actualización",
    )

    # ── Campos de contenido (esqueleto — se completarán en Etapa 2) ─────────
    # Los campos de descripción, tipo de bullying, nivel de urgencia, etc.
    # se añadirán junto con las migraciones de Etapa 2.

    class Meta:
        db_table = "reportes"
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        ordering = ["-fecha_creacion"]

    def __str__(self) -> str:
        return f"Reporte {self.codigo_seguimiento} ({self.fecha_creacion:%Y-%m-%d})"
