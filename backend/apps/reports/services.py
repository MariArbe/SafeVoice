"""
apps/reports/services.py — Capa de lógica de negocio del dominio de reportes.

REGLA: Las views NO acceden al ORM ni al proxy directamente.
       Todo acceso a datos pasa por este service.
       El service accede al ORM EXCLUSIVAMENTE a través de ReporteRepositoryProxy.
"""

import logging
import uuid

from .exceptions import ReporteNoEncontradoError
from .models import Reporte
from .repository import ReporteRepositoryProxy

logger = logging.getLogger(__name__)

# Instancia del proxy — compartida por el service (stateless, thread-safe)
_proxy = ReporteRepositoryProxy()


class ReporteService:
    """
    Service de reportes. Orquesta la lógica de negocio de creación y
    consulta de reportes anónimos.

    El service es la única clase que interactúa con ReporteRepositoryProxy.
    """

    # ── Creación de reportes ───────────────────────────────────────────────

    def crear_reporte(self, datos_validados: dict) -> Reporte:
        """
        Crea un nuevo reporte anónimo.

        El proxy valida que los datos no contengan campos no permitidos
        antes de persistir. El service no necesita revalidar.

        Args:
            datos_validados: dict ya validado por CrearReporteSerializer.

        Returns:
            Instancia del Reporte creado.

        Raises:
            ReporteCampoNoPermitidoError: Si el serializer o el service
                (por error) incluyeron campos no permitidos.
        """
        # TODO (Etapa 2): Añadir lógica de negocio (validación de contenido,
        #                 notificaciones, etc.) antes de delegar al proxy.
        reporte = _proxy.crear(datos_validados)
        logger.info(
            "Reporte creado vía service: codigo=%s",
            reporte.codigo_seguimiento,
        )
        return reporte

    # ── Consulta pública (anónima) ─────────────────────────────────────────

    def consultar_por_codigo(self, codigo: uuid.UUID) -> Reporte:
        """
        Consulta el estado de un reporte por su código de seguimiento público.
        No requiere autenticación.

        Args:
            codigo: UUID del código de seguimiento.

        Returns:
            Instancia del Reporte.

        Raises:
            ReporteNoEncontradoError: Si el código no existe.
        """
        return _proxy.obtener_por_codigo(codigo)

    # ── Consulta para personal autorizado ─────────────────────────────────

    def listar_reportes(self):
        """
        Lista todos los reportes. Solo accesible por Directivo/Orientador.
        La view es responsable de aplicar los permisos antes de llamar este método.

        Returns:
            QuerySet de Reporte ordenado por fecha descendente.
        """
        # TODO (Etapa 2): Añadir filtros, paginación, etc.
        return _proxy.listar_todos()
