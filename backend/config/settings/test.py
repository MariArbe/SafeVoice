"""
SafeVoice — Configuración para el entorno de testing (CI/CD).
Usa SQLite en memoria para que los tests no requieran SQL Server.
"""

import os

# Proveer SECRET_KEY antes de que base.py intente leerla del .env
# (en tests no hay .env; este valor no es secreto ni se usa en producción)
os.environ.setdefault(
    "SECRET_KEY",
    "django-insecure-test-only-key-not-for-production-safevoice",
)

from .base import *  # noqa: F401, F403

# ─── Testing con SQLite en memoria ─────────────────────────────────────────
# Permite correr pytest sin tener SQL Server disponible en CI.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# ─── Contraseñas más rápidas en tests ──────────────────────────────────────
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# ─── Debug desactivado en tests ────────────────────────────────────────────
DEBUG = False

# ─── Email silenciado en tests ─────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# ─── Deshabilitar rate limiting en tests (evita 429 en el test suite) ──────────
# El throttling usa la IP del cliente; en tests todos los requests son localhost,
# lo que dispararía los límites prematuramente.
REST_FRAMEWORK = {
    **__import__("config.settings.base", fromlist=["REST_FRAMEWORK"]).REST_FRAMEWORK,
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
}
