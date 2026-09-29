import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split, cross_val_score
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

# Lista de stopwords en español para evitar que el modelo aprenda conectores vacíos
STOPWORDS_ES = [
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
    "con", "no", "una", "su", "al", "lo", "como", "mas", "pero", "sus", "le", "ya", "o", "fue",
    "este", "ha", "si", "porque", "esta", "son", "entre", "cuando", "muy", "sin", "sobre", "ser",
    "tiene", "tambien", "me", "mi", "te", "es", "nos", "les"
]

# 1. Definir cómo procesar el texto y las variables categóricas
preprocessor = ColumnTransformer(
    transformers=[
        (
            "txt",
            TfidfVectorizer(stop_words=STOPWORDS_ES, max_features=150, ngram_range=(1, 2), min_df=2),
            "descripcion",
        ),
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"), # Convierte palabras a columnas binarias
            ["frecuencia", "ubicacion", "involucrados_tipo"],
        ),
    ]
)

# 2. Definir el modelo (Random Forest con Poda, Regularización y Descorrelación)
pipeline = Pipeline(
    [
        ("features", preprocessor),
        (
            "clf",
            RandomForestClassifier(
                n_estimators=100,
                max_depth=6,           # Poda de profundidad máxima
                min_samples_split=6,   # Mínimo de muestras para dividir nodo
                min_samples_leaf=3,    # Mínimo de muestras por hoja
                max_samples=0.75,      # Submuestreo por árbol (bagging 75%)
                max_features="sqrt",   # Descorrelación de árboles
                random_state=42,
                class_weight="balanced",
            ),
        ),
    ]
)

print("Entrenando el modelo...")
pipeline.fit(X_train, y_train)

# 3. Evaluar el modelo en Test Set (20%)
print("\n=== Resultados de Evaluación (Test Set - 20%) ===")
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred))

# 4. Validación Cruzada (5-Fold Cross Validation sobre todo el dataset)
print("\n=== Validación Cruzada (5-Fold Cross Validation - Macro F1) ===")
cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="f1_macro")
for i, score in enumerate(cv_scores, 1):
    print(f"  Fold {i}: F1-Macro = {score:.4f}")
print(f"Promedio F1-Macro: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# 5. Guardar el modelo entrenado
model_path = "clasificador_riesgo.joblib"
joblib.dump(pipeline, model_path)
print(f"\n¡Modelo guardado exitosamente en {model_path}!")
