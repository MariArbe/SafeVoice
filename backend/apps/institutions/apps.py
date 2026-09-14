"""
apps/institutions/apps.py — Configuración de la app institutions.
"""

from django.apps import AppConfig


class InstitutionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.institutions"
    verbose_name = "Instituciones"
