from rest_framework import serializers

from .models import Recurso


class RecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = [
            "id",
            "titulo",
            "categoria",
            "descripcion",
            "telefono",
            "correo",
            "url",
            "activo",
            "orden",
        ]
        read_only_fields = ["id"]


class RecursoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = [
            "id",
            "titulo",
            "categoria",
            "descripcion",
            "telefono",
            "correo",
            "url",
        ]
        read_only_fields = fields
