# Documentación del Modelo de Clasificación de Riesgo (IA) — SafeVoice

Este directorio (`/model`) contiene el código fuente, los datos de entrenamiento y el modelo pre-entrenado encargados de clasificar automáticamente el nivel de riesgo de los reportes de acoso escolar en **SafeVoice**. Esta implementación da solución a la historia de usuario **HU-12 (Clasificación de riesgo de reportes)**.

---

## 1. Propósito y Enfoque

El objetivo del modelo es servir como un **triaje inicial automatizado**. Cuando un estudiante envía un reporte anónimo mediante el formulario web, el sistema analiza en milisegundos la gravedad del incidente y lo clasifica en uno de cuatro niveles de riesgo, permitiendo a los orientadores y directivos escolares priorizar su atención:

* 🟢 **`BAJO`**: Incidentes aislados, desacuerdos puntuales, apodos leves sin intención destructiva, exclusión momentánea o bromas pesadas sin daño físico ni psicológico prolongado.
* 🟡 **`MEDIO`**: Acoso verbal sistemático o reiterado durante semanas o meses, exclusión social deliberada ("ley del hielo"), difusión de chismes/stickers en grupos de mensajería (ciberacoso escolar) o daño leve continuo a pertenencias escolares.
* 🔴 **`ALTO`**: Agresiones físicas directas (puñetazos, patadas, moretones, golpizas grupales), extorsión continuada del dinero de las onces o transporte, humillación pública grave (despojo de ropa) o destrucción intencional de objetos de alto valor.
* 🚨 **`CRITICO`**: Presencia o amenazas con armas (blancas o de fuego), amenazas explícitas de muerte, lesiones físicas graves con atención médica o pérdida de conocimiento, ideación/intención suicida derivada del acoso o violencia/abuso sexual forzado.

---

## 2. ¿Cómo Funciona el Modelo? (Arquitectura Técnica)

El sistema utiliza una arquitectura **Híbrida en 2 Capas**: una regla determinista de emergencia (*Fail-Safe*) y un pipeline de Aprendizaje Automático supervisado (*Machine Learning*) para Procesamiento de Lenguaje Natural (NLP).

```
                      [ Reporte del Estudiante ]
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │  Capa 0: Regla Determinista de Emergencia (Fail-Safe)  │
      │  ¿Contiene palabras críticas (navaja, matar, arma...)? │
      └───────────────────────────┬────────────────────────────┘
                   SÍ │                        │ NO
                      ▼                        ▼
               🚨 [ CRITICO ]       ┌────────────────────────────────┐
                                    │ Capa 1: Pipeline ML Scikit-Learn│
                                    │ • TF-IDF (Texto libre)         │
                                    │ • OneHotEncoder (Metadata)     │
                                    │ • Ensamble VotingClassifier    │
                                    └────────────────┬───────────────┘
                                                     │
                                                     ▼
                                     [ Nivel de Riesgo Predicho ]
                                     (BAJO / MEDIO / ALTO / CRITICO)
```

---

### 2.1. Procesamiento de la Pregunta Abierta: TF-IDF (NLP)

Para procesar el texto libre que redacta el estudiante en la descripción, se utiliza **TF-IDF** (`TfidfVectorizer`):

```python
TfidfVectorizer(
    stop_words=STOPWORDS_ES,
    max_features=1000,
    ngram_range=(1, 2),
    sublinear_tf=True
)
```

* **Frecuencia de Término (TF):** Cuenta la presencia de términos clave en el reporte. Con `sublinear_tf=True`, se aplica un escalado logarítmico ($1 + \log(TF)$) para evitar que repetir una misma palabra infle artificialmente la predicción.
* **Frecuencia Inversa de Documento (IDF):** Penaliza palabras genéricas del ámbito escolar (*"colegio"*, *"salón"*, *"estudiante"*) y otorga un peso matemático superior a palabras con alta carga discriminante (*"moretones"*, *"amenazaron"*, *"patadas"*, *"plata"*, *"chismes"*, *"navaja"*).
* **N-gramas combinados (`ngram_range=(1, 2)`):** Analiza unigramas (palabras sueltas) y bigramas (pares de palabras consecutivas) para captar el contexto semántico (ej. *"me pegaron"*, *"la salida"*, *"plata almuerzo"*, *"fotos íntimas"*).
* **Stopwords en español:** Filtra conectores vacíos (*de, la, que, el, un, por, y...*), centrando la atención en el vocabulario descriptivo de los hechos.

