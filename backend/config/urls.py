"""
Configuración de URLs raíz del proyecto SafeVoice.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    # Panel de administración de Django
    path("admin/", admin.site.urls),

    # Rutas de la app users (autenticación, gestión de usuarios)
    path("api/v1/users/", include("apps.users.urls")),

    # Rutas de la app institutions (registro de institución — HU-11)
    path("api/v1/institutions/", include("apps.institutions.urls")),

    # Rutas de la app reports (reportes anónimos e historial de cambios)
    path("api/v1/reports/", include("apps.reports.urls")),
    path("api/v1/reportes/", include("apps.reports.urls")),
    path("reports/", include("apps.reports.urls")),
    path("reportes/", include("apps.reports.urls")),

    # Rutas de la app resources (recursos de ayuda)
    path("api/v1/resources/", include("apps.resources.urls")),
]

# Servir archivos estáticos y multimedia de evidencias (compatible tanto en dev como prod)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
