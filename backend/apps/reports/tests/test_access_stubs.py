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
EXPORT_CSV_URL = "/api/v1/reports/exportar/csv/"


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
    def test_orientador_puede_consultar_estadisticas(self, cliente_orientador):
        assert cliente_orientador.get(STATISTICS_URL).status_code == 200

    def test_usuario_sin_token_no_puede_consultar_estadisticas(self, api_client):
        assert api_client.get(STATISTICS_URL).status_code == 401

    def test_orientador_puede_consultar_heatmap(self, cliente_orientador):
        assert cliente_orientador.get(HEATMAP_URL).status_code == 200

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
        assert "by_grade" in body

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


@pytest.mark.django_db
class TestExportarCSV:
    def test_orientador_puede_exportar_csv(self, cliente_orientador, institucion):
        _crear_reporte(institucion, ubicacion="Salón de clases", riesgo="ALTO")
        response = cliente_orientador.get(EXPORT_CSV_URL)
        assert response.status_code == 200
        assert "text/csv" in response["Content-Type"]
        contenido = response.content.decode("utf-8")
        assert "Código de Seguimiento" in contenido
        assert "Salón de clases" in contenido

    def test_usuario_sin_token_recibe_401(self, api_client):
        response = api_client.get(EXPORT_CSV_URL)
        assert response.status_code == 401


@pytest.mark.django_db
class TestBusquedaReportes:
    def test_busqueda_por_fragmento_de_descripcion(self, cliente_orientador, institucion):
        r1 = Reporte.objects.create(
            institucion=institucion,
            ubicacion="Salón",
            frecuencia="SEMANAS",
            descripcion="Ayer en el recreo me empujaron y me botaron el cuaderno",
            estado="nuevo",
            nivel_riesgo_predicho="ALTO",
        )
        r2 = Reporte.objects.create(
            institucion=institucion,
            ubicacion="Baños",
            frecuencia="SEMANAS",
            descripcion="Insultos verbales repetidos por mensajería",
            estado="nuevo",
            nivel_riesgo_predicho="MEDIO",
        )

        res = cliente_orientador.get(f"/api/v1/reports/listar/?q=empujaron")
        assert res.status_code == 200
        data = res.json()
        results = data.get("results", data)
        assert len(results) == 1
        assert str(results[0]["codigo_seguimiento"]) == str(r1.codigo_seguimiento)

    def test_busqueda_por_codigo_de_seguimiento(self, cliente_orientador, institucion):
        r1 = Reporte.objects.create(
            institucion=institucion,
            ubicacion="Salón",
            frecuencia="SEMANAS",
            descripcion="Situación de prueba 1",
            estado="nuevo",
            nivel_riesgo_predicho="BAJO",
        )
        fragmento_codigo = str(r1.codigo_seguimiento)[:8]
        res = cliente_orientador.get(f"/api/v1/reports/listar/?q={fragmento_codigo}")
        assert res.status_code == 200
        data = res.json()
        results = data.get("results", data)
        assert len(results) >= 1
        assert any(str(r["codigo_seguimiento"]) == str(r1.codigo_seguimiento) for r in results)


