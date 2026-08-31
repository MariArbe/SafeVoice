"""
SafeVoice — Configuración para el entorno de testing (CI/CD).
Usa SQLite en memoria para que los tests no requieran SQL Server.
"""

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

# ─── Sin logging en tests (reduce ruido) ───────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
}
