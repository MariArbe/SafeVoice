import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
c = conn.cursor()
tables = ['seguimiento_casos', 'reportes_tipos_agresion', 'reportes', 'tipos_agresion', 'usuarios', 'instituciones']
for t in tables:
    try:
        c.execute(f"DELETE FROM {t};")
    except Exception as e:
        print(f"Error delete {t}:", e)

reseed_tables = ['instituciones', 'tipos_agresion', 'usuarios', 'reportes', 'seguimiento_casos']
for t in reseed_tables:
    try:
        c.execute(f"DBCC CHECKIDENT ('{t}', RESEED, 0);")
    except Exception as e:
        print(f"Error reseed {t}:", e)

with open('/home/ubuntu/SafeVoice/seed_upb.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

for cmd in [cmd.strip() for cmd in sql.split('GO') if cmd.strip()]:
    try:
        c.execute(cmd)
    except Exception as e:
        print('Aviso SQL:', e)

c.execute('SELECT id, nombre FROM instituciones;')
print('Instituciones reseeded:', c.fetchall())
c.execute('SELECT id, codigo FROM tipos_agresion;')
print('Tipos reseeded:', c.fetchall())
