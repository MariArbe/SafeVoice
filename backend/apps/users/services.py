"""
apps/users/services.py — Capa de lógica de negocio del dominio de usuarios.

REGLA: Las views NO acceden al ORM directamente.
       Todo acceso a datos pasa por este service.
"""

import logging

from django.contrib.auth import authenticate
from django.db import models as django_models

from .exceptions import CredencialesInvalidasError, UsuarioInactivoError
from .models import Usuario

logger = logging.getLogger(__name__)


class UsuarioService:
    """
    Service de usuarios. Encapsula toda la lógica de negocio relacionada
    con creación, autenticación y gestión de usuarios.

    Diseñado para ser stateless: no almacena estado entre llamadas.
    Las views instancian este service al inicio (módulo-nivel), no por request.
    """

    # ── Autenticación ──────────────────────────────────────────────────────

    def autenticar(self, email: str, password: str) -> Usuario:
        """
        Verifica las credenciales y retorna el usuario autenticado.

        Raises:
            CredencialesInvalidasError: Si el email/password son incorrectos.
            UsuarioInactivoError: Si el usuario existe pero está desactivado.
        """
        # authenticate() devuelve None si las credenciales son incorrectas
        usuario = authenticate(username=email, password=password)

        if usuario is None:
            logger.warning("Intento de login fallido para email: %s", email)
            raise CredencialesInvalidasError()

        if not usuario.is_active:
            logger.warning("Intento de login de usuario inactivo: %s", email)
            raise UsuarioInactivoError()

        logger.info("Login exitoso: %s (rol=%s)", email, usuario.rol)
        return usuario

    # ── Creación ───────────────────────────────────────────────────────────

    def crear_usuario(self, datos_validados: dict) -> Usuario:
        """
        Crea un nuevo usuario a partir de datos ya validados por el serializer.

        Args:
            datos_validados: dict con los campos ya validados. Puede incluir
                             la clave 'institution' (objeto Institution) para
                             asignar la FK directamente.

        Returns:
            Instancia del Usuario recién creado.

        Note:
            Este método espera datos ya validados (sin password_confirmacion).
            El hasheo de la contraseña se realiza aquí vía set_password().
        """
        # Extraer institution antes de crear (no es un campo del modelo directamente)
        institution = datos_validados.pop("institution", None)
        password = datos_validados.pop("password")

        email = datos_validados.get("email", "")
        datos_validados.setdefault("username", email)

        usuario = Usuario(**datos_validados)
        usuario.set_password(password)

        if institution is not None:
            usuario.institution = institution

        usuario.save()

        logger.info(
            "Usuario creado: %s (rol=%s, institution=%s)",
            usuario.email,
            usuario.rol,
            getattr(institution, "id", None),
        )
        return usuario

    # ── Consulta ───────────────────────────────────────────────────────────

    def obtener_por_id(self, usuario_id: int) -> Usuario:
        """
        Obtiene un usuario por su ID primario.

        Raises:
            Usuario.DoesNotExist: Si no existe un usuario con ese ID.
        """
        return Usuario.objects.select_related("institution").get(pk=usuario_id)

    def listar_por_rol(self, rol: str) -> "django_models.QuerySet[Usuario]":
        """
        Retorna todos los usuarios activos con el rol indicado.

        Args:
            rol: Valor de Usuario.RolUsuario (ej. 'DIRECTIVO').
        """
        return (
            Usuario.objects.select_related("institution")
            .filter(rol=rol, is_active=True)
            .order_by("email")
        )

    def listar_por_institucion(self, institution_id: int) -> "django_models.QuerySet[Usuario]":
        """
        Retorna todos los usuarios activos de una institución específica.
        Útil para que el directivo vea los orientadores de su institución.

        Args:
            institution_id: ID primario de la institución.
        """
        return (
            Usuario.objects.select_related("institution")
            .filter(institution_id=institution_id, is_active=True)
            .order_by("rol", "email")
        )
