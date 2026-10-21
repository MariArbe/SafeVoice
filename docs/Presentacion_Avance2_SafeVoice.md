# SafeVoice: Presentación y Guión de Sustentación — Avance 2

> **Proyecto Aplicado en TIC (2026-2) — UPB**  
> **Docente Asesora:** Prof. Yuri Marcela Escobar Cardona  
> **Equipo:** Mariana Arbeláez (Frontend/UX), Daniel López (Frontend/IA), Esteban Álvarez (Backend/Seguridad)  
> **Fecha:** 18 de octubre de 2026  

---

## Estructura General de la Exposición

* **Tiempo total estimado:** 15 a 20 minutos (10 min presentación teórica y técnica + 5 min demo interactiva + 5 min preguntas y retroalimentación).
* **Distribución de roles en la presentación:**
  * **Mariana Arbeláez:** Presentación del proyecto, problemática, evolución de la experiencia de usuario (UX) y formulario de reporte.
  * **Esteban Álvarez:** Arquitectura técnica, privacidad por diseño (Patrón Proxy), modelo de base de datos, seguridad y auditoría de casos.
  * **Daniel López:** Motor de Inteligencia Artificial para clasificación de riesgo (HU-12), protocolos pedagógicos basados en la Ley 1620 (HU-15) y demo en vivo.

---

## Diapositiva por Diapositiva: Contenido y Guión de Exposición

---

### Diapositiva 1: Portada
* **Título:** SafeVoice: Sistema Inteligente para la Detección, Reporte Anónimo y Gestión del Bullying Escolar
* **Subtítulo:** Sustentación de Avance 2 — Proyecto Aplicado en TIC
* **Ponentes:** Mariana Arbeláez, Daniel López, Esteban Álvarez
* **Institución:** Facultad de Ingeniería, Universidad Pontificia Bolivariana (2026-2)
* **Guión del Orador (Mariana):**  
  > *"Buenos días profesora Yuri y compañeros. Hoy presentamos el Avance 2 de SafeVoice, una plataforma web concebida para resolver una de las mayores barreras en la convivencia escolar: el silencio y el subregistro de los casos de acoso debido al temor a represalias. En este avance demostraremos cómo evolucionamos de un canal de reporte anónimo hacia un sistema inteligente que clasifica riesgos mediante IA y orienta la intervención bajo la Ley 1620 de 2013."*

---

### Diapositiva 2: Problemática y Oportunidad (AS-IS vs. TO-BE)
* **Puntos Clave:**
  * **AS-IS:** Mecanismos tradicionales (buzones físicos o avisos verbales). Miedo al señalamiento social, investigación manual sin métricas y respuestas tardías.
  * **TO-BE:** Canal digital 100% anónimo por diseño, accesible sin registro, con ticket de seguimiento UUID, priorización automatizada por severidad y analítica territorial para prevención activa.
* **Guión del Orador (Mariana):**  
  > *"Tradicionalmente, un estudiante que sufre acoso debe recurrir a un buzón físico o hablar en persona, exponiéndose al señalamiento de sus compañeros. Con SafeVoice, el estudiante ingresa desde cualquier dispositivo móvil o computador sin registrar su nombre ni correo. El sistema desacopla totalmente su identidad y le entrega un código único de seguimiento. El colegio deja de actuar de forma reactiva y cuenta ahora con datos estructurados para intervenir a tiempo."*

---

### Diapositiva 3: Balance Acumulado del Avance 1 (Sprints 1 y 2)
* **Puntos Clave:**
  * Arquitectura desacoplada en 4 capas: React 19 + Tailwind CSS en frontend, Django REST Framework en backend, Microsoft SQL Server 2022 orquestado en Docker.
  * **Privacidad por diseño (HU-05):** Patrón Proxy intermedio en el backend que filtra metadatos de red (IPs, sesiones, user-agent) antes de tocar el ORM.
  * **Vertical funcional culminada:** Envío de reporte anónimo (`HU-01`), confirmación con UUID (`HU-04`), autenticación institucional (`HU-09`, `HU-10`) y directorio de recursos de auxilio (`HU-02`, `HU-03`).
* **Guión del Orador (Esteban):**  
  > *"En el Avance 1 nos aseguramos de que los cimientos fueran sólidos y éticamente responsables. Construimos una arquitectura desacoplada donde el modelo relacional carece intencionalmente de claves foráneas hacia los usuarios del sistema. Diseñamos un Patrón Proxy en Python que actúa como una lista blanca estricta: cualquier metadato de red o IP que viaje en la cabecera HTTP es depurado antes de persistir el reporte en SQL Server, garantizando anonimato estructural."*

---

### Diapositiva 4: Novedad Avance 2 — Inteligencia Artificial para Clasificación de Riesgo (HU-12)
* **Puntos Clave:**
  * Clasificación automática de la severidad del texto del testimonio en 4 niveles: **🟢 Bajo**, **🟡 Medio**, **🟠 Alto**, **🔴 Crítico**.
  * Pipeline de Machine Learning: Preprocesamiento de texto en español + Extracción de características **TF-IDF** (n-gramas 1-2).
  * Ensamble heterogéneo (*VotingClassifier*) con probabilidades suaves (*soft voting*): LinearSVC calibrado, Random Forest y Naive Bayes Multinomial.
  * Visualización cromática y priorización inmediata en la bandeja de entrada de docentes.
