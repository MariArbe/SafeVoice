from django.db import models


class Recurso(models.Model):
    """Recurso de ayuda disponible para estudiantes."""

    class Categoria(models.TextChoices):
        LINEA_DE_AYUDA = "LINEA_DE_AYUDA", "Línea de ayuda"
        ORIENTACION = "ORIENTACION", "Orientación"
        PROFESOR = "PROFESOR", "Profesor de confianza"
        OTRO = "OTRO", "Otro"

    titulo = models.CharField(max_length=150, verbose_name="título")
    categoria = models.CharField(
        max_length=30,
        choices=Categoria.choices,
        default=Categoria.OTRO,
        verbose_name="categoría",
    )
    descripcion = models.TextField(verbose_name="descripción")
    telefono = models.CharField(max_length=50, blank=True, default="", verbose_name="teléfono")
    correo = models.EmailField(blank=True, default="", verbose_name="correo")
    url = models.URLField(blank=True, default="", verbose_name="enlace")
    activo = models.BooleanField(default=True, verbose_name="activo")
    orden = models.PositiveIntegerField(default=0, verbose_name="orden")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "recursos"
        verbose_name = "recurso"
        verbose_name_plural = "recursos"
        ordering = ["orden", "titulo"]

    def __str__(self):
        return self.titulo
