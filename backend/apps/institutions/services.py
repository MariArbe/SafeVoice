"""
apps/institutions/services.py — Lógica de negocio del dominio de instituciones.

REGLA: Las views NO acceden al ORM directamente.
       Todo acceso a datos pasa por este service.

La operación central es registrar_institucion(), que ejecuta en una sola
transacción atómica la creación de la institución y del usuario directivo.
Si cualquier paso falla, toda la operación se revierte.
"""

import logging

from django.db import IntegrityError, transaction

from apps.users.models import Usuario

from .exceptions import (
    InstitucionDuplicadaError,
    InstitucionNoEncontradaError,
    UsuarioDirectivoDuplicadoError,
)
from .models import Institution

logger = logging.getLogger(__name__)


class InstitutionService:
    """
    Service de instituciones. Encapsula toda la lógica de negocio
    relacionada con creación y gestión de instituciones educativas.

    Diseñado para ser stateless: no almacena estado entre llamadas.
    """

    def registrar_institucion(
        self, datos_institucion: dict, datos_directivo: dict
    ) -> tuple[Institution, Usuario]:
        """
        Registra una nueva institución y crea el usuario directivo asociado
        en una sola transacción atómica (HU-11).

        Args:
            datos_institucion: dict con campos validados de la institución
                               (nombre, codigo_dane, ciudad).
            datos_directivo: dict con campos validados del directivo
                             (email, first_name, last_name, password).

        Returns:
            Tupla (institution, usuario_directivo) recién creados.

        Raises:
            InstitucionDuplicadaError: Si el NIT ya existe (captura IntegrityError
                                       del constraint de BD para manejar race conditions).
        """
        try:
            with transaction.atomic():
                # 1. Crear la institución
                institution = Institution.objects.create(
                    nombre=datos_institucion["nombre"].strip(),
                    codigo_dane=datos_institucion.get("codigo_dane"),
                    ciudad=datos_institucion["ciudad"].strip(),
                )

                # 2. Crear el usuario directivo asociado a la institución
                password = datos_directivo.pop("password")
                email = datos_directivo["email"]

                usuario = Usuario(
                    email=email,
                    username=email,  # AbstractUser requiere username; usamos email
                    first_name=datos_directivo.get("first_name", ""),
                    last_name=datos_directivo.get("last_name", ""),
                    rol=Usuario.RolUsuario.DIRECTIVO,
                    institution=institution,
                )
                usuario.set_password(password)
                usuario.save()

                logger.info(
                    "Institución registrada: %s (código: %s) — Directivo: %s",
                    institution.nombre,
                    institution.codigo_dane,
                    email,
                )
                return institution, usuario

        except IntegrityError as exc:
            # Captura race conditions donde dos requests simultáneos intentan
            # registrar el mismo código o correo.
            logger.warning(
                "IntegrityError al registrar institución. Error: %s",
                exc,
            )
            codigo_dane = datos_institucion.get("codigo_dane")
            if codigo_dane and Institution.objects.filter(codigo_dane=codigo_dane).exists():
                raise InstitucionDuplicadaError() from exc
            email = datos_directivo.get("email")
            if email and Usuario.objects.filter(email__iexact=email).exists():
                raise UsuarioDirectivoDuplicadoError() from exc
            raise

    def obtener_por_id(self, institution_id: int) -> Institution:
        """
        Obtiene una institución por su ID primario.

        Raises:
            InstitucionNoEncontradaError: Si no existe una institución con ese ID.
        """
        try:
            return Institution.objects.get(pk=institution_id)
        except Institution.DoesNotExist as exc:
            raise InstitucionNoEncontradaError() from exc

    def listar_activas(self):
        """Retorna todas las instituciones activas."""
        return Institution.objects.filter(is_active=True)
