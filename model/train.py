import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(BASE_DIR, "dataset_bullying.csv")
model_path = os.path.join(BASE_DIR, "clasificador_riesgo.joblib")

print("Cargando dataset...")
df = pd.read_csv(dataset_path)

# Separar variables de entrada (X) y objetivo (y)
X = df[["descripcion", "frecuencia", "ubicacion", "involucrados_tipo"]]
y = df["nivel_riesgo"]

# División estratificada en entrenamiento (80%) y prueba (20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Lista de stopwords en español para evitar memorización de conectores vacíos
STOPWORDS_ES = [
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
    "con", "no", "una", "su", "al", "lo", "como", "mas", "pero", "sus", "le", "ya", "o", "fue",
    "este", "ha", "si", "porque", "esta", "son", "entre", "cuando", "muy", "sin", "sobre", "ser",
    "tiene", "tambien", "me", "mi", "te", "es", "nos", "les"
]

# 1. Definir procesamiento de texto y variables categóricas
preprocessor = ColumnTransformer(
    transformers=[
        (
            "txt",
            TfidfVectorizer(
                stop_words=STOPWORDS_ES,
                max_features=1000,
                ngram_range=(1, 2),
                sublinear_tf=True,
            ),
            "descripcion",
        ),
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            ["frecuencia", "ubicacion", "involucrados_tipo"],
        ),
    ]
)

# 2. Definir los estimadores del Ensamble Híbrido (Voting Classifier)
# Combina Random Forest con modelos lineales probabilísticos para máxima generalización en NLP
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=16,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    class_weight="balanced",
)
lr = LogisticRegression(
    C=2.5,
    solver="liblinear",
    max_iter=1000,
    random_state=42,
    class_weight="balanced",
)
sgd = SGDClassifier(
    loss="modified_huber",
    max_iter=1000,
    random_state=42,
    class_weight="balanced",
)

ensemble = VotingClassifier(
    estimators=[("rf", rf), ("lr", lr), ("sgd", sgd)],
    voting="soft",
)

pipeline = Pipeline(
    [
        ("features", preprocessor),
        ("clf", ensemble),
    ]
)

print("Entrenando el modelo...")
pipeline.fit(X_train, y_train)

# 3. Evaluar el modelo en Test Set (20%)
print("\n=== Resultados de Evaluación (Test Set - 20%) ===")
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred, digits=3))

print("=== Matriz de Confusión ===")
labels = ["BAJO", "MEDIO", "ALTO", "CRITICO"]
cm = confusion_matrix(y_test, y_pred, labels=labels)
cm_df = pd.DataFrame(cm, index=[f"Real_{l}" for l in labels], columns=[f"Pred_{l}" for l in labels])
print(cm_df)

# 4. Validación Cruzada (5-Fold Cross Validation sobre todo el dataset)
print("\n=== Validación Cruzada (5-Fold Cross Validation - Macro F1) ===")
cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="f1_macro")
for i, score in enumerate(cv_scores, 1):
    print(f"  Fold {i}: F1-Macro = {score:.4f}")
print(f"Promedio F1-Macro: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# 5. Guardar el modelo entrenado
joblib.dump(pipeline, model_path)
print(f"\n¡Modelo guardado exitosamente en {model_path}!")
