"""
apps/institutions/models.py — Entidad Institution del dominio de instituciones.

Decisión de diseño:
  - Institution se define en su propia app para mantener separación de
    responsabilidades. Usuario tiene una FK a Institution (no al revés),
    lo que permite que en el futuro una institución exista sin usuarios y
    que se puedan añadir más roles sin refactorizar este modelo.
  - codigo_dane tiene un UniqueConstraint a nivel de BD (no solo serializer)
    para garantizar integridad incluso ante inserciones directas en SQL.
"""

from django.db import models


class Institution(models.Model):
    """
    Institución educativa registrada en SafeVoice.

    Una institución es la unidad de aislamiento de datos: los reportes,
    orientadores y directivos quedan encapsulados dentro de su institución.
    El campo `institution_id` (PK) es el identificador único que se propaga
    a Usuario y Reporte para mantener el alcance correcto.
    """

    nombre = models.CharField(
        max_length=150,
        verbose_name="nombre de la institución",
        help_text="Nombre completo del colegio o institución educativa.",
    )

    codigo_dane = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        unique=True,
        verbose_name="código DANE / NIT",
        help_text=(
            "Código DANE o NIT institucional. No puede repetirse cuando se informa."
        ),
    )

    ciudad = models.CharField(
        max_length=100,
        verbose_name="ciudad",
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="activa",
        help_text="Desactivar impide el acceso de todos sus usuarios sin borrar registros.",
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de registro",
    )

    class Meta:
        db_table = "instituciones"
        verbose_name = "institución"
        verbose_name_plural = "instituciones"
        ordering = ["nombre"]
        constraints = [
            # Constraint explícito a nivel BD para unicidad del código institucional.
            models.UniqueConstraint(
                fields=["codigo_dane"],
                name="uq_institucion_codigo_dane",
            )
        ]

    def __str__(self) -> str:
        return f"{self.nombre} ({self.codigo_dane or 'sin código'})"
