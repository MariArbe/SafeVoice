from django.urls import path

from .views import RecursoAdminView, RecursosListView

app_name = "resources"

urlpatterns = [
    path("", RecursosListView.as_view(), name="recursos-publicos"),
    path("admin/", RecursoAdminView.as_view(), name="recursos-admin"),
    path("admin/<int:pk>/", RecursoAdminView.as_view(), name="recurso-admin-detalle"),
]
