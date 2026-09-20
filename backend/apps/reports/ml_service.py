"""
apps/reports/ml_service.py — Servicio puente entre Django y el Modelo de Machine Learning.
"""

import os
from pathlib import Path
import pandas as pd
import joblib

MODEL_PATH = (
    Path(__file__).resolve().parent.parent.parent.parent
    / "model"
    / "clasificador_riesgo.joblib"
)
_modelo = None


def predecir_nivel_riesgo(
    descripcion: str,
    frecuencia: str,
    ubicacion: str,
    involucrados_tipo: str,
) -> str:
    """
    Recibe las variables categóricas y de texto, carga el modelo Scikit-Learn
    y devuelve la clasificación de riesgo.
    """
    global _modelo

    # 1. Regla determinista (Fail-Safe) para casos gravísimos evidentes
    palabras_criticas = ["navaja", "cuchillo", "matar", "suicid", "arma", "viol", "abuso", "sangre"]
    desc_lower = descripcion.lower()
    if any(p in desc_lower for p in palabras_criticas):
        return "CRITICO"

    # 2. Cargar modelo si no está en memoria
    if _modelo is None and MODEL_PATH.exists():
        _modelo = joblib.load(MODEL_PATH)

    # 3. Predicción
    if _modelo:
        # Convertimos las variables en un DataFrame de Pandas (1 sola fila)
        df_input = pd.DataFrame(
            [
                {
                    "descripcion": descripcion,
                    "frecuencia": frecuencia or "PRIMERA_VEZ",
                    "ubicacion": ubicacion or "SALON",
                    "involucrados_tipo": involucrados_tipo or "INDIVIDUAL",
                }
            ]
        )
        prediccion = _modelo.predict(df_input)[0]
        return prediccion

    # Retorno por defecto si el modelo no está compilado o falla la ruta
    return "MEDIO"
