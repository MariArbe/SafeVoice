from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import EsDirectivoOOrientador

from .models import Recurso
from .serializers import RecursoListSerializer, RecursoSerializer


class RecursosListView(APIView):
    """GET /api/v1/resources/ - lista pública de recursos activos."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        categoria = request.query_params.get("categoria")
        queryset = Recurso.objects.filter(activo=True)

        if categoria:
            queryset = queryset.filter(categoria=categoria)

        serializer = RecursoListSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RecursoAdminView(APIView):
    """CRUD para administración de recursos (directivo/orientador)."""

    permission_classes = [EsDirectivoOOrientador]

    def get(self, request):
        recursos = Recurso.objects.all().order_by("orden", "titulo")
        return Response(RecursoSerializer(recursos, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = RecursoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recurso = serializer.save()
        return Response(RecursoSerializer(recurso).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        recurso = Recurso.objects.filter(pk=pk).first()
        if recurso is None:
            return Response({"detail": "Recurso no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = RecursoSerializer(recurso, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        recurso = serializer.save()
        return Response(RecursoSerializer(recurso).data, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        recurso = Recurso.objects.filter(pk=pk).first()
        if recurso is None:
            return Response({"detail": "Recurso no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        recurso.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
