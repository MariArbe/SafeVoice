"""
Tests del backend del dashboard: estadísticas (HU-13) y mapa de calor (HU-14).

Cubre los criterios de aceptación:
  - HU-13-CA01: el directivo consulta cantidad, tipo y estado de los reportes de SU institución.
  - HU-13-CA02: las estadísticas se filtran por rango de fechas.
  - HU-13-CA03: los datos coinciden con los reportes almacenados.
  - HU-14-CA01/CA03: concentración por zona, con intensidad relativa.
  - Acceso: solo directivo; sin token -> 401; orientador -> 403.
"""

import datetime

import pytest
from django.utils import timezone

from apps.reports.models import Reporte, TipoAgresion

STATISTICS_URL = "/api/v1/reports/statistics/"
HEATMAP_URL = "/api/v1/reports/heatmap/"


def _crear_reporte(institucion, ubicacion="Salón", estado="PENDIENTE", riesgo="BAJO", dias_atras=0, tipos=()):
    reporte = Reporte.objects.create(
        institucion=institucion,
        ubicacion=ubicacion,
        frecuencia="SEMANAS",
        descripcion="texto de prueba",
        estado=estado,
        nivel_riesgo_predicho=riesgo,
    )
    if dias_atras:
        # fecha_creacion es auto_now_add: se ajusta con update() para simular antigüedad.
        Reporte.objects.filter(pk=reporte.pk).update(
            fecha_creacion=timezone.now() - datetime.timedelta(days=dias_atras)
        )
    for tipo in tipos:
        obj, _ = TipoAgresion.objects.get_or_create(codigo=tipo, defaults={"nombre": tipo.title()})
        reporte.tipos_agresion.add(obj)
    return reporte


@pytest.mark.django_db
class TestAccesoDashboard:
    def test_orientador_no_puede_consultar_estadisticas(self, cliente_orientador):
        assert cliente_orientador.get(STATISTICS_URL).status_code == 403

    def test_usuario_sin_token_no_puede_consultar_estadisticas(self, api_client):
        assert api_client.get(STATISTICS_URL).status_code == 401

    def test_orientador_no_puede_consultar_heatmap(self, cliente_orientador):
        assert cliente_orientador.get(HEATMAP_URL).status_code == 403

    def test_usuario_sin_token_no_puede_consultar_heatmap(self, api_client):
        assert api_client.get(HEATMAP_URL).status_code == 401


@pytest.mark.django_db
class TestEstadisticas:
    def test_sin_reportes_devuelve_ceros(self, cliente_directivo):
        response = cliente_directivo.get(STATISTICS_URL)

        assert response.status_code == 200
        body = response.json()
        assert body["total_reports"] == 0
        assert body["by_status"] == {}
        assert body["by_risk_level"] == {}

    def test_cuenta_por_estado_riesgo_y_tipo(self, cliente_directivo, institucion):
        _crear_reporte(institucion, estado="PENDIENTE", riesgo="ALTO", tipos=("FISICA",))
        _crear_reporte(institucion, estado="PENDIENTE", riesgo="BAJO", tipos=("FISICA", "VERBAL"))
        _crear_reporte(institucion, estado="ATENDIDO", riesgo="CRITICO", tipos=("VERBAL",))

        body = cliente_directivo.get(STATISTICS_URL).json()

        assert body["total_reports"] == 3
        assert body["by_status"] == {"PENDIENTE": 2, "ATENDIDO": 1}
        assert body["by_risk_level"] == {"ALTO": 1, "BAJO": 1, "CRITICO": 1}
        assert body["by_type"] == {"Fisica": 2, "Verbal": 2}

    def test_aislamiento_por_institucion(self, cliente_directivo, institucion, institucion_secundaria):
        _crear_reporte(institucion)
        _crear_reporte(institucion_secundaria)
        _crear_reporte(institucion_secundaria)

        body = cliente_directivo.get(STATISTICS_URL).json()

        assert body["total_reports"] == 1  # solo ve los de su institución

    def test_filtro_por_rango_de_fechas(self, cliente_directivo, institucion):
        _crear_reporte(institucion, dias_atras=0)
        _crear_reporte(institucion, dias_atras=40)

        hoy = timezone.localdate()
        desde = (hoy - datetime.timedelta(days=7)).isoformat()

        body = cliente_directivo.get(STATISTICS_URL, {"fecha_inicio": desde}).json()

        assert body["total_reports"] == 1

    def test_rango_invertido_es_rechazado(self, cliente_directivo):
        response = cliente_directivo.get(
            STATISTICS_URL, {"fecha_inicio": "2026-10-10", "fecha_fin": "2026-10-01"}
        )
        assert response.status_code == 400

    def test_fecha_con_formato_invalido_es_rechazada(self, cliente_directivo):
        assert cliente_directivo.get(STATISTICS_URL, {"fecha_inicio": "ayer"}).status_code == 400


@pytest.mark.django_db
class TestMapaCalor:
    def test_sin_reportes_devuelve_lista_vacia(self, cliente_directivo):
        response = cliente_directivo.get(HEATMAP_URL)

        assert response.status_code == 200
        assert response.json()["points"] == []

    def test_agrupa_por_zona_con_intensidad_relativa(self, cliente_directivo, institucion):
        for _ in range(4):
            _crear_reporte(institucion, ubicacion="Baños", riesgo="ALTO")
        _crear_reporte(institucion, ubicacion="Patio", riesgo="BAJO")
        _crear_reporte(institucion, ubicacion="Patio", riesgo="BAJO")

        puntos = cliente_directivo.get(HEATMAP_URL).json()["points"]

        assert [p["zone"] for p in puntos] == ["Baños", "Patio"]  # mayor concentración primero
        assert puntos[0]["count"] == 4 and puntos[0]["intensity"] == 1.0
        assert puntos[1]["count"] == 2 and puntos[1]["intensity"] == 0.5
        assert puntos[0]["by_risk_level"] == {"ALTO": 4}

    def test_aislamiento_por_institucion(self, cliente_directivo, institucion, institucion_secundaria):
        _crear_reporte(institucion_secundaria, ubicacion="Baños")

        assert cliente_directivo.get(HEATMAP_URL).json()["points"] == []
