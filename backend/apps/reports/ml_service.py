"""
apps/reports/ml_service.py â€” Servicio puente entre Django y el Modelo de Machine Learning.
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
    Recibe las variables categÃ³ricas y de texto, carga el modelo Scikit-Learn
    y devuelve la clasificaciÃ³n de riesgo.
    """
    global _modelo

    # Validación de entrada para casos vacíos o nulos
    if not descripcion or not isinstance(descripcion, str) or not descripcion.strip():
        return "MEDIO"

    # 1. Regla determinista (Fail-Safe) para casos gravísimos evidentes
    palabras_criticas = [
        "navaja", "cuchillo", "matar", "suicid", "arma", "viol", "abuso", "sangre",
        "amenaza de muerte", "te voy a matar", "lo voy a matar", "la voy a matar", "me va a matar",
        "pistola", "revólver", "revolver", "rifle", "disparo", "disparó", "apuñal", "apuñaló", "estrangular", "asfixiar",
        "herida grave", "herido grave", "inconsciente", "fractura", "hospital", "urgencias", "sangrado",
        "emergencia", "auxilio", "ayuda urgente", "peligro"
    ]
    desc_lower = descripcion.lower()
    if any(p in desc_lower for p in palabras_criticas):
        return "CRITICO"

    # 2. Cargar modelo si no está en memoria
    if _modelo is None and MODEL_PATH.exists():
        try:
            _modelo = joblib.load(MODEL_PATH)
        except Exception:
            _modelo = None

    # 3. Predicción con Random Forest
    if _modelo:
        try:
            df_input = pd.DataFrame(
                [
                    {
                        "descripcion": descripcion.strip(),
                        "frecuencia": frecuencia or "PRIMERA_VEZ",
                        "ubicacion": ubicacion or "SALON",
                        "involucrados_tipo": involucrados_tipo or "INDIVIDUAL",
                    }
                ]
            )
            prediccion = _modelo.predict(df_input)[0]
            return prediccion
        except Exception:
            return "MEDIO"

    # Retorno por defecto si el modelo no está compilado o falla la ruta
    return "MEDIO"
