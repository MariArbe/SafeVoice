import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import os

print("Cargando dataset...")
df = pd.read_csv("dataset_bullying.csv")

# Separar variables de entrada (X) y objetivo (y)
X = df[["descripcion", "frecuencia", "ubicacion", "involucrados_tipo"]]
y = df["nivel_riesgo"]

# División en datos de entrenamiento (80%) y prueba (20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 1. Definir cómo procesar el texto y las variables categóricas
preprocessor = ColumnTransformer(
    transformers=[
        (
            "txt",
            TfidfVectorizer(max_features=1000, ngram_range=(1, 2)), # Extrae palabras clave
            "descripcion",
        ),
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"), # Convierte palabras a columnas binarias
            ["frecuencia", "ubicacion", "involucrados_tipo"],
        ),
    ]
)

# 2. Definir el modelo (Regresión Logística multinomial balanceada)
pipeline = Pipeline(
    [
        ("features", preprocessor),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ]
)

print("Entrenando el modelo...")
pipeline.fit(X_train, y_train)

# 3. Evaluar el modelo
print("\n=== Resultados de Evaluación ===")
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred))

# 4. Guardar el modelo entrenado
model_path = "clasificador_riesgo.joblib"
joblib.dump(pipeline, model_path)
print(f"\n¡Modelo guardado exitosamente en {model_path}!")
