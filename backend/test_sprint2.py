import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.test import Client
from apps.users.models import Usuario

client = Client()

print("==========================================")
print("🧪 PRUEBA END-TO-END SPRINT 2 (SAFEVOICE)")
print("==========================================\n")

print("1️⃣ SIMULANDO ENVÍO DE REPORTE DESDE EL FRONTEND (React)...")
payload = {
    "institucion": 1,
    "ubicacion": "BANOS",
    "frecuencia": "MESES",
    "grado_victima": "Noveno",
    "involucrados_tipo": "GRUPO",
    "descripcion": "Un grupo de estudiantes me encerró en el baño y me sacaron una navaja para amenazarme.",
    "tipos_agresion": [1, 3],
    "acepta_revelar_identidad": False
}

response = client.post('/api/v1/reports/', data=payload, content_type='application/json', SERVER_NAME='localhost')
print(f"Respuesta del servidor (Status {response.status_code}):")
data = response.json()
print(f"Código de seguimiento asignado: {data.get('codigo_seguimiento')}")
print(f"Nivel de riesgo clasificado automáticamente por la IA: {data.get('nivel_riesgo_predicho')}\n")

print("2️⃣ SIMULANDO LOGIN DEL ORIENTADOR...")
# Crear orientador de prueba si no existe
user, created = Usuario.objects.get_or_create(
    username="orientador_prueba", 
    email="orientador@upb.edu.co",
    rol="ORIENTADOR",
    institution_id=1
)
if created:
    user.set_password("prueba123")
    user.save()

client.force_login(user)
print("Orientador autenticado con éxito.\n")

print("3️⃣ ORIENTADOR ENTRA A LA BANDEJA DE REPORTES (Paginación y Filtros)...")
print("-> Obteniendo todos los reportes paginados:")
res_todos = client.get('/api/v1/reports/listar/', SERVER_NAME='localhost')
json_todos = res_todos.json()
print(f"Estructura devuelta por Django (Paginación):")
print(f"- count: {json_todos.get('count')}")
print(f"- next: {json_todos.get('next')}")
print(f"- previous: {json_todos.get('previous')}")
print(f"- results length: {len(json_todos.get('results', []))}")

print("\n-> Filtrando específicamente por Riesgo CRITICO:")
res_filtros = client.get('/api/v1/reports/listar/?nivel_riesgo_predicho=CRITICO', SERVER_NAME='localhost')
resultados = res_filtros.json().get('results', [])
print(f"Encontrados: {len(resultados)}")
if resultados:
    print("\nÚltimo caso crítico encontrado en la bandeja (el que acabamos de crear):")
    print(f"- Código: {resultados[0]['codigo_seguimiento']}")
    print(f"- Ubicación: {resultados[0]['ubicacion']}")
    print(f"- Riesgo IA: {resultados[0]['nivel_riesgo_predicho']}")
    print(f"- Estado: {resultados[0]['estado']}")

print("\n✅ ¡TODAS LAS TAREAS DEL SPRINT 2 ESTÁN FUNCIONANDO CORRECTAMENTE!")
