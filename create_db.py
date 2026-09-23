import pyodbc
conn = pyodbc.connect("DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;UID=sa;PWD=SafeVoice_Admin123!;TrustServerCertificate=yes", autocommit=True)
cursor = conn.cursor()
try:
    cursor.execute("CREATE DATABASE safevoice_db;")
    print("Database safevoice_db created successfully!")
except Exception as e:
    print("Notice:", e)
