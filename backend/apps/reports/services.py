"""
apps/reports/services.py — Capa de lógica de negocio del dominio de reportes.

REGLA: Las views NO acceden al ORM ni al proxy directamente.
       Todo acceso a datos pasa por este service.
       El service accede al ORM EXCLUSIVAMENTE a través de ReporteRepositoryProxy.
"""

import logging
import uuid

from django.db import transaction

from .exceptions import ReporteNoEncontradoError
from .models import Reporte, SeguimientoCaso
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
        
        # --- NUEVO: Integración del modelo de IA ---
        from .ml_service import predecir_nivel_riesgo
        
        riesgo = predecir_nivel_riesgo(
            descripcion=datos_validados.get("descripcion", ""),
            frecuencia=datos_validados.get("frecuencia", ""),
            ubicacion=datos_validados.get("ubicacion", ""),
            involucrados_tipo=datos_validados.get("involucrados_tipo", "")
        )
        datos_validados["nivel_riesgo_predicho"] = riesgo
        # -------------------------------------------

        reporte = _proxy.crear(datos_validados)
        
        # --- NUEVO: Notificación de nuevo reporte (HU-06) ---
        from django.core.mail import send_mail
        from django.conf import settings
        import threading
        
        def enviar_alerta_correo():
            try:
                mensaje = (
                    f"Se ha recibido un nuevo reporte anónimo en el sistema.\n"
                    f"Nivel de Riesgo Inicial: {riesgo}\n"
                    f"Ubicación: {reporte.ubicacion}\n\n"
                    f"Por favor ingrese a la bandeja de reportes de SafeVoice para revisarlo."
                )
                # En un entorno real, el destinatario sería dinámico según la institución
                destinatario = "orientador@colegio.edu.co" 
                
                send_mail(
                    subject=f"[SafeVoice] Alerta: Nuevo Reporte ({riesgo})",
                    message=mensaje,
                    from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else "alertas@safevoice.com",
                    recipient_list=[destinatario],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Fallo al enviar notificación por correo: {e}")
                
        # Ejecutar en un hilo en segundo plano para no bloquear la respuesta HTTP
        threading.Thread(target=enviar_alerta_correo).start()
        # ----------------------------------------------------

        logger.info(
            "Reporte creado vía service: codigo=%s | riesgo=%s",
            reporte.codigo_seguimiento,
            riesgo
        )
        return reporte

    # ── Actualización de estado (HU-08) ────────────────────────────────────

    def actualizar_estado(
        self,
        reporte_id: int,
        nuevo_estado: str,
        usuario,
        observaciones: str = "",
    ) -> Reporte:
        """
        Actualiza el estado de un reporte y registra el cambio en el
        historial de auditoría (SeguimientoCaso).

        Ambas operaciones se ejecutan de forma atómica: si alguna falla,
        ningún cambio se persiste.

        Args:
            reporte_id: PK del reporte a actualizar.
            nuevo_estado: Valor del nuevo estado (debe ser un Reporte.Estado válido).
            usuario: Instancia de Usuario autenticado que realiza el cambio.
            observaciones: Notas opcionales del orientador.

        Returns:
            Instancia del Reporte con el estado actualizado.

        Raises:
            ReporteNoEncontradoError: Si el reporte no existe.
        """
        try:
            reporte = Reporte.objects.get(pk=reporte_id)
        except Reporte.DoesNotExist:
            raise ReporteNoEncontradoError()

        estado_anterior = reporte.estado

        with transaction.atomic():
            # 1. Actualizar el estado del reporte
            reporte.estado = nuevo_estado
            reporte.save(update_fields=["estado", "fecha_actualizacion"])

            # 2. Registrar en el historial de auditoría
            SeguimientoCaso.objects.create(
                reporte=reporte,
                orientador=usuario,
                estado_anterior=estado_anterior,
                estado_nuevo=nuevo_estado,
                observaciones=observaciones,
            )

        logger.info(
            "Estado actualizado: reporte_id=%s | %s → %s | usuario=%s",
            reporte_id,
            estado_anterior,
            nuevo_estado,
            usuario.email,
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

    def listar_reportes(self, filtros: dict = None):
        """
        Lista todos los reportes aplicando filtros opcionales.
        Solo accesible por Directivo/Orientador.

        Args:
            filtros: Diccionario con filtros opcionales (estado, nivel_riesgo, institucion_id, fecha_inicio, fecha_fin).

        Returns:
            QuerySet de Reporte ordenado por fecha descendente.
        """
        return _proxy.listar_todos(filtros)


    # ── Dashboard: estadísticas y mapa de calor (HU-13 / HU-14) ───────────

    def obtener_estadisticas(self, institucion_id=None, fecha_inicio=None, fecha_fin=None) -> dict:
        """Estadísticas agregadas de reportes, acotadas a la institución del usuario."""
        return _proxy.estadisticas(institucion_id, fecha_inicio, fecha_fin)

    def obtener_mapa_calor(self, institucion_id=None, fecha_inicio=None, fecha_fin=None) -> dict:
        """Concentración de reportes por zona de la sede, con intensidad relativa (0-1)."""
        zonas = _proxy.mapa_calor(institucion_id, fecha_inicio, fecha_fin)
        maximo = max((z["count"] for z in zonas), default=0)
        for zona in zonas:
            zona["intensity"] = round(zona["count"] / maximo, 2) if maximo else 0
        return {
            "points": zonas,
            "dimensions": {"zone": "ubicacion", "intensity": "count / max(count)"},
        }