#### ¿Por qué TF-IDF y no un LLM externo (ChatGPT / LLaMA)?
| Criterio | TF-IDF + Ensamble Local (SafeVoice) | LLM Externo (API Comercial / GPT-4) |
| :--- | :--- | :--- |
| **Protección de Datos de Menores** | 🔒 **100% Local y Privado.** Ningún dato confidencial sale del servidor escolar (cumple Ley 1581 de Habeas Data). | ⚠️ Riesgo legal y de fuga de datos sensibles de menores hacia servidores de terceros. |
| **Tiempo de Respuesta (Latencia)** | ⚡ **~3.5 milisegundos.** Inferencia instantánea. | ⏳ 2 a 5 segundos por reporte según la conexión. |
| **Costo Operativo** | 💰 **$0.** Corre en la misma CPU del servidor sin hardware especializado. | 💸 Costo recurrente por tokens o requerimiento de GPUs de alto costo. |
| **Auditabilidad y Determinismo** | 🎯 Predecible, reproducible e inmune a alucinaciones. | 🎲 No determinista; riesgo de generar respuestas imprevistas. |

---

### 2.2. Enriquecimiento con Variables de Contexto (Metadata)

El texto no se evalúa de manera aislada; se complementa con las variables estructuradas del formulario procesadas mediante `OneHotEncoder`:
* **`frecuencia`:** Contexto de cronicidad (`PRIMERA_VEZ`, `SEMANAS`, `MESES`).
* **`ubicacion`:** Nivel de supervisión del espacio (`SALON`, `BANOS`, `DESCANSO`, `PASILLOS`, `SALIDA`, `INTERNET`).
* **`involucrados_tipo`:** Desbalance de poder (`INDIVIDUAL`, `GRUPO`, `DESCONOCIDO`).

---

### 2.3. Algoritmo Clasificador: Ensamble Híbrido (`VotingClassifier`)

En lugar de depender de un único clasificador propenso a sobreajuste, el pipeline implementa un **Ensamble de Votación Suave (*Soft Voting*)** que combina las fortalezas de tres modelos complementarios:

1. 🌲 **`RandomForestClassifier` (100 árboles):**
   * Configurado con poda de profundidad (`max_depth=16`), división mínima (`min_samples_split=4`) y hojas mínimas (`min_samples_leaf=2`).
   * Maneja de forma excelente las interacciones no lineales entre las variables contextuales (ubicación y frecuencia).
2. 📈 **`LogisticRegression` (Multiclase regularizada):**
   * Configurada con regularización $L_2$ (`C=2.5`, solver `liblinear`).
   * Pondera simultáneamente todas las dimensiones del vocabulario TF-IDF, asegurando una lectura equilibrada del texto.
3. ⚡ **`SGDClassifier` (Gradiente Estocástico con pérdida `modified_huber`):**
   * Proporciona estimaciones de probabilidad calibradas y robustas frente a valores atípicos.

**Mecanismo de Votación Suave:** Cada modelo calcula el vector de probabilidades $[P(\text{BAJO}), P(\text{MEDIO}), P(\text{ALTO}), P(\text{CRITICO})]$. El ensamble promedia dichas probabilidades y asigna el reporte a la clase con mayor certeza estadística.

---

## 3. Métricas de Evaluación Oficiales (HU-12)

El modelo fue evaluado sobre un **conjunto de prueba independiente y estratificado (20% test split, 120 casos balanceados)** que nunca fue visto durante el entrenamiento:

### 3.1. Reporte de Clasificación (Test Set)

| Nivel de Riesgo | Precisión (*Precision*) | Sensibilidad (*Recall*) | Puntuación F1 (*F1-Score*) | Casos de Prueba (*Support*) |
| :--- | :---: | :---: | :---: | :---: |
| 🟢 **BAJO** | 0.929 | 0.867 | **0.897** | 30 |
| 🟡 **MEDIO** | 0.906 | 0.967 | **0.935** | 30 |
| 🔴 **ALTO** | 0.875 | 0.933 | **0.903** | 30 |
| 🚨 **CRITICO** | 0.893 | 0.833 | **0.862** | 30 |
| **Exactitud Global (*Accuracy*)** | — | — | **0.900 (90.0%)** | **120** |
| **Promedio Macro F1** | 0.901 | 0.900 | **0.899 (89.9%)** | **120** |
| **Promedio Ponderado F1** | 0.901 | 0.900 | **0.899 (89.9%)** | **120** |

