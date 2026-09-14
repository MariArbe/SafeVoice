"""
apps/users/urls.py — Rutas de la app users.
"""

from django.urls import path

from .views import CrearUsuarioView, LoginView, RefreshTokenView, UsuarioMeView

app_name = "users"

urlpatterns = [
    # Autenticación
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token-refresh"),

    # Perfil del usuario autenticado
    path("me/", UsuarioMeView.as_view(), name="me"),

    # Gestión de usuarios (solo Directivo)
    path("", CrearUsuarioView.as_view(), name="crear-usuario"),
]
