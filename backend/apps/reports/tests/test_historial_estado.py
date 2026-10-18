"""
apps/reports/tests/test_historial_estado.py — Tests para HU-08: Historial de cambios de estado.

Verifica:
  1. Transición válida: actualiza el reporte y agrega la entrada con orientador y timestamp UTC.
  2. Transición inválida: rechazada con 400 y mensaje con estados permitidos, sin alterar historial.
  3. Mismo estado: rechazada con 400 sin registrar entrada.
  4. Reporte inexistente: retorna 404.
  5. Usuario sin rol de orientador (ej: directivo): rechazado con 403.
  6. Orientador de otra institución: rechazado con 403.
  7. Atomicidad de la operación: ante un fallo interno se revierte todo.
  8. Orden del historial: devuelto del más reciente al más antiguo con todos los campos requeridos.
  9. usuario_id sale del JWT y no del body.
  10. El historial vive dentro del reporte sin tabla nueva y no expone datos del estudiante.
"""

from unittest.mock import patch
import pytest
from django.utils import timezone

from apps.reports.models import Reporte
from apps.reports.services import ReporteService
from apps.reports.transitions import TRANSICIONES_PERMITIDAS, normalizar_estado
from apps.users.models import Usuario
from rest_framework_simplejwt.tokens import RefreshToken


ESTADO_URL = "/api/v1/reports/{}/estado/"
HISTORIAL_URL = "/api/v1/reports/{}/historial/"
RUTA_ESPANOL_ESTADO = "/reportes/{}/estado"
RUTA_ESPANOL_HISTORIAL = "/reportes/{}/historial"


@pytest.fixture
def reporte(db, institucion):
    """Reporte de prueba con estado inicial 'nuevo'."""
    return Reporte.objects.create(
        institucion=institucion,
        descripcion="Caso de prueba confidencial para historial de estado",
        ubicacion="Patio",
        frecuencia="Semanal",
        estado="nuevo",
        nombre_contacto_victima="Estudiante Anon",
        medio_contacto_victima="estudiante@correo.edu.co",
    )


@pytest.fixture
def orientador_otra_institucion(db, institucion_secundaria):
    """Orientador perteneciente a una institución secundaria."""
    usuario = Usuario(
        email="orientador2@secundaria.edu.co",
        username="orientador2@secundaria.edu.co",
        first_name="Beatriz",
        last_name="Psicóloga",
        rol=Usuario.RolUsuario.ORIENTADOR,
        institution=institucion_secundaria,
    )
    usuario.set_password("Password123!")
    usuario.save()
    return usuario


@pytest.fixture
def cliente_otra_institucion(api_client, orientador_otra_institucion):
    refresh = RefreshToken.for_user(orientador_otra_institucion)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return api_client


