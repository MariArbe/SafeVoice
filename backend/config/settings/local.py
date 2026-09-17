"""
SafeVoice — Configuración para desarrollo local.
Extiende base.py. Activa herramientas de debugging.
"""

from .base import *  # noqa: F401, F403
from .base import env, BASE_DIR

# ─── Debug ─────────────────────────────────────────────────────────────────
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]


# ─── Base de datos (SQL Server local) ──────────────────────────────────────
# Requiere ODBC Driver 17/18 instalado.
# Ver .env.example para las variables necesarias.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ─── Apps adicionales solo en local ────────────────────────────────────────
INSTALLED_APPS += [  # noqa: F405
    "debug_toolbar",
    "drf_spectacular",
]

MIDDLEWARE += [  # noqa: F405
    "debug_toolbar.middleware.DebugToolbarMiddleware",
]

INTERNAL_IPS = ["127.0.0.1"]


# ─── Email (consola en local) ───────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# ─── Logging en local (DEBUG a consola) ────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "anonymize_ip": {
            "()": "core.logging_filters.AnonymizeIPFilter",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "filters": ["anonymize_ip"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
