"""
apps/reports/tests/test_recomendaciones.py — Tests unitarios para HU-15:
Sugerencias automáticas de intervención pedagógica y protocolos de convivencia.
"""

import pytest
from apps.reports.models import Reporte, TipoAgresion
from apps.users.models import Usuario

RECOMENDACIONES_URL = "/api/v1/reports/{}/recomendaciones/"


@pytest.fixture
def reporte_critico(db, institucion):
    """Reporte clasificado con riesgo CRITICO."""
    rep = Reporte.objects.create(
        institucion=institucion,
        descripcion="Un estudiante amenazó con un cuchillo en el baño",
        ubicacion="Baños",
        frecuencia="PRIMERA_VEZ",
        nivel_riesgo_predicho="CRITICO",
        estado="nuevo",
    )
    tipo, _ = TipoAgresion.objects.get_or_create(codigo="FISICA", defaults={"nombre": "Agresión Física"})
    rep.tipos_agresion.add(tipo)
    return rep


@pytest.fixture
def reporte_alto_ciberacoso(db, institucion):
    """Reporte clasificado con riesgo ALTO y Ciberacoso."""
    rep = Reporte.objects.create(
        institucion=institucion,
        descripcion="Crearon un grupo de WhatsApp para difundir fotos y burlarse",
        ubicacion="Redes sociales",
        frecuencia="SEMANAS",
        nivel_riesgo_predicho="ALTO",
        estado="en_revision",
    )
    tipo, _ = TipoAgresion.objects.get_or_create(codigo="CIBERACOSO", defaults={"nombre": "Ciberacoso / Digital"})
    rep.tipos_agresion.add(tipo)
    return rep


@pytest.fixture
def reporte_bajo_verbal(db, institucion):
    """Reporte clasificado con riesgo BAJO y agresión verbal."""
    rep = Reporte.objects.create(
        institucion=institucion,
        descripcion="Me pusieron un apodo feo hoy en el salón de clases",
        ubicacion="Salón de clases",
        frecuencia="PRIMERA_VEZ",
        nivel_riesgo_predicho="BAJO",
        estado="nuevo",
    )
    tipo, _ = TipoAgresion.objects.get_or_create(codigo="VERBAL", defaults={"nombre": "Agresión Verbal"})
    rep.tipos_agresion.add(tipo)
    return rep


@pytest.fixture
def cliente_otra_institucion(db, institucion_secundaria, api_client):
    """Cliente autenticado de una institución diferente para verificar aislamiento."""
    from rest_framework_simplejwt.tokens import RefreshToken
    otro_usuario = Usuario.objects.create_user(
        email="orientador_otro@secundaria.edu.co",
        username="orientador_otro@secundaria.edu.co",
        password="Password123!",
        rol=Usuario.RolUsuario.ORIENTADOR,
        institution=institucion_secundaria,
    )
    token = str(RefreshToken.for_user(otro_usuario).access_token)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client


@pytest.mark.django_db
class TestRecomendacionesIntervencion:
    """HU-15: Pruebas del endpoint y servicio de sugerencias de intervención."""

    def test_orientador_recibe_200_con_estructura_completa(self, cliente_orientador, reporte_critico):
        """El orientador consulta las recomendaciones y recibe todas las claves requeridas."""
        url = RECOMENDACIONES_URL.format(reporte_critico.id)
        response = cliente_orientador.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["reporte_id"] == reporte_critico.id
        assert data["nivel_riesgo"] == "CRITICO"
        assert "Situación Tipo III" in data["tipo_situacion"]
        assert data["urgencia"] == "Inmediata (< 2 horas)"
        assert len(data["acciones_clave"]) >= 3
        assert len(data["lineas_ayuda"]) >= 2
        assert any(l["contacto"] == "123" for l in data["lineas_ayuda"])

    def test_directivo_recibe_200_por_unificacion_de_roles(self, cliente_directivo, reporte_alto_ciberacoso):
        """Con la unificación de roles, el directivo también tiene acceso completo."""
        url = RECOMENDACIONES_URL.format(reporte_alto_ciberacoso.id)
        response = cliente_directivo.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["nivel_riesgo"] == "ALTO"
        assert "Situación Tipo II" in data["tipo_situacion"]
        assert data["urgencia"] == "Alta (< 24 horas hábiles)"

    def test_recomendaciones_especificas_ciberacoso(self, cliente_orientador, reporte_alto_ciberacoso):
        """Detecta ciberacoso y añade pautas de preservación de evidencia digital."""
        url = RECOMENDACIONES_URL.format(reporte_alto_ciberacoso.id)
        response = cliente_orientador.get(url)

        assert response.status_code == 200
        data = response.json()
        claves = [r["clave"] for r in data["recomendaciones_especificas"]]
        assert "CIBERACOSO" in claves
        item_ciber = next(r for r in data["recomendaciones_especificas"] if r["clave"] == "CIBERACOSO")
        assert any("NO eliminar" in p or "capturas" in p for p in item_ciber["pautas"])

    def test_recomendaciones_bajo_dialogo_restaurativo(self, cliente_orientador, reporte_bajo_verbal):
        """Riesgo BAJO genera protocolo de mediación y diálogo restaurativo (Tipo I)."""
        url = RECOMENDACIONES_URL.format(reporte_bajo_verbal.id)
        response = cliente_orientador.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["nivel_riesgo"] == "BAJO"
        assert "Situación Tipo I" in data["tipo_situacion"]
        assert "Mediación Escolar y Diálogo Restaurativo" in data["protocolo_principal"]

    def test_aislamiento_institucional_retorna_403(self, cliente_otra_institucion, reporte_critico):
        """Un usuario de otra institución no puede consultar recomendaciones del caso."""
        url = RECOMENDACIONES_URL.format(reporte_critico.id)
        response = cliente_otra_institucion.get(url)

        assert response.status_code == 403

    def test_sin_token_retorna_401(self, api_client, reporte_critico):
        """Petición anónima es rechazada con 401 Unauthorized."""
        url = RECOMENDACIONES_URL.format(reporte_critico.id)
        response = api_client.get(url)

        assert response.status_code == 401

    def test_reporte_inexistente_retorna_404(self, cliente_orientador):
        """ID inexistente retorna 404 Not Found."""
        url = RECOMENDACIONES_URL.format(999999)
        response = cliente_orientador.get(url)

        assert response.status_code == 404