@pytest.mark.django_db
class TestSubirEvidencia:
    def test_subir_imagen_valida_devuelve_201_y_anonimiza_nombre(self, api_client):
        from django.core.files.uploadedfile import SimpleUploadedFile
        archivo = SimpleUploadedFile("captura_personal_juan.png", b"fake_png_data", content_type="image/png")
        response = api_client.post("/api/v1/reports/evidencia/", {"archivo": archivo}, format="multipart")
        assert response.status_code == 201
        data = response.json()
        assert "evidencia_url" in data
        assert data["evidencia_url"].startswith("/media/evidencias/evidencia_")
        assert data["evidencia_url"].endswith(".png")
        assert "captura_personal_juan" not in data["evidencia_url"]

    def test_subir_archivo_extension_no_permitida_devuelve_400(self, api_client):
        from django.core.files.uploadedfile import SimpleUploadedFile
        archivo = SimpleUploadedFile("virus.exe", b"fake_exe_content", content_type="application/octet-stream")
        response = api_client.post("/api/v1/reports/evidencia/", {"archivo": archivo}, format="multipart")
        assert response.status_code == 400
        assert "no está permitido" in response.json()["error"]

    def test_crear_reporte_con_evidencia_url_queda_asociada(self, api_client, institucion):
        payload = {
            "institucion": institucion.id,
            "ubicacion": "Salón de clases",
            "frecuencia": "SEMANAS",
            "grado_victima": "9°",
            "involucrados_tipo": "victima",
            "descripcion": "Descripción detallada de prueba con evidencia adjunta.",
            "tipos_agresion": [],
            "evidencia_url": "/media/evidencias/evidencia_12345.png",
        }
        response = api_client.post("/api/v1/reports/", payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["evidencia_url"] == "/media/evidencias/evidencia_12345.png"

    def test_crear_reporte_con_multiples_ubicaciones_array(self, api_client, institucion):
        payload = {
            "institucion": institucion.id,
            "ubicacion": ["Salón de clases", "Baños", "Pasillos o escaleras"],
            "frecuencia": "SEMANAS",
            "grado_victima": "9°",
            "involucrados_tipo": "victima",
            "descripcion": "Acoso en varios puntos del colegio.",
            "tipos_agresion": [],
        }
        response = api_client.post("/api/v1/reports/", payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert "Salón de clases" in data["ubicacion"]
        assert "Baños" in data["ubicacion"]
        assert "Pasillos o escaleras" in data["ubicacion"]

    def test_crear_reporte_con_multiples_ubicaciones_string(self, api_client, institucion):
        payload = {
            "institucion": institucion.id,
            "ubicacion": "Salón de clases, Baños",
            "frecuencia": "SEMANAS",
            "grado_victima": "9°",
            "involucrados_tipo": "victima",
            "descripcion": "Acoso en dos lugares.",
            "tipos_agresion": [],
        }
        response = api_client.post("/api/v1/reports/", payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["ubicacion"] == "Salón de clases, Baños"


@pytest.mark.django_db
class TestRegistrarSeguimientoYRutaExterna:
    def test_orientador_puede_registrar_seguimiento_y_ruta_externa(self, cliente_orientador, institucion):
        rep = _crear_reporte(institucion, estado="en_revision", riesgo="CRITICO")
        url = f"/api/v1/reports/{rep.id}/seguimiento/"
        payload = {
            "comentario": "Se activó Ruta Externa Tipo III con remisión a Policía de Infancia y Adolescencia",
            "tipo_accion": "ACTIVACION_RUTA_EXTERNA",
            "metadata": {"entidad": "Policía de Infancia", "radicado": "OF-2026-001"},
        }
        resp = cliente_orientador.post(url, payload, format="json")
        assert resp.status_code == 201
        data = resp.json()
        assert len(data["historial_cambios"]) >= 1
        ultimo = data["historial_cambios"][-1]
        assert ultimo["tipo_accion"] == "ACTIVACION_RUTA_EXTERNA"
        assert ultimo["metadata"]["entidad"] == "Policía de Infancia"

    def test_comentario_vacio_es_rechazado_con_400(self, cliente_orientador, institucion):
        rep = _crear_reporte(institucion, estado="en_revision")
        url = f"/api/v1/reports/{rep.id}/seguimiento/"
        resp = cliente_orientador.post(url, {"comentario": "   "}, format="json")
        assert resp.status_code == 400

    def test_usuario_sin_token_recibe_401(self, api_client, institucion):
        rep = _crear_reporte(institucion)
        url = f"/api/v1/reports/{rep.id}/seguimiento/"
        resp = api_client.post(url, {"comentario": "Nota sin auth"}, format="json")
        assert resp.status_code == 401


@pytest.mark.django_db
class TestChequeosPostCierreYSemaforo:
    def test_registrar_chequeo_verde_mantiene_reporte_cerrado(self, cliente_orientador, institucion):
        rep = _crear_reporte(institucion, estado="cerrado")
        url = f"/api/v1/reports/{rep.id}/chequeo-post-cierre/"
        payload = {
            "hito": "DIA_15",
            "semaforo": "VERDE",
            "observaciones": "Convivencia normalizada, víctima segura y tranquila.",
            "reactivar_caso": False,
        }
        resp = cliente_orientador.post(url, payload, format="json")
        assert resp.status_code == 200
        data = resp.json()
        assert data["estado"] == "cerrado"
        ultimo = data["historial_cambios"][-1]
        assert ultimo["tipo_accion"] == "CHEQUEO_POST_CIERRE"
        assert ultimo["metadata"]["semaforo"] == "VERDE"
        assert ultimo["metadata"]["hito"] == "DIA_15"

    def test_registrar_chequeo_rojo_con_reactivacion_cambia_a_en_seguimiento(
        self, cliente_orientador, institucion
    ):
        rep = _crear_reporte(institucion, estado="cerrado")
        url = f"/api/v1/reports/{rep.id}/chequeo-post-cierre/"
        payload = {
            "hito": "DIA_30",
            "semaforo": "ROJO",
            "observaciones": "Se evidenciaron represalias en el salón de clases.",
            "reactivar_caso": True,
        }
        resp = cliente_orientador.post(url, payload, format="json")
        assert resp.status_code == 200
        data = resp.json()
        assert data["estado"] == "en_seguimiento"
        ultimo = data["historial_cambios"][-1]
        assert ultimo["tipo_accion"] == "REACTIVACION_REINCIDENCIA"
        assert ultimo["metadata"]["reactivado"] is True

    def test_hito_o_semaforo_invalido_devuelve_400(self, cliente_orientador, institucion):
        rep = _crear_reporte(institucion, estado="cerrado")
        url = f"/api/v1/reports/{rep.id}/chequeo-post-cierre/"
        resp = cliente_orientador.post(url, {"hito": "INVALIDO", "semaforo": "VERDE"}, format="json")
        assert resp.status_code == 400


@pytest.mark.django_db
class TestConfirmarYCambiarClasificacionDocente:
    def test_docente_puede_confirmar_riesgo_predicho_por_ia(self, cliente_orientador, institucion):
        rep = _crear_reporte(institucion, estado="nuevo", riesgo="ALTO")
        url = f"/api/v1/reports/{rep.id}/clasificacion/"
        resp = cliente_orientador.patch(url, {"confirmar_ia": True}, format="json")
        assert resp.status_code == 200
        data = resp.json()
        assert data["nivel_riesgo_predicho"] == "ALTO"
        assert data["nivel_riesgo_confirmado"] == "ALTO"
        assert data["historial_cambios"][-1]["tipo_accion"] == "CLASIFICACION_DOCENTE"

    def test_docente_puede_cambiar_gravedad_y_tipos_agresion_manualmente(
        self, cliente_orientador, institucion
    ):
        rep = _crear_reporte(institucion, ubicacion="Baños", estado="en_revision", riesgo="BAJO")
        url = f"/api/v1/reports/{rep.id}/clasificacion/"
        payload = {
            "nivel_riesgo_confirmado": "CRITICO",
            "tipos_agresion": ["FISICA", "CIBERBULLYING"],
            "comentario": "Al entrevistar a la víctima se detectó agresión física grave.",
        }
        resp = cliente_orientador.patch(url, payload, format="json")
        assert resp.status_code == 200
        data = resp.json()
        assert data["nivel_riesgo_predicho"] == "BAJO"
        assert data["nivel_riesgo_confirmado"] == "CRITICO"
        codigos = {t["codigo"] for t in data["tipos_agresion"]}
        assert "FISICA" in codigos
        assert "CIBERBULLYING" in codigos

        # Verificar que las estadísticas y mapa de calor reflejan el nivel confirmado por el docente
        stats = cliente_orientador.get(STATISTICS_URL).json()
        assert stats["by_risk_level"].get("CRITICO") == 1
        assert stats["by_risk_level"].get("BAJO", 0) == 0

        heatmap = cliente_orientador.get(HEATMAP_URL).json()["points"]
        assert heatmap[0]["by_risk_level"].get("CRITICO") == 1

    def test_riesgo_invalido_devuelve_400(self, cliente_orientador, institucion):
        rep = _crear_reporte(institucion, estado="nuevo", riesgo="MEDIO")
        url = f"/api/v1/reports/{rep.id}/clasificacion/"
        resp = cliente_orientador.patch(url, {"nivel_riesgo_confirmado": "EXTREMO"}, format="json")
        assert resp.status_code == 400

    def test_prioridad_casos_criticos_al_listar(self, cliente_orientador, institucion):
        # Crear caso bajo
        r_bajo = _crear_reporte(institucion, ubicacion="Patio", estado="nuevo", riesgo="BAJO")
        # Crear caso medio
        r_medio = _crear_reporte(institucion, ubicacion="Baños", estado="nuevo", riesgo="MEDIO")
        # Crear caso crítico
        r_critico = _crear_reporte(institucion, ubicacion="Salón", estado="nuevo", riesgo="CRITICO")

        res = cliente_orientador.get("/api/v1/reports/listar/")
        assert res.status_code == 200
        data = res.json()
        results = data.get("results", data)
        # El caso CRÍTICO debe aparecer de primeras en la lista priorizada
        assert results[0]["codigo_seguimiento"] == str(r_critico.codigo_seguimiento)



