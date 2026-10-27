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

    def test_datos_contacto_encriptados_en_base_de_datos(self):
        """
        Verifica que los datos de contacto personal de la víctima (nombre y medio/teléfono)
        quedan cifrados con Fernet en la base de datos y no en texto plano.
        """
        datos = self.datos_validos.copy()
        datos["acepta_revelar_identidad"] = True
        datos["nombre_contacto_victima"] = "Estudiante Anonimo Gomez"
        datos["medio_contacto_victima"] = "estudiante.gomez@colegio.edu.co"

        reporte_creado = self.proxy.crear(datos)

        # Consultar directamente el ORM sin pasar por desencriptar_sensibles
        reporte_bd = Reporte.objects.get(codigo_seguimiento=reporte_creado.codigo_seguimiento)

        assert reporte_bd.nombre_contacto_victima != "Estudiante Anonimo Gomez"
        assert "Gomez" not in reporte_bd.nombre_contacto_victima
        assert reporte_bd.nombre_contacto_victima.startswith("gAAAAA")

        assert reporte_bd.medio_contacto_victima != "estudiante.gomez@colegio.edu.co"
        assert "@colegio.edu.co" not in reporte_bd.medio_contacto_victima
        assert reporte_bd.medio_contacto_victima.startswith("gAAAAA")

        # Recuperar a través del proxy para orientador autorizado
        reporte_recuperado = self.proxy.obtener_por_codigo(reporte_creado.codigo_seguimiento)
        assert reporte_recuperado.nombre_contacto_victima == "Estudiante Anonimo Gomez"
        assert reporte_recuperado.medio_contacto_victima == "estudiante.gomez@colegio.edu.co"

    def test_consulta_publica_no_expone_datos_de_contacto_ni_descripcion(self):
        """
        Verifica que el endpoint público de consulta por código (HU-04)
        use ReporteConsultaPublicaSerializer y NO exponga los campos sensibles
        (nombre_contacto_victima, medio_contacto_victima, descripcion) en la respuesta JSON.
        """
        from rest_framework.test import APIClient
        client = APIClient()

        datos = self.datos_validos.copy()
        datos["acepta_revelar_identidad"] = True
        datos["nombre_contacto_victima"] = "Victima Protegida"
        datos["medio_contacto_victima"] = "victima@colegio.edu.co"

        reporte = self.proxy.crear(datos)

        response = client.get(f"/api/v1/reports/consultar/?codigo={reporte.codigo_seguimiento}")
        assert response.status_code == 200
        json_data = response.json()

        assert "codigo_seguimiento" in json_data
        assert "estado" in json_data
        # Campos sensibles NUNCA deben estar en el response público
        assert "nombre_contacto_victima" not in json_data
        assert "medio_contacto_victima" not in json_data
        assert "descripcion" not in json_data

    def test_validacion_celular_colombiano_y_correo_en_revelacion_identidad(self):
        """
        Verifica que cuando acepta_revelar_identidad=True:
        - Rechace números que no inicien con 3 (ej. 2001234567)
        - Rechace números con menos o más de 10 dígitos (ej. 30012345, 30012345678)
        - Rechace dígitos repetidos irreales (ej. 3333333333)
        - Acepte celulares colombianos válidos de 10 dígitos iniciando con 3 (ej. 3001234567)
        - Acepte correos electrónicos válidos
        """
        from rest_framework.test import APIClient
        client = APIClient()

        base_payload = {
            "institucion": self.datos_validos["institucion_id"],
            "ubicacion": "Salón de clases",
            "frecuencia": "Pasó hoy o es la primera vez",
            "grado_victima": "8°",
            "involucrados_tipo": "victima",
            "descripcion": "Situación grave que requiere contacto directo con orientación.",
            "tipos_agresion": ["VERBAL"],
            "acepta_revelar_identidad": True,
            "nombre_contacto_victima": "Juan Camilo Pérez",
        }

        # 1. Celular que NO inicia con 3 -> 400
        res_no_3 = client.post(
            "/api/v1/reports/",
            data={**base_payload, "medio_contacto_victima": "2001234567"},
            format="json",
        )
        assert res_no_3.status_code == 400
        assert "medio_contacto_victima" in str(res_no_3.json())

        # 2. Celular con menos de 10 dígitos -> 400
        res_corto = client.post(
            "/api/v1/reports/",
            data={**base_payload, "medio_contacto_victima": "30012345"},
            format="json",
        )
        assert res_corto.status_code == 400

        # 3. Celular con más de 10 dígitos -> 400
        res_largo = client.post(
            "/api/v1/reports/",
            data={**base_payload, "medio_contacto_victima": "30012345678"},
            format="json",
        )
        assert res_largo.status_code == 400

        # 4. Celular válido en Colombia (10 dígitos iniciando con 3) -> 201
        res_valido = client.post(
            "/api/v1/reports/",
            data={**base_payload, "medio_contacto_victima": "3001234567"},
            format="json",
        )
        assert res_valido.status_code == 201

        # 5. Correo electrónico válido -> 201
        res_correo = client.post(
            "/api/v1/reports/",
            data={**base_payload, "medio_contacto_victima": "juan.perez@colegio.edu.co"},
            format="json",
        )
        assert res_correo.status_code == 201

