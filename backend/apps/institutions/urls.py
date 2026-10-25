"""
apps/institutions/urls.py — Rutas de la app institutions.
"""

from django.urls import path

from .views import ListarInstitucionesView, RegistrarInstitucionView

app_name = "institutions"

urlpatterns = [
    # Catálogo público y ligero de instituciones activas
    path("", ListarInstitucionesView.as_view(), name="list"),
    # HU-11: Registro público de institución + directivo
    path("register/", RegistrarInstitucionView.as_view(), name="register"),
]