### 3.2. Matriz de Confusión

```
              Pred_BAJO  Pred_MEDIO  Pred_ALTO  Pred_CRITICO
Real_BAJO            26           1          2             1
Real_MEDIO            0          29          0             1
Real_ALTO             1           0         28             1
Real_CRITICO          1           2          2            25
```
* **Aciertos totales:** 108 de 120 casos clasificados correctamente (90.0%).
* **Ausencia de sobreajuste artificial:** No existen métricas perfectas (1.000). Los pequeños márgenes de error reflejan fronteras semánticas naturales (ej. agresiones verbales intensas que rozan la violencia física).

### 3.3. Validación Cruzada (*5-Fold Cross Validation*)
Para verificar que el rendimiento es consistente sobre todo el universo de datos:
* Fold 1: F1-Macro = **0.9078**
* Fold 2: F1-Macro = **0.9086**
* Fold 3: F1-Macro = **0.8917**
* Fold 4: F1-Macro = **0.8591**
* Fold 5: F1-Macro = **0.8470**
* **Promedio General F1-Macro:** **0.8829 (88.3%)** $(\pm 0.05)$.

---

## 4. El Dataset Enriquecido (`dataset_bullying.csv`)

Dado que un colegio real no puede compartir registros confidenciales de menores por protección legal, se construyó un dataset especializado de **600 reportes únicos y balanceados**:

* **Balance perfecto:** 150 casos para cada uno de los 4 niveles de riesgo.
* **Sin plantillas repetitivas ni fuga de datos (*Data Leakage*):** Cada fila fue redactada de forma independiente, eliminando patrones mecánicos que inflaban artificialmente los resultados a 100%.
* **Contexto escolar colombiano auténtico:** Incorpora lenguaje cotidiano y dinámicas reales de convivencia en colegios colombianos (*"me la tienen montada"*, *"boletear en grupos de WhatsApp"*, *"recocha pesada"*, *"plata de las onces"*, *"empujones en la fila del restaurante"*, *"amenazas a la salida"*).

---

## 5. Capa de Seguridad de Emergencia: Regla *Fail-Safe*

El Machine Learning probabilístico tiene un margen de incertidumbre inherente. En un contexto escolar, clasificar por error un caso con arma blanca como `BAJO` representa un riesgo inaceptable para la integridad física del menor.

Por ello, en el servicio del backend (`backend/apps/reports/ml_service.py`), se ejecuta una **capa determinista previa a la inferencia de IA**:

* Si la descripción contiene términos de peligro extremo o armas (`navaja`, `cuchillo`, `pistola`, `arma`, `matar`, `te voy a matar`, `suicidio`, `asfixiar`, `estrangulamiento`, `sangre`, `abuso`, `violación`, etc.), el servicio **fuerza la clasificación a `CRITICO` inmediatamente**, garantizando alerta máxima sin depender del umbral probabilístico.
* Esta regla está validada mediante 19 pruebas unitarias automatizadas en `test_ml_service.py`.

---

## 6. Instrucciones de Uso y Re-entrenamiento

### Re-entrenar el modelo localmente:
Desde la terminal del proyecto en Visual Studio Code:
```bash
python model/train.py
```
*(O simplemente abriendo `model/train.py` y haciendo clic en el botón de **Play / Ejecutar** en VS Code).*

El script:
1. Carga `dataset_bullying.csv`.
2. Entrena el pipeline de ensamble.
3. Imprime en consola la matriz de métricas, la matriz de confusión y los 5 folds de validación cruzada.
4. Exporta el archivo binario compilado `clasificador_riesgo.joblib`.

### Ejecutar las pruebas unitarias del modelo y del backend:
```bash
cd backend
.\.venv\Scripts\python.exe -m pytest apps/reports/tests/test_ml_service.py -v
```
