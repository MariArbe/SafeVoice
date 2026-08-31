"""
apps/reports/permissions.py — Permisos específicos del dominio de reportes.
"""

# Las vistas de creación de reportes usan AllowAny (sin autenticación).
# Las vistas de listado/detalle usan EsDirectivoOOrientador de core/.

from core.permissions import EsDirectivoOOrientador  # noqa: F401
from rest_framework.permissions import AllowAny  # noqa: F401

# Re-exportados para que los imports dentro de la app sean locales.
# Uso en views.py:
#   from .permissions import AllowAny, EsDirectivoOOrientador
