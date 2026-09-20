# Documentación del Modelo de Clasificación de Riesgo (IA)

Este directorio (`/model`) contiene el código, los datos y el modelo pre-entrenado encargados de clasificar automáticamente el nivel de riesgo de los reportes de acoso escolar en **SafeVoice**. Esta implementación resuelve la **HU-12 (Clasificación de riesgo)**.

---

## 1. Propósito y Enfoque

El objetivo del modelo es servir como un **triaje inicial automatizado**. Cuando un estudiante envía un reporte anónimo, el sistema evalúa la gravedad del incidente y lo clasifica en uno de cuatro niveles de riesgo, permitiendo a los orientadores priorizar su atención.

*   **Niveles de Riesgo (Target):**
    *   🟢 **`BAJO`**: Incidentes aislados, sin violencia física.
    *   🟡 **`MEDIO`**: Acoso recurrente, exclusión social o daños materiales leves.
    *   🔴 **`ALTO`**: Agresiones físicas directas, ciberacoso sistemático.
    *   🚨 **`CRITICO`**: Amenazas a la vida, armas, violencia física severa, abuso.

---

## 2. Arquitectura del Modelo

Dado el contexto de privacidad de datos de menores y las limitantes de un proyecto académico (donde no se cuenta con una base de datos histórica de miles de casos reales), se optó por un enfoque **Clásico + Híbrido** (Regresión Logística con Procesamiento de Lenguaje Natural + Reglas deterministas).

### 2.1. Las Variables (Features)
El modelo no solo lee texto, sino que se enriquece con el contexto estructurado del formulario:
1.  **`descripcion` (Texto libre):** Procesado mediante **TF-IDF** (`TfidfVectorizer`) para extraer n-gramas (palabras clave y frases como "me pegaron", "apodo", etc.).
2.  **`frecuencia` (Categórica):** Transformada con `OneHotEncoder`. Aporta el contexto de cronicidad (ej. no es lo mismo "Primera Vez" que "Meses").
3.  **`ubicacion` (Categórica):** Lugares sin supervisión (ej. Baños, Salida) aumentan la probabilidad de severidad.
4.  **`involucrados_tipo` (Categórica):** Agresiones en "Grupo" representan mayor desbalance de poder que las "Individuales".

### 2.2. Algoritmo
Se utiliza un **Pipeline de Scikit-Learn** que culmina en una **Regresión Logística Multinomial** (`LogisticRegression(class_weight="balanced")`). Es extremadamente rápido en inferencia (< 10 ms), liviano y funciona muy bien con representaciones de texto dispersas (TF-IDF).

---

## 3. Manejo del "Cold Start" (El Dataset Sintético)

Como el colegio no provee un dataset histórico inicial, se generó el archivo `dataset_bullying.csv` con **500 reportes sintéticos**.
*   **¿Cómo se construyó?** Se cruzaron plantillas base de situaciones típicas de convivencia escolar en Colombia (apodos, daños a útiles, riñas, ciberacoso) con modificadores aleatorios de ubicación y frecuencia, manteniendo una distribución lógica de los niveles de riesgo.

---

## 4. El Enfoque Híbrido: Regla "Fail-Safe"

El Machine Learning probabilístico tiene un margen de error. En entornos escolares, un falso negativo (clasificar como `BAJO` un caso donde hay un arma) es inaceptable.

Por ello, en la integración con Django (`backend/apps/reports/ml_service.py`), se implementó un **filtro de emergencia determinista previo a la inferencia de IA**:
*   Si el texto contiene palabras de alerta inminente (`"navaja"`, `"cuchillo"`, `"matar"`, `"suicid"`, `"arma"`, `"viol"`, `"abuso"`, `"sangre"`), el servicio ignora al modelo de Machine Learning y **retorna `CRITICO` inmediatamente**.
*   Solo si el texto pasa limpio esta validación, se transfiere al modelo de Pandas/Scikit-Learn para su clasificación probabilística.

---

## 5. Instrucciones de Uso y Re-entrenamiento

Si en el futuro deseas re-entrenar el modelo (por ejemplo, porque el colegio aportó datos reales des-identificados):

1.  Abre una terminal en esta carpeta (`/model`).
2.  Asegúrate de tener instalado el entorno: `pip install pandas scikit-learn joblib`.
3.  Modifica el archivo `dataset_bullying.csv` añadiendo tus nuevos casos.
4.  Ejecuta el script:
    ```bash
    python train.py
    ```
5.  El script generará un nuevo archivo `clasificador_riesgo.joblib`, que será automáticamente consumido por el Backend de Django la próxima vez que se envíe un reporte.
