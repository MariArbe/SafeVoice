"""
Configuración de URLs raíz del proyecto SafeVoice.

En esta primera etapa solo se incluyen las rutas de administración y
el schema de la API. Los routers de cada app se añadirán en etapas
subsiguientes.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Panel de administración de Django
    path("admin/", admin.site.urls),

    # Rutas de la app users (autenticación, gestión de usuarios)
    path("api/v1/users/", include("apps.users.urls")),

    # Rutas de la app reports (reportes anónimos)
    path("api/v1/reports/", include("apps.reports.urls")),
]