* **Guión del Orador (Daniel):**  
  > *"En este Avance 2 integramos el corazón inteligente de SafeVoice: el módulo de IA (HU-12). Los orientadores no pueden revisar 50 reportes en orden cronológico cuando alguno de ellos podría involucrar peligro inminente. Entrenamos un ensamble híbrido que analiza la narrativa del hecho y predice la severidad. Si un estudiante describe agresiones físicas graves o ideación suicida, el algoritmo lo clasifica de inmediato como 'Crítico', activando una alerta visual destacada en la bandeja."*

---

### Diapositiva 5: Novedad Avance 2 — Sugerencias de Intervención basadas en la Ley 1620 (HU-15)
* **Puntos Clave:**
  * Homologación normativa con el Artículo 40 del Decreto 1965 de 2013 (Colombia):
    * **Bajo $\rightarrow$ Situación Tipo I:** Mediación escolar y diálogo restaurativo (plazo `< 72 horas`).
    * **Medio $\rightarrow$ Situación Tipo I Reiterada:** Acuerdos en orientación y talleres grupales (plazo `< 48 horas`).
    * **Alto $\rightarrow$ Situación Tipo II:** Medidas cautelares de protección física y remisión a Comité de Convivencia (plazo `< 24 horas`).
    * **Crítico $\rightarrow$ Situación Tipo III:** Atención de urgencias (Salud/123) y remisión inmediata a ICBF, Comisarías o Fiscalía (plazo `< 2 horas`).
* **Guión del Orador (Daniel):**  
  > *"Uno de los aportes más significativos del Avance 2 fue no limitarnos a calificar el riesgo, sino guiar la acción pedagógica y legal (HU-15). Siguiendo la Ley 1620 colombiana, SafeVoice genera una guía detallada con plazos perentorios y pasos específicos: desde una mediación en el aula para Situaciones Tipo I, hasta la activación indelegable de la Ruta de Atención Integral hacia el ICBF y Fiscalía ante Situaciones Tipo III."*

---

### Diapositiva 6: Novedad Avance 2 — Gestión, Trazabilidad y Auditoría de Estados (HU-07 / HU-08)
* **Puntos Clave:**
  * Bandeja de reportes institucional con filtros de severidad y estado.
  * Modal de consulta integral con la narrativa del hecho, ubicación y datos de contacto opcionales.
  * Máquina de estados finita: `nuevo` $\rightarrow$ `en_revision` $\rightarrow$ `atendido` $\rightarrow$ `cerrado`.
  * Auditoría inmutable (`historial_cambios`): Registro JSON secuencial con ID del orientador, nombre, timestamp UTC y notas de seguimiento.
* **Guión del Orador (Esteban):**  
  > *"Para la gestión de los casos implementamos la HU-07 y HU-08. El orientador dispone de un modal donde lee los detalles y puede registrar las actuaciones institucionales. Cada cambio de estado genera un registro de auditoría inmutable en la base de datos que responde a tres preguntas: quién intervino, en qué fecha exacta y qué acciones tomó. Esto asegura el debido proceso y la trazabilidad institucional ante auditorías o requerimientos legales."*

---

### Diapositiva 7: Novedad Avance 2 — Tablero Analítico y Plano Arquitectónico Institucional (HU-13 / HU-14)
* **Puntos Clave:**
  * Dashboard de indicadores agregados: volumen de incidentes, tipologías más frecuentes y distribución por grados.
  * **Plano arquitectónico institucional vectorial (SVG):** Mapeo de zonas físicas del plantel (canchas deportivas, cafetería, baños, pasillos y aulas).
  * Inspección de focos de conflicto físicos y recomendaciones operativas de vigilancia docente durante recesos.
* **Guión del Orador (Mariana):**  
  > *"En las HU-13 y HU-14 dotamos a la institución de herramientas visuales para la prevención. En lugar de mapas GPS externos que no distinguen pisos o salones contiguos, construimos un plano arquitectónico vectorial en SVG del campus. Las directivas pueden identificar con claridad cromática qué zonas físicas concentran mayor conflictividad durante los descansos y reasignar docentes de vigilancia de forma estratégica."*

---

### Diapositiva 8: Calidad y Seguridad — Nuevos Artefactos Entregados
* **Puntos Clave:**
  * **Plan de Pruebas (PT-001 a PT-043):** 43 casos formales derivados de los criterios de aceptación, con balance de pruebas superadas y casos en iteración.
  * **Checklist de Seguridad:** Mitigación de enumeración de usuarios (CWE-204), Rate Limiting anti-fuerza bruta, contraseñas hasheadas con PBKDF2 y cifrado Fernet en testimonios.
  * **Matriz de Roles y Perfiles:** 3 roles de plataforma + 3 roles de equipo + partes interesadas externas (familias, evaluadores UPB, ICBF).
  * **Verificación de UX:** Pruebas de usabilidad con 5 usuarios; inclusión de vista intermedia `MenuDocente` y alertas cromáticas accesibles.
