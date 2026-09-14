"""
apps/reports/repository.py — ReporteRepositoryProxy (Patrón Proxy).

═══════════════════════════════════════════════════════════════════════════════
PROPÓSITO Y GARANTÍA DE ANONIMATO
═══════════════════════════════════════════════════════════════════════════════

Este proxy es la ÚNICA interfaz permitida para persistir Reportes.
El service NUNCA interactúa directamente con Reporte.objects.

Mecanismo de protección:
  ALLOWED_FIELDS define la lista blanca de campos que pueden escribirse en la BD.
  Antes de cualquier operación de escritura, el proxy verifica que los datos
  recibidos SOLO contengan campos de esa lista. Si detecta un campo no permitido,
  lanza ReporteCampoNoPermitidoError ANTES de tocar el ORM.

Esto garantiza estructuralmente que ningún dato identificable (IP, sesión,
usuario_id, user_agent, etc.) pueda persistirse en un Reporte, aunque en el
futuro el serializer o el service sean modificados por error.

Flujo de llamadas:
    View → ReporteService → ReporteRepositoryProxy → Reporte.objects (ORM)
                                    ↑
                          Valida ALLOWED_FIELDS aquí
═══════════════════════════════════════════════════════════════════════════════
"""

import logging
import uuid

from .exceptions import ReporteCampoNoPermitidoError, ReporteNoEncontradoError
from .models import Reporte

logger = logging.getLogger(__name__)


class ReporteRepositoryProxy:
    """
    Proxy de acceso a la persistencia de Reporte.

    ALLOWED_FIELDS es la fuente de verdad de qué puede existir en un Reporte.
    Cualquier intento de escribir un campo fuera de esta lista es rechazado.
    """

    # ── Lista blanca de campos permitidos ──────────────────────────────────
    # IMPORTANTE: Solo añadir campos que sean absolutamente anónimos.
    # NUNCA añadir: usuario_id, ip, sesion, user_agent, email, nombre, etc.
    ALLOWED_FIELDS: frozenset[str] = frozenset(
        {
            # Campos del modelo base (Etapa 1)
            "codigo_seguimiento",
            # Campos de contenido que se añadirán en Etapa 2:
            # "descripcion",
            # "tipo_bullying",
            # "nivel_urgencia",
            # "lugar",
            # "fecha_incidente",
        }
    )

    # ── Campos que el ORM gestiona automáticamente (no se validan) ─────────
    _CAMPOS_AUTOMATICOS: frozenset[str] = frozenset(
        {"fecha_creacion", "fecha_actualizacion", "id"}
    )

    def _validar_campos(self, datos: dict) -> None:
        """
        Verifica que todos los campos en `datos` estén en la lista blanca.

        Raises:
            ReporteCampoNoPermitidoError: Si algún campo no está permitido.
        """
        campos_recibidos = frozenset(datos.keys())
        campos_prohibidos = campos_recibidos - self.ALLOWED_FIELDS - self._CAMPOS_AUTOMATICOS

        if campos_prohibidos:
            logger.error(
                "PROXY: Intento de persistir campos no permitidos en Reporte: %s. "
                "Operación bloqueada.",
                campos_prohibidos,
            )
            raise ReporteCampoNoPermitidoError(
                campos_prohibidos=list(campos_prohibidos)
            )

    # ── Operaciones de escritura ───────────────────────────────────────────

    def crear(self, datos: dict) -> Reporte:
        """
        Crea y persiste un nuevo Reporte.

        Args:
            datos: Diccionario con los campos del reporte. Solo se permiten
                   los campos definidos en ALLOWED_FIELDS.

        Returns:
            Instancia del Reporte recién creado.

        Raises:
            ReporteCampoNoPermitidoError: Si `datos` contiene campos no permitidos.
        """
        self._validar_campos(datos)
        reporte = Reporte.objects.create(**datos)
        logger.info(
            "Reporte creado exitosamente: codigo_seguimiento=%s",
            reporte.codigo_seguimiento,
        )
        return reporte

    # ── Operaciones de lectura ─────────────────────────────────────────────

    def obtener_por_codigo(self, codigo: uuid.UUID) -> Reporte:
        """
        Obtiene un reporte por su código de seguimiento público.

        Args:
            codigo: UUID del código de seguimiento.

        Returns:
            Instancia del Reporte encontrado.

        Raises:
            ReporteNoEncontradoError: Si no existe un reporte con ese código.
        """
        try:
            return Reporte.objects.get(codigo_seguimiento=codigo)
        except Reporte.DoesNotExist:
            raise ReporteNoEncontradoError()

    def listar_todos(self):
        """
        Retorna todos los reportes ordenados por fecha de creación descendente.
        Solo accesible por usuarios autenticados (Directivo/Orientador).

        Returns:
            QuerySet de Reporte.
        """
        return Reporte.objects.all()
