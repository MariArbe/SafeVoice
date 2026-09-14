"""
SafeVoice — Configuración de producción.
DEBUG desactivado. Todas las vars sensibles deben venir del entorno del servidor.
"""

from .base import *  # noqa: F401, F403
from .base import env

# ─── Seguridad ─────────────────────────────────────────────────────────────
DEBUG = False

ALLOWED_HOSTS = env("ALLOWED_HOSTS")

# Fuerza HTTPS
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000          # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"


# ─── Base de datos (SQL Server de producción) ──────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "mssql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT", default="1433"),
        "OPTIONS": {
            "driver": env("DB_DRIVER", default="ODBC Driver 18 for SQL Server"),
        },
    }
}


# ─── Logging estructurado en producción ────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
