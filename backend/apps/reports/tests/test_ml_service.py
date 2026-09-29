"""
apps/reports/tests/test_ml_service.py — Pruebas unitarias del Modelo de IA (HU-12).

Valida:
1. Regla determinista Fail-Safe (detección de palabras críticas y armas).
2. Clasificación probabilística con Random Forest (Bajo, Medio, Alto, Crítico).
3. Manejo de robustez y resiliencia ante entradas vacías o atípicas (Edge Cases).
"""

import pytest
from apps.reports.ml_service import predecir_nivel_riesgo


class TestMLServiceFailSafe:
    """Pruebas para verificar la regla determinista de emergencia (Fail-Safe)."""

    @pytest.mark.parametrize(
        "palabra_critica",
        [
            "navaja",
            "cuchillo",
            "pistola",
            "matar",
            "te voy a matar",
            "suicidio",
            "asfixiar",
            "apuñalar",
            "sangre",
            "auxilio",
            "emergencia",
        ],
    )
    def test_palabras_criticas_retornan_critico_inmediatamente(self, palabra_critica):
        texto = f"Alguien mencionó {palabra_critica} en el colegio."
        resultado = predecir_nivel_riesgo(
            descripcion=texto,
            frecuencia="PRIMERA_VEZ",
            ubicacion="SALON",
            involucrados_tipo="INDIVIDUAL",
        )
        assert resultado == "CRITICO"

    def test_palabras_criticas_son_insensibles_a_mayusculas(self):
        resultado = predecir_nivel_riesgo(
            descripcion="ME SACARON UNA NAVAJA Y DIJERON TE VOY A MATAR",
            frecuencia="PRIMERA_VEZ",
            ubicacion="BANOS",
            involucrados_tipo="GRUPO",
        )
        assert resultado == "CRITICO"


class TestMLServiceRandomForest:
    """Pruebas de inferencia del clasificador Random Forest según gravedad."""

    def test_clasificacion_riesgo_bajo(self):
        resultado = predecir_nivel_riesgo(
            descripcion="Un compañero me escondió los colores durante el recreo y se burló de mí.",
            frecuencia="PRIMERA_VEZ",
            ubicacion="DESCANSO",
            involucrados_tipo="INDIVIDUAL",
        )
        assert resultado == "BAJO"

    def test_clasificacion_riesgo_medio(self):
        resultado = predecir_nivel_riesgo(
            descripcion="Llevan varias semanas inventando chismes sobre mí en el salón y tirándome papeles.",
            frecuencia="SEMANAS",
            ubicacion="SALON",
            involucrados_tipo="GRUPO",
        )
        assert resultado == "MEDIO"

    def test_clasificacion_riesgo_alto(self):
        resultado = predecir_nivel_riesgo(
            descripcion="Me agarraron entre varios a la salida del colegio y me pegaron patadas. Tengo moretones.",
            frecuencia="SEMANAS",
            ubicacion="SALIDA",
            involucrados_tipo="GRUPO",
        )
        assert resultado == "ALTO"


class TestMLServiceRobustezYEdgeCases:
    """Pruebas de robustez y resiliencia ante entradas nulas, vacías o atípicas."""

    def test_descripcion_vacia_retorna_medio_por_defecto(self):
        assert predecir_nivel_riesgo("", "PRIMERA_VEZ", "SALON", "INDIVIDUAL") == "MEDIO"

    def test_descripcion_solo_espacios_retorna_medio(self):
        assert predecir_nivel_riesgo("   ", "PRIMERA_VEZ", "SALON", "INDIVIDUAL") == "MEDIO"

    def test_descripcion_none_retorna_medio(self):
        assert predecir_nivel_riesgo(None, "PRIMERA_VEZ", "SALON", "INDIVIDUAL") == "MEDIO"

    def test_variables_categoricas_vacias_usan_valores_por_defecto(self):
        # El modelo debe completar los valores ausentes sin arrojar excepciones
        resultado = predecir_nivel_riesgo(
            descripcion="Un compañero me dijo apodos feos hoy.",
            frecuencia=None,
            ubicacion=None,
            involucrados_tipo=None,
        )
        assert resultado in ["BAJO", "MEDIO", "ALTO", "CRITICO"]
