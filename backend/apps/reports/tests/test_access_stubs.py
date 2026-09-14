import pytest


STATISTICS_URL = "/api/v1/reports/statistics/"
HEATMAP_URL = "/api/v1/reports/heatmap/"


@pytest.mark.django_db
class TestReportAccessStubs:
    def test_directivo_puede_consultar_estadisticas(self, cliente_directivo):
        response = cliente_directivo.get(STATISTICS_URL)

        assert response.status_code == 200
        assert response.json() == {
            "total_reports": None,
            "by_status": {},
            "by_risk_level": {},
        }

    def test_orientador_no_puede_consultar_estadisticas(self, cliente_orientador):
        assert cliente_orientador.get(STATISTICS_URL).status_code == 403

    def test_usuario_sin_token_no_puede_consultar_estadisticas(self, api_client):
        assert api_client.get(STATISTICS_URL).status_code == 401

    def test_directivo_puede_consultar_heatmap(self, cliente_directivo):
        response = cliente_directivo.get(HEATMAP_URL)

        assert response.status_code == 200
        assert response.json() == {
            "points": [],
            "dimensions": {
                "latitude": None,
                "longitude": None,
                "intensity": None,
            },
        }

    def test_orientador_no_puede_consultar_heatmap(self, cliente_orientador):
        assert cliente_orientador.get(HEATMAP_URL).status_code == 403
