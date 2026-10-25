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


def _normalizar_ubicacion(ubicacion: str) -> str:
    """Normaliza la etiqueta de ubicación del formulario al código técnico del modelo ML."""
    if not ubicacion or not isinstance(ubicacion, str):
        return "SALON"
    u = ubicacion.strip().lower()
    if "salón" in u or "salon" in u:
        return "SALON"
    if "pasillo" in u or "escalera" in u:
        return "PASILLOS"
    if "baño" in u or "bano" in u:
        return "BANOS"
    if "descanso" in u or "deportiva" in u or "cancha" in u or "patio" in u:
        return "DESCANSO"
    if "salida" in u:
        return "SALIDA"
    if "internet" in u or "redes" in u or "virtual" in u:
        return "INTERNET"
    if "otro" in u:
        return "OTRO"
    return ubicacion.strip().upper()


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

    # 3. Predicción con Random Forest / Ensamble
    if _modelo:
        try:
            df_input = pd.DataFrame(
                [
                    {
                        "descripcion": descripcion.strip(),
                        "frecuencia": frecuencia or "PRIMERA_VEZ",
                        "ubicacion": _normalizar_ubicacion(ubicacion),
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