* **Guión del Orador (Mariana y Esteban):**  
  > *"Este avance no solo incluye código, sino una rigurosa batería de artefactos de aseguramiento de calidad. Evaluamos 43 casos de prueba empíricos, completamos un checklist de 17 controles de seguridad y ejecutamos pruebas de usabilidad con usuarios representativos. Esto nos permitió, por ejemplo, corregir la fuga de información en el login y agregar una pantalla intermedia de menú docente para agilizar el flujo de trabajo diario."*

---

### Diapositiva 9: Demostración Práctica en Vivo (Demo Script)
* **Flujo de la Demo (Tiempo: 4-5 minutos):**
  1. **Paso 1 — Reporte Anónimo (Mariana):** Abrir `/reporte`, seleccionar agresión física recurrente en "Canchas", escribir narrativa de ejemplo y enviar. Mostrar pantalla de confirmación con ticket UUID `SV-XXXXX`.
  2. **Paso 2 — Login y Menú (Daniel):** Ingresar a `/docente/login` con credenciales de orientador. Mostrar redirección a `/docente/menu`.
  3. **Paso 3 — Bandeja y Clasificación IA (Daniel):** Entrar a `/docente/reportes`. Mostrar el reporte recién enviado con su nivel asignado por la IA (`ALTO` o `CRÍTICO`) y su chip cromático.
  4. **Paso 4 — Detalle y Ley 1620 (Daniel):** Abrir el modal de detalle del reporte. Mostrar la sección de *Sugerencias de Intervención (Ley 1620)* con las acciones recomendadas, plazo de 24 horas y rutas de remisión.
  5. **Paso 5 — Transición de Estado y Auditoría (Esteban):** Cambiar estado a `en_revision`, agregar nota: *"Caso citado a comité escolar"*, guardar y abrir la línea de tiempo del historial para verificar la inmutabilidad del cambio.
  6. **Paso 6 — Dashboard y Plano (Mariana):** Navegar a `/docente/dashboard` y mostrar las métricas agregadas y el plano arquitectónico con los bloques del colegio.

---

### Diapositiva 10: Conclusiones y Próximos Pasos (Hacia la Entrega Final)
* **Puntos Clave:**
  * Logro de un sistema integral que une privacidad por diseño, machine learning y fundamentación legal colombiana.
  * **Próximos pasos hacia la Entrega Final:**
    * Fortalecimiento de `ProtectedRoute` en React para blindar rutas privadas.
    * Conexión dinámica del selector temporal con el plano arquitectónico.
    * Enriquecimiento de datos semilla de contactos institucionales de emergencia.
    * Ejecución de prueba piloto controlada en escenario educativo simulado.
* **Guión de Cierre (Daniel):**  
  > *"SafeVoice ha alcanzado una madurez funcional muy alta en este Avance 2, integrando tecnología de punta con pertinencia social y jurídica. Agradecemos su atención y quedamos a su entera disposición para responder sus preguntas y recibir su retroalimentación."*

---

## Preguntas Frecuentes Anticipadas de la Docente y Respuestas Sugeridas

1. **¿Cómo garantizan realmente que un administrador de bases de datos no identifique quién envió un reporte?**  
   * *Respuesta (Esteban):* "Por diseño estructural (*Privacy by Design*). La tabla `reportes` no almacena IP, user-agent ni llave foránea hacia ninguna tabla de usuarios. El Patrón Proxy intercepta la petición en Django y solo mapea campos estrictamente pertinentes al hecho. A nivel relacional, es imposible correlacionar un reporte con una persona a menos que el estudiante decida voluntariamente incluir sus datos de contacto."

2. **¿Con qué datos se entrenó el clasificador de riesgo y cómo manejan el riesgo de un falso negativo en casos graves?**  
   * *Respuesta (Daniel):* "Se utilizó un corpus curado de situaciones de acoso escolar clasificadas según criterios de la Ley 1620 y literatura de la UNESCO, balanceando clases y calibrando probabilidades mediante un ensamble *VotingClassifier*. Para mitigar falsos negativos, la IA actúa estrictamente como herramienta de apoyo; el orientador siempre tiene acceso al listado completo y puede reevaluar la criticidad del caso con criterio humano profesional."

3. **¿Por qué decidieron usar un plano vectorial SVG en lugar de integrar mapas de Google Maps o OpenStreetMap?**  
   * *Respuesta (Mariana):* "Las soluciones geoespaciales como Google Maps o Leaflet están diseñadas para distancias urbanas o satelitales en metros y kilómetros, pero dentro de una institución escolar los incidentes ocurren en microespacios (el baño del segundo piso, la esquina de las canchas, la fila de cafetería). Un plano arquitectónico vectorial interno ofrece precisión espacial relevante para la asignación de guardias y convivencia del plantel."
