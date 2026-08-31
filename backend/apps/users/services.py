"""
apps/users/services.py — Capa de lógica de negocio del dominio de usuarios.

REGLA: Las views NO acceden al ORM directamente.
       Todo acceso a datos pasa por este service.

En esta primera etapa el service está estructurado pero vacío de lógica;
los métodos lanzarán NotImplementedError hasta que se implementen en etapas
posteriores.
"""

import logging

from django.contrib.auth import authenticate

from .exceptions import CredencialesInvalidasError, UsuarioInactivoError
from .models import Usuario

logger = logging.getLogger(__name__)


class UsuarioService:
    """
    Service de usuarios. Encapsula toda la lógica de negocio relacionada
    con creación, autenticación y gestión de usuarios.

    Diseñado para ser stateless: no almacena estado entre llamadas.
    Las views instancian este service en cada request.
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
            datos_validados: dict con los campos del CrearUsuarioSerializer ya
                             validados (sin password en texto plano tras el save).

        Returns:
            Instancia del Usuario recién creado.

        Note:
            El hasheo de la contraseña lo realiza el serializer vía set_password().
            Este método solo orquesta la creación.
        """
        # TODO: Implementar en Etapa 2 (endpoints funcionales)
        raise NotImplementedError("crear_usuario se implementará en Etapa 2.")

    # ── Consulta ───────────────────────────────────────────────────────────

    def obtener_por_id(self, usuario_id: int) -> Usuario:
        """
        Obtiene un usuario por su ID primario.

        Raises:
            Usuario.DoesNotExist: Si no existe un usuario con ese ID.
        """
        # TODO: Implementar en Etapa 2
        raise NotImplementedError("obtener_por_id se implementará en Etapa 2.")

    def listar_por_rol(self, rol: str) -> "QuerySet[Usuario]":
        """
        Retorna todos los usuarios activos con el rol indicado.

        Args:
            rol: Valor de Usuario.RolUsuario (ej. 'DIRECTIVO').
        """
        # TODO: Implementar en Etapa 2
        raise NotImplementedError("listar_por_rol se implementará en Etapa 2.")
