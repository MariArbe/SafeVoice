"""
apps/institutions/urls.py — Rutas de la app institutions.
"""

from django.urls import path

from .views import RegistrarInstitucionView

app_name = "institutions"

urlpatterns = [
    # HU-11: Registro público de institución + directivo
    path("register/", RegistrarInstitucionView.as_view(), name="register"),
]
