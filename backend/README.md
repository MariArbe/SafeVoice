# SafeVoice — Backend

Plataforma de reporte anónimo y gestión de casos de bullying escolar.  
**Stack**: Django 4.2 LTS · Django REST Framework · SQL Server · JWT

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Crear el entorno virtual](#3-crear-el-entorno-virtual)
4. [Instalar dependencias](#4-instalar-dependencias)
5. [Configurar variables de entorno](#5-configurar-variables-de-entorno)
6. [Correr migraciones](#6-correr-migraciones)
7. [Levantar el servidor local](#7-levantar-el-servidor-local)
8. [Endpoints disponibles](#8-endpoints-disponibles)
9. [Decisiones arquitectónicas clave](#9-decisiones-arquitectónicas-clave)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Python | 3.12+ | `python --version` |
| SQL Server | 2019+ | Express es suficiente para desarrollo |
| ODBC Driver | 17 o 18 | [Descarga Microsoft](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server) |

> **Windows**: Instalar ODBC Driver 18 for SQL Server desde el link de arriba antes de continuar.

---

## 2. Estructura del proyecto

```
backend/
├── config/                  ← Configuración del proyecto Django
│   ├── settings/
│   │   ├── base.py          ← Settings compartidos (todos los entornos)
│   │   ├── local.py         ← Desarrollo local (SQL Server + debug toolbar)
│   │   ├── test.py          ← Testing CI (SQLite en memoria)
│   │   └── production.py    ← Producción (HTTPS, logging estructurado)
│   ├── urls.py              ← Rutas raíz del proyecto
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── users/               ← Dominio de usuarios (Directivo, Orientador)
│   │   ├── models.py        ← Modelo Usuario (extiende AbstractUser)
│   │   ├── serializers.py   ← DTOs de entrada/salida
│   │   ├── services.py      ← Lógica de negocio
│   │   ├── views.py         ← Controladores HTTP
│   │   ├── permissions.py   ← Control de acceso por rol
│   │   └── exceptions.py    ← Excepciones del dominio
│   │
│   └── reports/             ← Dominio de reportes anónimos
│       ├── models.py        ← Modelo Reporte (sin FK a Usuario)
│       ├── repository.py    ← ReporteRepositoryProxy (Patrón Proxy)
│       ├── serializers.py   ← DTOs de entrada/salida
│       ├── services.py      ← Lógica de negocio
│       ├── views.py         ← Controladores HTTP
│       ├── permissions.py   ← AllowAny (crear) / EsDirectivoOOrientador (gestión)
│       └── exceptions.py    ← Excepciones del dominio
│
├── core/
│   ├── exceptions.py        ← Exception handler global de DRF
│   └── permissions.py       ← Permisos base reutilizables (EsDirectivo, EsOrientador)
│
├── requirements/
│   ├── base.txt             ← Dependencias de todos los entornos
│   ├── local.txt            ← + debug toolbar, black, flake8
│   ├── test.txt             ← + pytest, factory-boy
│   └── production.txt       ← + gunicorn, python-json-logger
│
├── manage.py
└── .env.example             ← Plantilla de variables de entorno
```

---

## 3. Crear el entorno virtual

```powershell
# Desde la carpeta /backend
python -m venv .venv

# Activar (PowerShell)
.venv\Scripts\Activate.ps1

# Activar (CMD)
.venv\Scripts\activate.bat
```

---

## 4. Instalar dependencias

```powershell
# Desarrollo local
pip install -r requirements/local.txt

# Testing
pip install -r requirements/test.txt

# Producción
pip install -r requirements/production.txt
```

---

## 5. Configurar variables de entorno

```powershell
# Copiar la plantilla
copy .env.example .env
```

Editar `.env` con los valores reales:

```env
DJANGO_SETTINGS_MODULE=config.settings.local
SECRET_KEY=<genera-una-clave-aleatoria>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=safevoice_db
DB_USER=sa
DB_PASSWORD=<tu-password>
DB_HOST=localhost
DB_PORT=1433
DB_DRIVER=ODBC Driver 18 for SQL Server

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

> **Generar SECRET_KEY**:
> ```powershell
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

---

## 6. Correr migraciones

```powershell
# Verificar configuración antes de migrar
python manage.py check

# Generar archivos de migración
python manage.py makemigrations users reports

# Aplicar migraciones a la base de datos
python manage.py migrate

# Crear superusuario (opcional, para acceder al admin)
python manage.py createsuperuser
```

> **Sin SQL Server disponible**: Cambia `DJANGO_SETTINGS_MODULE=config.settings.test`  
> en el `.env` para usar SQLite en memoria durante el desarrollo inicial.

---

## 7. Levantar el servidor local

```powershell
python manage.py runserver
```

El servidor queda disponible en `http://127.0.0.1:8000/`

**Panel de administración**: `http://127.0.0.1:8000/admin/`

---

## 8. Endpoints disponibles

### Usuarios (`/api/v1/users/`)

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/users/login/` | No | Obtiene JWT (access + refresh) |
| `POST` | `/api/v1/users/token/refresh/` | No | Renueva el access token |
| `GET` | `/api/v1/users/me/` | Bearer token | Datos del usuario autenticado |
| `POST` | `/api/v1/users/` | Bearer (Directivo) | Crear usuario (Etapa 2) |

### Reportes (`/api/v1/reports/`)

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/reports/` | **Ninguna** | Crear reporte anónimo |
| `GET` | `/api/v1/reports/consultar/?codigo=<uuid>` | **Ninguna** | Consultar estado por código |
| `GET` | `/api/v1/reports/listar/` | Bearer (Directivo/Orientador) | Listar todos los reportes |

### Formato de respuesta de error

Todas las respuestas de error siguen el esquema:

```json
{
  "error": {
    "code": "credenciales_invalidas",
    "message": "Correo electrónico o contraseña incorrectos.",
    "details": {}
  }
}
```

---

## 9. Decisiones arquitectónicas clave

### Anonimato estructural en dos capas

```
Capa 1 → CrearReporteSerializer:
          Nunca incluye campos identificables en su definición.

Capa 2 → ReporteRepositoryProxy (ALLOWED_FIELDS):
          Rechaza cualquier campo fuera de la lista blanca
          ANTES de ejecutar cualquier operación de escritura en el ORM.
```

Incluso si un desarrollador modifica el serializer por error, el proxy bloquea la operación.

### Flujo completo de un reporte anónimo

```
Cliente (sin auth) 
  → POST /api/v1/reports/
  → CrearReporteView (AllowAny, sin auth_classes)
  → CrearReporteSerializer.is_valid()
  → ReporteService.crear_reporte()
  → ReporteRepositoryProxy._validar_campos()  ← 🛡️ lista blanca
  → Reporte.objects.create()
  → Response 201 { codigo_seguimiento: "uuid..." }
```

### Roles como TextChoices

Los roles `DIRECTIVO` y `ORIENTADOR` son fijos y conocidos en tiempo de diseño.
`TextChoices` persiste como varchar, sin JOINs ni tablas adicionales.
Si en el futuro se necesita granularidad fina de permisos, se adopta `django-guardian` sin romper la API.

---

## Testing

```powershell
# Ejecutar todos los tests con SQLite en memoria
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
pytest

# Con reporte de cobertura
pytest --cov=apps --cov-report=html
```
