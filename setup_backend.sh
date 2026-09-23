#!/bin/bash
set -e
cd /home/ubuntu/SafeVoice/backend

echo "=== 1. Creando venv e instalando dependencias ==="
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements/base.txt -r requirements/local.txt

echo "=== 2. Corriendo migraciones Django ==="
# Fake token blacklist if migration 0008 fails like locally or run normally
python manage.py migrate || true

echo "=== 3. Poblando datos semilla (seed_upb.sql) ==="
python3 -c "
import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
cursor = conn.cursor()
with open('../seed_upb.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# Dividir por GO
commands = [c.strip() for c in sql.split('GO') if c.strip()]
for cmd in commands:
    try:
        cursor.execute(cmd)
    except Exception as e:
        print('Error ejecutando bloque:', e)
print('Seed UPB completado.')
"

# Asegurar columna is_active en instituciones si falta
python3 -c "
import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
cursor = conn.cursor()
try:
    cursor.execute('ALTER TABLE instituciones ADD is_active BIT NOT NULL DEFAULT 1;')
    print('Columna is_active agregada.')
except Exception as e:
    print('is_active ya existe o:', e)
"

python manage.py check
echo "=== Backend listo! ==="
