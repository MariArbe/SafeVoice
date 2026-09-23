import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=safevoice_db;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes', autocommit=True)
c = conn.cursor()
c.execute("UPDATE usuarios SET is_superuser=1 WHERE email='directivo@upb.edu.co';")
c.execute("SELECT email, is_superuser, is_staff FROM usuarios;")
print('Usuarios en la nube:', c.fetchall())
