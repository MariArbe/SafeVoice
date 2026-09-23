#!/bin/bash
set -e
cd /home/ubuntu/SafeVoice/backend
source .venv/bin/activate

echo "=== 1. Fakeando migraci?n conflictiva de tokens ==="
python manage.py migrate --fake token_blacklist || true

echo "=== 2. Creando migraciones pendientes para reports ==="
python manage.py makemigrations reports
python manage.py migrate

echo "=== 3. Asegurando columna institucion_id en usuarios ==="
python3 -c "
import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
cursor = conn.cursor()
try:
    cursor.execute(\"EXEC sp_rename 'usuarios.institution_id', 'institucion_id', 'COLUMN';\")
    print('Renombrado institution_id a institucion_id')
except Exception as e:
    print('Columna ya es institucion_id o error:', e)
"

echo "=== 4. Ejecutando seed_upb.sql completo ==="
python3 -c "
import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
cursor = conn.cursor()
with open('../seed_upb.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

commands = [c.strip() for c in sql.split('GO') if c.strip()]
for cmd in commands:
    try:
        cursor.execute(cmd)
    except Exception as e:
        print('Aviso en comando:', e)
print('Seed ejecutado con ?xito.')
"
