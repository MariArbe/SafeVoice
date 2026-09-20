import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes')
c = conn.cursor()
c.execute('SELECT id, nombre FROM instituciones')
print('Instituciones:', c.fetchall())
c.execute('SELECT id, codigo FROM tipos_agresion')
print('Tipos:', c.fetchall())
