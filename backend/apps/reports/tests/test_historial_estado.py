"""
tests/test_historial_estado.py — Tests para HU-08: Historial de cambios de estado.

Verifica que:
  1. Al actualizar el estado de un reporte se crea un registro de auditoría
     (SeguimientoCaso) con los datos correctos.
  2. El historial se incluye en la respuesta del endpoint.
  3. Se registra el usuario autenticado como responsable.
  4. Se cubren los distintos caminos de cambio de estado.
  5. El endpoint exige autenticación y rol adecuado.
  6. El estado del reporte y el historial son consistentes (atomicidad).
"""

import pytest
from django.utils import timezone

from apps.reports.models import Reporte, SeguimientoCaso
from apps.reports.services import ReporteService


ESTADO_URL_TEMPLATE = "/api/v1/reports/{}/estado/"


@pytest.fixture
def reporte(db, institucion):
    """Reporte de prueba con estado inicial PENDIENTE."""
    return Reporte.objects.create(
        institucion=institucion,
        descripcion="Caso de prueba para historial de estado",
        ubicacion="PATIO",
        frecuencia="SEMANAL",
        estado=Reporte.Estado.PENDIENTE,
    )


@pytest.mark.django_db
class TestActualizarEstadoEndpoint:
    """Tests del endpoint PATCH /api/v1/reports/<id>/estado/."""

    def test_orientador_puede_actualizar_estado(self, cliente_orientador, reporte):
        """Un orientador autenticado puede cambiar el estado de un reporte."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        assert response.status_code == 200
        assert response.json()["estado"] == "EN_REVISION"

    def test_directivo_puede_actualizar_estado(self, cliente_directivo, reporte):
        """Un directivo autenticado también puede cambiar el estado."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        response = cliente_directivo.patch(
            url,
            data={"nuevo_estado": "ATENDIDO"},
            format="json",
        )

        assert response.status_code == 200
        assert response.json()["estado"] == "ATENDIDO"

    def test_usuario_sin_token_no_puede_actualizar(self, api_client, reporte):
        """Un usuario sin autenticación recibe 401."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        response = api_client.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        assert response.status_code == 401

    def test_estado_invalido_retorna_400(self, cliente_orientador, reporte):
        """Un estado no válido es rechazado por el serializer."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "INEXISTENTE"},
            format="json",
        )

        assert response.status_code == 400

    def test_reporte_inexistente_retorna_404(self, cliente_orientador):
        """Si el reporte no existe, se retorna 404."""
        url = ESTADO_URL_TEMPLATE.format(99999)
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        assert response.status_code == 404


