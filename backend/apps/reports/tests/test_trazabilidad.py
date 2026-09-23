import pytest
import uuid
from apps.reports.models import Reporte
from apps.institutions.models import Institution
from apps.reports.repository import ReporteRepositoryProxy
from apps.reports.exceptions import ReporteCampoNoPermitidoError
from cryptography.fernet import InvalidToken

@pytest.mark.django_db
class TestTrazabilidadYAnonimato:
    """
    Pruebas de trazabilidad (HU-05) para asegurar que el sistema cumple
    con la protección del anonimato y la seguridad de los datos.
    """

    def setup_method(self):
        self.proxy = ReporteRepositoryProxy()
        
        # Crear la institución de prueba
        institucion = Institution.objects.create(nombre="Colegio Prueba")
        
        self.datos_validos = {
            "institucion_id": institucion.id,
            "ubicacion": "BANOS",
            "frecuencia": "MESES",
            "grado_victima": "Noveno",
            "involucrados_tipo": "GRUPO",
            "descripcion": "Texto confidencial de prueba",
            "acepta_revelar_identidad": False
        }

    def test_proxy_rechaza_campos_identificables(self):
        """
        Verifica que el proxy bloquee cualquier intento de guardar
        metadatos que puedan identificar al usuario (IP, User Agent, etc).
        """
        datos_maliciosos = self.datos_validos.copy()
        # Intentamos inyectar campos no permitidos
        datos_maliciosos["ip_address"] = "192.168.1.1"
        datos_maliciosos["user_agent"] = "Mozilla/5.0"
        datos_maliciosos["usuario_id"] = 99

        with pytest.raises(ReporteCampoNoPermitidoError) as exc_info:
            self.proxy.crear(datos_maliciosos)
        
        # Verificamos que el error contenga los campos prohibidos (el proxy los inyecta en la clase)
        campos = exc_info.value.campos_prohibidos
        assert "ip_address" in campos
        assert "user_agent" in campos
        assert "usuario_id" in campos

    def test_descripcion_encriptada_en_base_de_datos(self):
        """
        Verifica que la descripción se guarda encriptada en la tabla y que
        es imposible leer el texto original usando consultas crudas del ORM.
        """
        texto_original = "Texto confidencial de prueba"
        reporte_creado = self.proxy.crear(self.datos_validos)
        
        # Consultamos directamente la BD saltándonos el Proxy
        reporte_bd = Reporte.objects.get(codigo_seguimiento=reporte_creado.codigo_seguimiento)
        
        # La descripción guardada NO debe ser igual a la original
        assert reporte_bd.descripcion != texto_original
        # La descripción guardada debe lucir como un hash/token (usualmente termina en == o similar, 
        # pero con certeza no contendrá las palabras originales)
        assert "confidencial" not in reporte_bd.descripcion
        assert len(reporte_bd.descripcion) > len(texto_original)

    def test_desencriptacion_exitosa_por_proxy(self):
        """
        Verifica que, a pesar de estar encriptada en BD, el proxy puede
        devolver la información en texto plano para el orientador autorizado.
        """
        reporte_creado = self.proxy.crear(self.datos_validos)
        
        # Usamos el proxy para recuperar (simulando vista del docente)
        reporte_recuperado = self.proxy.obtener_por_codigo(reporte_creado.codigo_seguimiento)
        
        assert reporte_recuperado.descripcion == "Texto confidencial de prueba"