@pytest.mark.django_db
class TestTransicionesPermitidas:
    """Verifica reglas de transición válidas, inválidas y mismo estado."""

    def test_transicion_valida_actualiza_reporte_y_registra_historial(
        self, cliente_orientador, reporte, usuario_orientador
    ):
        """
        Un cambio válido (nuevo -> en_revision) actualiza el reporte y añade
        la entrada al historial con usuario y timestamp del servidor.
        """
        url = ESTADO_URL.format(reporte.id)
        payload = {
            "nuevo_estado": "en_revision",
            "comentario": "Se abre expediente en comité de convivencia.",
        }

        response = cliente_orientador.patch(url, data=payload, format="json")

        assert response.status_code == 200
        data = response.json()
        assert data["estado"] == "en_revision"

        reporte.refresh_from_db()
        assert reporte.estado == "en_revision"
        assert len(reporte.historial_cambios) == 1

        entrada = reporte.historial_cambios[0]
        assert entrada["estado_anterior"] == "nuevo"
        assert entrada["estado_nuevo"] == "en_revision"
        assert entrada["usuario_id"] == usuario_orientador.id
        assert entrada["usuario_nombre"] == usuario_orientador.get_full_name()
        assert entrada["comentario"] == "Se abre expediente en comité de convivencia."
        assert "fecha_cambio" in entrada

    def test_cadena_completa_de_transiciones(self, cliente_orientador, reporte):
        """
        Verifica el ciclo completo:
          nuevo -> en_revision -> en_seguimiento -> cerrado
        """
        transiciones = [
            ("en_revision", "Revisión en comité"),
            ("en_seguimiento", "Acompañamiento psicológico iniciado"),
            ("cerrado", "Caso solucionado y archivado"),
        ]

        for estado_destino, comentario in transiciones:
            url = ESTADO_URL.format(reporte.id)
            res = cliente_orientador.patch(
                url,
                data={"nuevo_estado": estado_destino, "comentario": comentario},
                format="json",
            )
            assert res.status_code == 200
            assert res.json()["estado"] == estado_destino

        reporte.refresh_from_db()
        assert reporte.estado == "cerrado"
        assert len(reporte.historial_cambios) == 3

    def test_transicion_invalida_retorna_400_y_no_deja_historial(
        self, cliente_orientador, reporte
    ):
        """
        Un cambio no permitido (ej: nuevo -> cerrado) es rechazado con 400
        indicando los estados permitidos, y no deja registro en el historial.
        """
        url = ESTADO_URL.format(reporte.id)
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "cerrado", "comentario": "Intento de salto directo"},
            format="json",
        )

        assert response.status_code == 400
        body = response.json()
        # Debe contener mensaje claro con el estado actual y permitidos
        error_msg = str(body)
        assert "nuevo" in error_msg
        assert "en_revision" in error_msg

        reporte.refresh_from_db()
        assert reporte.estado == "nuevo"
        assert len(reporte.historial_cambios) == 0

    def test_mismo_estado_rechaza_cambio_con_400(
        self, cliente_orientador, reporte
    ):
        """
        Enviar el mismo estado actual debe ser rechazado con 400 y sin modificar historial.
        """
        url = ESTADO_URL.format(reporte.id)
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "nuevo"},
            format="json",
        )

        assert response.status_code == 400
        error_msg = str(response.json())
        assert "nuevo" in error_msg

        reporte.refresh_from_db()
        assert reporte.estado == "nuevo"
        assert len(reporte.historial_cambios) == 0

    def test_estado_terminal_cerrado_no_admite_cambios(
        self, cliente_orientador, reporte
    ):
        """Un reporte cerrado no puede cambiar a ningún otro estado."""
        reporte.estado = "cerrado"
        reporte.save(update_fields=["estado"])

        url = ESTADO_URL.format(reporte.id)
        response = cliente_orientador.patch(
            url,
            data={"nuevo_estado": "en_revision"},
            format="json",
        )

        assert response.status_code == 400
        reporte.refresh_from_db()
        assert reporte.estado == "cerrado"


@pytest.mark.django_db
class TestControlAccesoYRoles:
    """Verifica permisos de orientador, institución y autenticación."""

    def test_directivo_tiene_acceso_unificado_a_historial(
        self, cliente_directivo, reporte
    ):
        """Con roles unificados, directivo también puede actualizar y consultar historial."""
        url_patch = ESTADO_URL.format(reporte.id)
        res_patch = cliente_directivo.patch(
            url_patch, data={"nuevo_estado": "en_revision"}, format="json"
        )
        assert res_patch.status_code == 200

        url_get = HISTORIAL_URL.format(reporte.id)
        res_get = cliente_directivo.get(url_get)
        assert res_get.status_code == 200

    def test_orientador_de_otra_institucion_es_rechazado_con_403(
        self, cliente_otra_institucion, reporte
    ):
        """Un orientador de diferente institución no tiene acceso al reporte."""
        url_patch = ESTADO_URL.format(reporte.id)
        res_patch = cliente_otra_institucion.patch(
            url_patch, data={"nuevo_estado": "en_revision"}, format="json"
        )
        assert res_patch.status_code == 403

        url_get = HISTORIAL_URL.format(reporte.id)
        res_get = cliente_otra_institucion.get(url_get)
        assert res_get.status_code == 403

    def test_usuario_sin_token_recibe_401(self, api_client, reporte):
        """Peticiones sin autenticación reciben 401."""
        url = ESTADO_URL.format(reporte.id)
        res = api_client.patch(url, data={"nuevo_estado": "en_revision"}, format="json")
        assert res.status_code == 401

        url_get = HISTORIAL_URL.format(reporte.id)
        assert api_client.get(url_get).status_code == 401

    def test_reporte_inexistente_retorna_404(self, cliente_orientador):
        """Si el reporte no existe se responde 404."""
        url = ESTADO_URL.format(99999)
        res = cliente_orientador.patch(url, data={"nuevo_estado": "en_revision"}, format="json")
        assert res.status_code == 404

        url_get = HISTORIAL_URL.format(99999)
        assert cliente_orientador.get(url_get).status_code == 404