@pytest.mark.django_db
class TestHistorialAuditoria:
    """Tests que verifican la creación correcta de registros de auditoría."""

    def test_se_crea_registro_de_auditoria(self, cliente_orientador, reporte):
        """Al actualizar el estado, se crea un SeguimientoCaso."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        cliente_orientador.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        seguimientos = SeguimientoCaso.objects.filter(reporte=reporte)
        assert seguimientos.count() == 1

    def test_registro_contiene_estado_anterior_y_nuevo(
        self, cliente_orientador, reporte
    ):
        """El registro de auditoría guarda correctamente ambos estados."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        cliente_orientador.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        seguimiento = SeguimientoCaso.objects.get(reporte=reporte)
        assert seguimiento.estado_anterior == "PENDIENTE"
        assert seguimiento.estado_nuevo == "EN_REVISION"

    def test_registro_contiene_usuario_responsable(
        self, cliente_orientador, reporte, usuario_orientador
    ):
        """El registro de auditoría guarda el usuario que hizo el cambio."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        cliente_orientador.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        seguimiento = SeguimientoCaso.objects.get(reporte=reporte)
        assert seguimiento.orientador == usuario_orientador
        assert seguimiento.orientador.email == "orientador@colegio.edu.co"

    def test_registro_contiene_fecha_del_cambio(
        self, cliente_orientador, reporte
    ):
        """El registro de auditoría tiene una fecha de atención válida."""
        antes = timezone.now()

        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        cliente_orientador.patch(
            url,
            data={"nuevo_estado": "EN_REVISION"},
            format="json",
        )

        despues = timezone.now()
        seguimiento = SeguimientoCaso.objects.get(reporte=reporte)
        assert antes <= seguimiento.fecha_atencion <= despues

    def test_registro_contiene_observaciones(
        self, cliente_orientador, reporte
    ):
        """Las observaciones del orientador se guardan en el registro."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)
        cliente_orientador.patch(
            url,
            data={
                "nuevo_estado": "ATENDIDO",
                "observaciones": "Se citó al acudiente del estudiante.",
            },
            format="json",
        )

        seguimiento = SeguimientoCaso.objects.get(reporte=reporte)
        assert seguimiento.observaciones == "Se citó al acudiente del estudiante."

    def test_multiples_cambios_generan_multiples_registros(
        self, cliente_orientador, reporte
    ):
        """Cada cambio de estado genera un registro independiente en el historial."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)

        cliente_orientador.patch(
            url, data={"nuevo_estado": "EN_REVISION"}, format="json"
        )
        cliente_orientador.patch(
            url, data={"nuevo_estado": "ATENDIDO"}, format="json"
        )
        cliente_orientador.patch(
            url, data={"nuevo_estado": "DESCARTADO"}, format="json"
        )

        seguimientos = SeguimientoCaso.objects.filter(reporte=reporte).order_by(
            "fecha_atencion"
        )
        assert seguimientos.count() == 3

        # Verificar la cadena completa de transiciones
        assert seguimientos[0].estado_anterior == "PENDIENTE"
        assert seguimientos[0].estado_nuevo == "EN_REVISION"

        assert seguimientos[1].estado_anterior == "EN_REVISION"
        assert seguimientos[1].estado_nuevo == "ATENDIDO"

        assert seguimientos[2].estado_anterior == "ATENDIDO"
        assert seguimientos[2].estado_nuevo == "DESCARTADO"

    def test_historial_incluido_en_respuesta_endpoint(
        self, cliente_orientador, reporte
    ):
        """La respuesta del endpoint incluye el historial de estados."""
        url = ESTADO_URL_TEMPLATE.format(reporte.id)

        cliente_orientador.patch(
            url, data={"nuevo_estado": "EN_REVISION"}, format="json"
        )
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "ATENDIDO", "observaciones": "Caso resuelto."},
            format="json",
        )

        data = response.json()
        assert "historial_estados" in data
        assert len(data["historial_estados"]) == 2

        # El más reciente primero (ordering = ["-fecha_atencion"])
        ultimo = data["historial_estados"][0]
        assert ultimo["estado_anterior"] == "EN_REVISION"
        assert ultimo["estado_nuevo"] == "ATENDIDO"
        assert ultimo["observaciones"] == "Caso resuelto."


@pytest.mark.django_db
class TestHistorialServiceDirecto:
    """Tests a nivel de service (sin HTTP), para mayor aislamiento."""

    def test_service_crea_historial_y_actualiza_estado(
        self, reporte, usuario_orientador
    ):
        """El service actualiza el estado y crea el historial atómicamente."""
        service = ReporteService()
        reporte_actualizado = service.actualizar_estado(
            reporte_id=reporte.id,
            nuevo_estado="EN_REVISION",
            usuario=usuario_orientador,
            observaciones="Revisión inicial.",
        )

        assert reporte_actualizado.estado == "EN_REVISION"

        seguimiento = SeguimientoCaso.objects.get(reporte=reporte)
        assert seguimiento.estado_anterior == "PENDIENTE"
        assert seguimiento.estado_nuevo == "EN_REVISION"
        assert seguimiento.orientador == usuario_orientador
        assert seguimiento.observaciones == "Revisión inicial."

    def test_service_con_reporte_inexistente(self, db, usuario_orientador):
        """El service lanza excepción si el reporte no existe."""
        from apps.reports.exceptions import ReporteNoEncontradoError

        service = ReporteService()
        with pytest.raises(ReporteNoEncontradoError):
            service.actualizar_estado(
                reporte_id=99999,
                nuevo_estado="EN_REVISION",
                usuario=usuario_orientador,
            )

    def test_consistencia_estado_e_historial(
        self, reporte, usuario_orientador
    ):
        """
        El estado del reporte y el último registro del historial son
        consistentes después de múltiples transiciones.
        """
        service = ReporteService()

        transiciones = [
            ("EN_REVISION", "Inicio de revisión"),
            ("ATENDIDO", "Se atendió el caso"),
            ("DESCARTADO", "Caso descartado tras investigación"),
        ]

        for nuevo_estado, obs in transiciones:
            service.actualizar_estado(
                reporte_id=reporte.id,
                nuevo_estado=nuevo_estado,
                usuario=usuario_orientador,
                observaciones=obs,
            )

        reporte.refresh_from_db()
        ultimo_seguimiento = SeguimientoCaso.objects.filter(
            reporte=reporte
        ).order_by("-fecha_atencion").first()

        assert reporte.estado == "DESCARTADO"
        assert ultimo_seguimiento.estado_nuevo == reporte.estado
        assert ultimo_seguimiento.observaciones == "Caso descartado tras investigación"
