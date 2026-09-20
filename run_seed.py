import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
cursor = conn.cursor()
with open('/home/ubuntu/SafeVoice/seed_upb.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

commands = [c.strip() for c in sql.split('GO') if c.strip()]
for cmd in commands:
    try:
        cursor.execute(cmd)
    except Exception as e:
        print('Aviso SQL:', e)

cursor.execute('SELECT COUNT(*) FROM reportes')
print('Total de reportes en base de datos:', cursor.fetchone()[0])
cursor.execute('SELECT COUNT(*) FROM usuarios')
print('Total de usuarios en base de datos:', cursor.fetchone()[0])
cursor.execute('SELECT COUNT(*) FROM tipos_agresion')
print('Total de tipos de agresi?n:', cursor.fetchone()[0])
