"""
apps/users/models.py — Entidades del dominio de usuarios.

Decisión de diseño:
  - `Usuario` extiende `AbstractUser` para heredar el sistema de autenticación
    de Django (password hashing, sesiones, admin) sin reescribirlo.
  - `RolUsuario` se implementa como `TextChoices` (enum interno) porque el
    sistema define exactamente dos roles fijos que no variarán en tiempo de
    ejecución. Ver implementation_plan.md §Decisión 1 para la justificación completa.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """
    Modelo de usuario del sistema SafeVoice.

    Extiende AbstractUser para conservar el mecanismo estándar de autenticación
    de Django. Añade únicamente el campo `rol` que diferencia entre Directivo
    y Orientador.

    El campo `email` se convierte en campo de login principal (USERNAME_FIELD).
    El campo `username` de AbstractUser se mantiene pero no es requerido.
    """

    class RolUsuario(models.TextChoices):
        """
        Roles disponibles en el sistema.

        TextChoices persiste el valor como varchar en la BD y proporciona
        validación a nivel ORM sin necesidad de una tabla adicional.
        """
        DIRECTIVO = "DIRECTIVO", "Directivo"
        ORIENTADOR = "ORIENTADOR", "Orientador"

    # Reemplaza 'username' por 'email' como identificador de autenticación
    email = models.EmailField(
        unique=True,
        verbose_name="correo electrónico",
        help_text="Usado como identificador de inicio de sesión.",
    )

    rol = models.CharField(
        max_length=20,
        choices=RolUsuario.choices,
        verbose_name="rol",
        help_text="Define el nivel de acceso del usuario dentro del sistema.",
    )

    # Campos de AbstractUser que se mantienen pero no son el identificador
    # username se conserva por compatibilidad con el admin de Django
    USERNAME_FIELD = "email"
    # REQUIRED_FIELDS se usa solo en createsuperuser; excluye USERNAME_FIELD
    REQUIRED_FIELDS = ["username", "rol"]

    class Meta:
        db_table = "usuarios"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ["email"]

    def __str__(self) -> str:
        return f"{self.email} ({self.get_rol_display()})"

    @property
    def es_directivo(self) -> bool:
        """Shorthand para verificar rol sin comparar strings en views/services."""
        return self.rol == self.RolUsuario.DIRECTIVO

    @property
    def es_orientador(self) -> bool:
        """Shorthand para verificar rol sin comparar strings en views/services."""
        return self.rol == self.RolUsuario.ORIENTADOR
