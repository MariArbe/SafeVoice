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

import base64
import logging
import uuid

from cryptography.fernet import Fernet
from django.conf import settings

from .exceptions import ReporteCampoNoPermitidoError, ReporteNoEncontradoError
from .models import Reporte

logger = logging.getLogger(__name__)


def _get_fernet_cipher() -> Fernet:
    """Devuelve un objeto Fernet usando una llave dedicada para reportes.

    La llave NO se deriva de SECRET_KEY. Debe configurarse por variable de entorno
    REPORTS_FERNET_KEY con un valor Fernet válido (ver .env.example).
    """
    key = getattr(settings, "REPORTS_FERNET_KEY", "") or ""
    if not key:
        raise RuntimeError(
            "REPORTS_FERNET_KEY no está configurada. Define una llave Fernet dedicada "
            "para datos sensibles de reportes."
        )
    return Fernet(key.encode("utf-8"))


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
            "codigo_seguimiento",
            "institucion_id",
            "institucion",
            "tipo_incidente",
            "descripcion",
            "estado",
            "nivel_riesgo",
            "rol_reportante",
            "grado_victima",
            "ubicacion",
            "frecuencia",
            "fecha_aproximada",
        }
    )

    # ── Campos que deben ser encriptados antes de guardarse en BD ──────────
    ENCRYPTED_FIELDS: frozenset[str] = frozenset({"descripcion"})

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

    def _encriptar_sensibles(self, datos: dict) -> dict:
        """
        Toma los datos, y si existen campos de ENCRYPTED_FIELDS,
        los encripta con Fernet usando la llave dedicada del sistema
        antes de pasarlos al ORM.
        """
        datos_seguros = datos.copy()
        cipher = _get_fernet_cipher()
        for campo in self.ENCRYPTED_FIELDS:
            if campo in datos_seguros and datos_seguros[campo]:
                texto_plano = str(datos_seguros[campo]).encode("utf-8")
                texto_cifrado = cipher.encrypt(texto_plano).decode("utf-8")
                datos_seguros[campo] = texto_cifrado
        return datos_seguros
        
    def _desencriptar_sensibles(self, reporte: Reporte) -> Reporte:
        """
        Toma un reporte del ORM y desencripta sus campos sensibles para que
        puedan ser leídos en memoria si es necesario (ej: en el serializer o vistas).
        """
        cipher = _get_fernet_cipher()
        for campo in self.ENCRYPTED_FIELDS:
            valor = getattr(reporte, campo, None)
            if valor:
                try:
                    texto_plano = cipher.decrypt(valor.encode("utf-8")).decode("utf-8")
                    setattr(reporte, campo, texto_plano)
                except Exception as e:
                    logger.error(f"Error al desencriptar el campo {campo} del reporte {reporte.codigo_seguimiento}: {e}")
        return reporte

    # ── Operaciones de escritura ───────────────────────────────────────────

    def crear(self, datos: dict) -> Reporte:
        """
        Crea y persiste un nuevo Reporte.

        Args:
            datos: Diccionario con los campos del reporte. Solo se permiten
                   los campos definidos en ALLOWED_FIELDS.

        Returns:
            Instancia del Reporte recién creado (con los datos en claro en memoria).

        Raises:
            ReporteCampoNoPermitidoError: Si `datos` contiene campos no permitidos.
        """
        self._validar_campos(datos)
        datos_seguros = self._encriptar_sensibles(datos)
        reporte = Reporte.objects.create(**datos_seguros)
        
        # Devolvemos el reporte con los campos en texto plano en memoria
        # (ya que acabamos de recibir los datos en claro de todas formas, 
        # actualizamos el objeto en memoria para que el serializer pueda leerlo si quisiera).
        for campo in self.ENCRYPTED_FIELDS:
            if campo in datos:
                setattr(reporte, campo, datos[campo])
                
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
            reporte = Reporte.objects.get(codigo_seguimiento=codigo)
            return self._desencriptar_sensibles(reporte)
        except Reporte.DoesNotExist:
            raise ReporteNoEncontradoError()

    def listar_todos(self):
        """
        Retorna todos los reportes ordenados por fecha de creación descendente.
        Solo accesible por usuarios autenticados (Directivo/Orientador).

        Returns:
            Lista de Reportes desencriptados.
        """
        qs = Reporte.objects.all()
        # En una app real, esto podría ser costoso si hay muchos registros.
        # Como es una prueba de concepto, desencriptamos en memoria la lista.
        reportes_lista = []
        for r in qs:
            reportes_lista.append(self._desencriptar_sensibles(r))
        return reportes_lista
