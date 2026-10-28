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

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.db.models import Case, Count, IntegerField, Q, Value, When
from django.db.models.functions import TruncMonth

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
            "ubicacion",
            "frecuencia",
            "grado_victima",
            "involucrados_tipo",
            "involucrados_grado",
            "descripcion",
            "evidencia_url",
            "tipos_agresion",
            "nivel_riesgo_predicho",
            "nivel_riesgo_confirmado",
            "nivel_riesgo",
            "estado",
            "rol_reportante",
            "fecha_aproximada",
            "acepta_revelar_identidad",
            "nombre_contacto_victima",
            "medio_contacto_victima",
            "historial_cambios",
        }
    )

    # ── Campos que deben ser encriptados antes de guardarse en BD ──────────
    ENCRYPTED_FIELDS: frozenset[str] = frozenset(
        {
            "descripcion",
            "nombre_contacto_victima",
            "medio_contacto_victima",
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
            if valor and isinstance(valor, str) and valor.startswith("gAAAAA"):
                try:
                    texto_plano = cipher.decrypt(valor.encode("utf-8")).decode("utf-8")
                    setattr(reporte, campo, texto_plano)
                except (InvalidToken, Exception) as e:
                    logger.error(
                        "Error al desencriptar el campo %s del reporte %s: %s",
                        campo,
                        reporte.codigo_seguimiento,
                        e,
                    )
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
        tipos_agresion = datos.pop("tipos_agresion", None)
        self._validar_campos(datos)
        datos_seguros = self._encriptar_sensibles(datos)
        reporte = Reporte.objects.create(**datos_seguros)
        if tipos_agresion:
            reporte.tipos_agresion.set(tipos_agresion)

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

    @staticmethod
    def _filtrar_por_ubicacion(qs, valor_ubicacion: str):
        """Filtra reportes por zona considerando etiquetas legibles y códigos técnicos."""
        if not valor_ubicacion:
            return qs
        u = valor_ubicacion.strip().lower()
        if "salón" in u or "salon" in u:
            return qs.filter(Q(ubicacion__icontains="salón") | Q(ubicacion__icontains="salon") | Q(ubicacion__iexact="SALON"))
        if "pasillo" in u or "escalera" in u:
            return qs.filter(Q(ubicacion__icontains="pasillo") | Q(ubicacion__icontains="escalera") | Q(ubicacion__iexact="PASILLOS"))
        if "baño" in u or "bano" in u:
            return qs.filter(Q(ubicacion__icontains="baño") | Q(ubicacion__icontains="bano") | Q(ubicacion__iexact="BANOS"))
        if "descanso" in u or "deportiva" in u or "cancha" in u or "patio" in u:
            return qs.filter(
                Q(ubicacion__icontains="descanso")
                | Q(ubicacion__icontains="deportiva")
                | Q(ubicacion__icontains="cancha")
                | Q(ubicacion__icontains="patio")
                | Q(ubicacion__iexact="DESCANSO")
            )
        if "salida" in u:
            return qs.filter(Q(ubicacion__icontains="salida") | Q(ubicacion__iexact="SALIDA"))
        if "internet" in u or "redes" in u:
            return qs.filter(Q(ubicacion__icontains="internet") | Q(ubicacion__icontains="redes") | Q(ubicacion__iexact="INTERNET"))
        if "otro" in u:
            return qs.filter(Q(ubicacion__icontains="otro") | Q(ubicacion__iexact="OTRO"))
        return qs.filter(ubicacion__icontains=valor_ubicacion)

    def listar_todos(self, filtros: dict = None):
        """
        Retorna todos los reportes priorizando los casos CRÍTICOS al principio
        (Ley 1620 - Situación Tipo III) y luego por fecha de creación descendente,
        aplicando filtros si existen.
        Solo accesible por usuarios autenticados (Directivo/Orientador).
        """
        cond_critico = Q(nivel_riesgo_confirmado="CRITICO") | (
            (Q(nivel_riesgo_confirmado__isnull=True) | Q(nivel_riesgo_confirmado=""))
            & Q(nivel_riesgo_predicho="CRITICO")
        )
        cond_alto = Q(nivel_riesgo_confirmado="ALTO") | (
            (Q(nivel_riesgo_confirmado__isnull=True) | Q(nivel_riesgo_confirmado=""))
            & Q(nivel_riesgo_predicho="ALTO")
        )
        cond_medio = Q(nivel_riesgo_confirmado="MEDIO") | (
            (Q(nivel_riesgo_confirmado__isnull=True) | Q(nivel_riesgo_confirmado=""))
            & Q(nivel_riesgo_predicho="MEDIO")
        )

        prioridad_riesgo = Case(
            When(cond_critico & ~Q(estado="cerrado"), then=Value(1)),
            When(cond_critico & Q(estado="cerrado"), then=Value(2)),
            When(cond_alto & ~Q(estado="cerrado"), then=Value(3)),
            When(cond_alto & Q(estado="cerrado"), then=Value(4)),
            When(cond_medio & ~Q(estado="cerrado"), then=Value(5)),
            When(cond_medio & Q(estado="cerrado"), then=Value(6)),
            When(~Q(estado="cerrado"), then=Value(7)),
            default=Value(8),
            output_field=IntegerField(),
        )

        qs = (
            Reporte.objects.prefetch_related("tipos_agresion")
            .annotate(prioridad_riesgo=prioridad_riesgo)
            .order_by("prioridad_riesgo", "-fecha_creacion")
        )

        if filtros:
            if "institucion_id" in filtros:
                qs = qs.filter(institucion_id=filtros["institucion_id"])
            if "estado" in filtros:
                qs = qs.filter(estado=filtros["estado"])
            if "nivel_riesgo_predicho" in filtros:
                val = filtros["nivel_riesgo_predicho"]
                qs = qs.filter(
                    Q(nivel_riesgo_confirmado=val)
                    | (
                        (Q(nivel_riesgo_confirmado__isnull=True) | Q(nivel_riesgo_confirmado=""))
                        & Q(nivel_riesgo_predicho=val)
                    )
                )
            if "ubicacion" in filtros:
                qs = self._filtrar_por_ubicacion(qs, filtros["ubicacion"])
            if "fecha_inicio" in filtros:
                qs = qs.filter(fecha_creacion__date__gte=filtros["fecha_inicio"])
            if "fecha_fin" in filtros:
                qs = qs.filter(fecha_creacion__date__lte=filtros["fecha_fin"])

        # Como es una prueba de concepto, desencriptamos en memoria la lista.
        reportes_lista = []
        for r in qs:
            reportes_lista.append(self._desencriptar_sensibles(r))
        if filtros and filtros.get("q"):
            term = str(filtros["q"]).strip().lower()
            reportes_lista = [
                r for r in reportes_lista
                if (
                    term in str(r.codigo_seguimiento).lower()
                    or term in (getattr(r, "descripcion", "") or "").lower()
                    or term in (getattr(r, "ubicacion", "") or "").lower()
                    or term in (getattr(r, "nombre_contacto_victima", "") or "").lower()
                    or term in (getattr(r, "grado_victima", "") or "").lower()
                )
            ]

        return reportes_lista

    # ── Agregaciones para el dashboard (HU-13 / HU-14) ─────────────────────
    # Solo operan con COUNT/GROUP BY sobre columnas no sensibles. Nunca leen
    # ni desencriptan `descripcion` ni los datos de contacto de la víctima.

    def _qs_filtrado(self, institucion_id=None, fecha_inicio=None, fecha_fin=None):
        qs = Reporte.objects.all()
        if institucion_id is not None:
            qs = qs.filter(institucion_id=institucion_id)
        if fecha_inicio is not None:
            qs = qs.filter(fecha_creacion__date__gte=fecha_inicio)
        if fecha_fin is not None:
            qs = qs.filter(fecha_creacion__date__lte=fecha_fin)
        return qs

    @staticmethod
    def _conteo(qs, campo: str) -> dict:
        filas = qs.values(campo).annotate(total=Count("id")).order_by()
        return {(fila[campo] or "SIN_DATO"): fila["total"] for fila in filas}

    def estadisticas(self, institucion_id=None, fecha_inicio=None, fecha_fin=None) -> dict:
        """Conteos agregados de reportes (total, estado, riesgo, tipo, ubicación, mes)."""
        qs = self._qs_filtrado(institucion_id, fecha_inicio, fecha_fin)

        por_tipo = {
            fila["tipos_agresion__nombre"]: fila["total"]
            for fila in qs.filter(tipos_agresion__isnull=False)
            .values("tipos_agresion__nombre")
            .annotate(total=Count("id", distinct=True))
            .order_by()
        }
        por_mes = {
            fila["mes"].strftime("%Y-%m"): fila["total"]
            for fila in qs.annotate(mes=TruncMonth("fecha_creacion"))
            .values("mes")
            .annotate(total=Count("id"))
            .order_by("mes")
        }

        by_location = {}
        for fila in qs.values("ubicacion").annotate(total=Count("id")):
            raw = fila["ubicacion"] or "SIN_DATO"
            partes = [p.strip() for p in raw.split(",") if p.strip()] if "," in raw else [raw]
            for p in partes:
                by_location[p] = by_location.get(p, 0) + fila["total"]

        by_risk_level = {}
        for fila in qs.values("nivel_riesgo_confirmado", "nivel_riesgo_predicho").annotate(total=Count("id")).order_by():
            nivel = fila["nivel_riesgo_confirmado"] or fila["nivel_riesgo_predicho"] or "SIN_DATO"
            by_risk_level[nivel] = by_risk_level.get(nivel, 0) + fila["total"]

        return {
            "total_reports": qs.count(),
            "by_status": self._conteo(qs, "estado"),
            "by_risk_level": by_risk_level,
            "by_type": por_tipo,
            "by_location": by_location,
            "by_frequency": self._conteo(qs, "frecuencia"),
            "by_grade": self._conteo(qs, "grado_victima"),
            "by_month": por_mes,
        }

    def mapa_calor(self, institucion_id=None, fecha_inicio=None, fecha_fin=None) -> list:
        """Concentración de casos por zona (ubicación dentro de la sede), con
        desglose por nivel de riesgo (priorizando nivel_riesgo_confirmado)."""
        qs = self._qs_filtrado(institucion_id, fecha_inicio, fecha_fin)
        filas = (
            qs.values("ubicacion", "nivel_riesgo_confirmado", "nivel_riesgo_predicho")
            .annotate(total=Count("id"))
            .order_by()
        )
        zonas: dict = {}
        for fila in filas:
            raw_zona = fila["ubicacion"] or "SIN_DATO"
            partes = [p.strip() for p in raw_zona.split(",") if p.strip()] if "," in raw_zona else [raw_zona]
            for zona in partes:
                datos = zonas.setdefault(zona, {"zone": zona, "count": 0, "by_risk_level": {}})
                datos["count"] += fila["total"]
                nivel = fila["nivel_riesgo_confirmado"] or fila["nivel_riesgo_predicho"] or "SIN_DATO"
                datos["by_risk_level"][nivel] = datos["by_risk_level"].get(nivel, 0) + fila["total"]
        return sorted(zonas.values(), key=lambda z: z["count"], reverse=True)
