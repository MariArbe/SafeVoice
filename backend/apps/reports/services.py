"""
apps/reports/services.py — Capa de lógica de negocio del dominio de reportes.

REGLA: Las views NO acceden al ORM ni al proxy directamente.
       Todo acceso a datos pasa por este service.
       El service accede al ORM EXCLUSIVAMENTE a través de ReporteRepositoryProxy.
"""

import logging
import uuid

from django.db import transaction
from django.utils import timezone

from apps.users.models import Usuario

from .exceptions import (
    InstitucionNoCoincideError,
    MismoEstadoError,
    PermisoOrientadorRequeridoError,
    ReporteNoEncontradoError,
    TransicionEstadoInvalidaError,
)
from .models import Reporte, SeguimientoCaso
from .repository import ReporteRepositoryProxy
from .recommendations import generar_recomendaciones_reporte
from .transitions import (
    TRANSICIONES_PERMITIDAS,
    normalizar_estado,
    validar_transicion,
)

logger = logging.getLogger(__name__)

# Instancia del proxy — compartida por el service (stateless, thread-safe)
_proxy = ReporteRepositoryProxy()


class ReporteService:
    """
    Service de reportes. Orquesta la lógica de negocio de creación y
    consulta de reportes anónimos.

    El service es la única clase que interactúa con ReporteRepositoryProxy.
    """

    def _buscar_reporte(self, reporte_id: int | str) -> Reporte:
        """
        Busca un reporte por PK (entero o string numérico) o por código de seguimiento.
        Lanza ReporteNoEncontradoError si no existe.
        """
        if isinstance(reporte_id, int) or (isinstance(reporte_id, str) and str(reporte_id).isdigit()):
            try:
                return Reporte.objects.get(pk=int(reporte_id))
            except Reporte.DoesNotExist:
                raise ReporteNoEncontradoError()

        # Búsqueda por código de seguimiento UUID o cadena
        try:
            return Reporte.objects.get(codigo_seguimiento=reporte_id)
        except (Reporte.DoesNotExist, ValueError):
            raise ReporteNoEncontradoError()

    def _validar_acceso_orientador(self, reporte: Reporte, usuario) -> None:
        """
        Valida que el usuario tenga rol de Orientador y pertenezca a la misma
        institución del reporte (HU-08).
        """
        if not usuario or not usuario.is_authenticated:
            raise PermisoOrientadorRequeridoError()

        rol_usuario = getattr(usuario, "rol", None)
        if rol_usuario not in (Usuario.RolUsuario.ORIENTADOR, Usuario.RolUsuario.DIRECTIVO):
            raise PermisoOrientadorRequeridoError()

        usuario_inst_id = getattr(usuario, "institution_id", None)
        reporte_inst_id = getattr(reporte, "institucion_id", None)

        if reporte_inst_id and usuario_inst_id and reporte_inst_id != usuario_inst_id:
            raise InstitucionNoCoincideError()

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
        reporte_id: int | str,
        nuevo_estado: str,
        usuario,
        observaciones: str = "",
        comentario: str = "",
    ) -> Reporte:
        """
        Actualiza el estado de un reporte y registra el cambio en el historial de
        auditoría ('historial_cambios') dentro del propio reporte de forma atómica.

        Reglas:
          1. Solo accesible para orientadores de la misma institución del reporte.
          2. Valida transiciones permitidas (nuevo -> en_revision -> en_seguimiento -> cerrado).
          3. Rechaza si el estado nuevo es igual al actual o si la transición es inválida.
          4. Operación atómica: persiste el nuevo estado y añade la entrada al historial
             con usuario_id (del JWT) y timestamp UTC del servidor.

        Args:
            reporte_id: PK o código de seguimiento del reporte.
            nuevo_estado: Valor del nuevo estado deseado.
            usuario: Instancia de Usuario autenticado (Orientador).
            observaciones: Texto opcional / comentario del orientador.
            comentario: Texto opcional del modal.

        Returns:
            Instancia del Reporte actualizado.
        """
        reporte = self._buscar_reporte(reporte_id)

        # 1. Validación de rol de orientador e institución
        self._validar_acceso_orientador(reporte, usuario)

        # 2. Validación de estados y transiciones permitidas
        estado_actual_norm = normalizar_estado(reporte.estado)
        nuevo_estado_norm = normalizar_estado(nuevo_estado)

        if estado_actual_norm == nuevo_estado_norm:
            raise MismoEstadoError(estado_actual=estado_actual_norm)

        try:
            validar_transicion(estado_actual_norm, nuevo_estado_norm)
        except ValueError as err:
            permitidos = TRANSICIONES_PERMITIDAS.get(estado_actual_norm, [])
            raise TransicionEstadoInvalidaError(
                mensaje=str(err),
                estado_actual=estado_actual_norm,
                estados_permitidos=permitidos,
            )

        # 3. Operación atómica: actualizar estado y registrar en historial
        texto_comentario = (comentario or observaciones or "").strip()
        nombre_orientador = (
            usuario.get_full_name().strip()
            if hasattr(usuario, "get_full_name") and usuario.get_full_name().strip()
            else (getattr(usuario, "first_name", "") or getattr(usuario, "email", "Orientador"))
        )

        with transaction.atomic():
            entrada_historial = {
                "estado_anterior": estado_actual_norm,
                "estado_nuevo": nuevo_estado_norm,
                "usuario_id": usuario.id,
                "usuario_nombre": nombre_orientador,
                "fecha_cambio": timezone.now().isoformat(),
                "comentario": texto_comentario,
            }

            historial = list(reporte.historial_cambios or [])
            historial.append(entrada_historial)
            reporte.historial_cambios = historial
            reporte.estado = nuevo_estado_norm
            reporte.save(update_fields=["estado", "historial_cambios", "fecha_actualizacion"])

            # Compatibilidad retroactiva con SeguimientoCaso para evitar romper migraciones antiguas
            try:
                SeguimientoCaso.objects.create(
                    reporte=reporte,
                    orientador=usuario,
                    estado_anterior=estado_actual_norm,
                    estado_nuevo=nuevo_estado_norm,
                    observaciones=texto_comentario,
                )
            except Exception as e:
                logger.debug("Omitiendo SeguimientoCaso legado: %s", e)

        logger.info(
            "Estado actualizado: reporte_id=%s | %s → %s | orientador_id=%s (%s)",
            reporte.id,
            estado_actual_norm,
            nuevo_estado_norm,
            usuario.id,
            usuario.email,
        )
        return reporte

    # ── Consulta de historial (HU-08) ──────────────────────────────────────

    def obtener_historial(self, reporte_id: int | str, usuario) -> list[dict]:
        """
        Obtiene el historial de cambios de estado de un reporte, ordenado
        del más reciente al más antiguo.

        Solo accesible para orientadores de la misma institución del reporte.
        No expone ningún dato que identifique al estudiante.
        """
        reporte = self._buscar_reporte(reporte_id)
        self._validar_acceso_orientador(reporte, usuario)

        historial = list(reporte.historial_cambios or [])

        # Ordenar del más reciente al más antiguo (último agregado primero)
        historial_ordenado = list(reversed(historial))

        # Garantizar estructura y nombres de clave
        resultado = []
        for entrada in historial_ordenado:
            resultado.append({
                "estado_anterior": entrada.get("estado_anterior"),
                "estado_nuevo": entrada.get("estado_nuevo"),
                "usuario_id": entrada.get("usuario_id"),
                "usuario_nombre": entrada.get("usuario_nombre"),
                "nombre_orientador": entrada.get("usuario_nombre"),
                "fecha_cambio": entrada.get("fecha_cambio"),
                "fecha": entrada.get("fecha_cambio"),
                "comentario": entrada.get("comentario", ""),
            })

        return resultado

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

    # ── Sugerencias de intervención y protocolos (HU-15) ───────────────────

    def obtener_recomendaciones(self, reporte_id: int | str, usuario) -> dict:
        """
        Genera y retorna las recomendaciones y protocolos de intervención
        automáticos correspondientes al reporte según su nivel de riesgo y
        tipo de agresión (HU-15).
        Solo accesible por personal autorizado (Orientador o Directivo) de
        la misma institución educativa.
        """
        reporte = self._buscar_reporte(reporte_id)
        self._validar_acceso_orientador(reporte, usuario)
        return generar_recomendaciones_reporte(reporte)

