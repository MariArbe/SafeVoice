"""
apps/users/apps.py — Configuración de la app users.
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"
    verbose_name = "Usuarios"