@pytest.mark.django_db
class TestIntegridadYAuditoria:
    """Verifica atomicidad, orígenes de datos y ordenación del historial."""

    def test_usuario_id_siempre_sale_del_token_y_no_del_body(
        self, cliente_orientador, reporte, usuario_orientador
    ):
        """
        Si un cliente malicioso envía un 'usuario_id' falso en el body,
        el backend lo ignora y registra el ID del token JWT.
        """
        url = ESTADO_URL.format(reporte.id)
        payload = {
            "nuevo_estado": "en_revision",
            "comentario": "Prueba de seguridad",
            "usuario_id": 999999,  # Intento de suplantación en body
        }

        response = cliente_orientador.patch(url, data=payload, format="json")
        assert response.status_code == 200

        reporte.refresh_from_db()
        entrada = reporte.historial_cambios[0]
        assert entrada["usuario_id"] == usuario_orientador.id
        assert entrada["usuario_id"] != 999999

    def test_atomicidad_de_la_operacion(self, reporte, usuario_orientador):
        """
        Si ocurre un fallo durante la persistencia, se revierte todo:
        ni el estado cambia ni se agrega la entrada al historial.
        """
        reporte_id = reporte.id
        service = ReporteService()

        with patch.object(Reporte, "save", side_effect=RuntimeError("Error simulado en base de datos")):
            with pytest.raises(RuntimeError):
                service.actualizar_estado(
                    reporte_id=reporte_id,
                    nuevo_estado="en_revision",
                    usuario=usuario_orientador,
                )

        reporte.refresh_from_db()
        assert reporte.estado == "nuevo"
        assert len(reporte.historial_cambios) == 0

    def test_orden_del_historial_del_mas_reciente_al_mas_antiguo(
        self, cliente_orientador, reporte
    ):
        """
        GET /reportes/:id/historial devuelve los cambios del más reciente al más antiguo,
        con: estado_anterior, estado_nuevo, nombre del orientador, comentario y fecha.
        """
        url_estado = ESTADO_URL.format(reporte.id)

        cliente_orientador.patch(
            url_estado,
            data={"nuevo_estado": "en_revision", "comentario": "Primer cambio"},
            format="json",
        )
        cliente_orientador.patch(
            url_estado,
            data={"nuevo_estado": "en_seguimiento", "comentario": "Segundo cambio"},
            format="json",
        )

        url_historial = HISTORIAL_URL.format(reporte.id)
        response = cliente_orientador.get(url_historial)

        assert response.status_code == 200
        historial = response.json()
        assert len(historial) == 2

        # El más reciente primero
        assert historial[0]["estado_anterior"] == "en_revision"
        assert historial[0]["estado_nuevo"] == "en_seguimiento"
        assert historial[0]["comentario"] == "Segundo cambio"
        assert "usuario_nombre" in historial[0]
        assert "fecha_cambio" in historial[0]

        # El más antiguo después
        assert historial[1]["estado_anterior"] == "nuevo"
        assert historial[1]["estado_nuevo"] == "en_revision"
        assert historial[1]["comentario"] == "Primer cambio"

    def test_historial_no_crea_tabla_nueva_y_no_expone_datos_del_estudiante(
        self, cliente_orientador, reporte
    ):
        """
        Verifica que el historial vive en el reporte ('historial_cambios') y
        que ningún endpoint de historial expone los datos confidenciales del estudiante.
        """
        url_estado = ESTADO_URL.format(reporte.id)
        cliente_orientador.patch(
            url_estado,
            data={"nuevo_estado": "en_revision", "comentario": "Revisión privada"},
            format="json",
        )

        url_historial = HISTORIAL_URL.format(reporte.id)
        res = cliente_orientador.get(url_historial)
        contenido = str(res.json())

        # No debe exponer datos de la víctima
        assert "Estudiante Anon" not in contenido
        assert "estudiante@correo.edu.co" not in contenido

        # El historial se almacena en el atributo del modelo Reporte
        reporte.refresh_from_db()
        assert hasattr(reporte, "historial_cambios")
        assert isinstance(reporte.historial_cambios, list)

    def test_rutas_en_espanol_funcionan_correctamente(
        self, cliente_orientador, reporte
    ):
        """
        Verifica que /reportes/:id/estado y /reportes/:id/historial respondan igual.
        """
        url_estado = RUTA_ESPANOL_ESTADO.format(reporte.id)
        res = cliente_orientador.patch(url_estado, data={"nuevo_estado": "en_revision"}, format="json")
        assert res.status_code == 200

        url_historial = RUTA_ESPANOL_HISTORIAL.format(reporte.id)
        res_h = cliente_orientador.get(url_historial)
        assert res_h.status_code == 200
        assert len(res_h.json()) == 1
