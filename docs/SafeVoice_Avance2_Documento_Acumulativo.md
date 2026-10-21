# SafeVoice: Plataforma Web para la Prevención, el Reporte Anónimo y la Gestión de Casos de Bullying y Ciberbullying en Instituciones Educativas

**Avance 2 — Documento Acumulativo**  
Facultad de Ingeniería, Universidad Pontificia Bolivariana  
Proyecto Aplicado en TIC (2026-2)  
**Integrantes:** Mariana Arbeláez, Daniel López y Esteban Álvarez  
**Profesora:** Yuri Marcela Escobar Cardona  
**Corte del repositorio y de las evidencias:** 18 de octubre de 2026  

---

## 1. Resumen ejecutivo

**SafeVoice** es una plataforma web que permite a estudiantes reportar de forma anónima situaciones de bullying y ciberbullying, y que entrega a orientadores y directivos una herramienta estructurada para atender los casos, aplicar protocolos de ley y orientar la prevención escolar basada en datos. Este documento es de carácter **acumulativo**: presenta la fundamentación del proyecto, sintetiza lo logrado en el Avance 1, expone el desarrollo técnico del Avance 2, documenta los cambios y autocríticas respecto a lo planeado e incorpora cuatro artefactos nuevos de aseguramiento de calidad: **plan de pruebas, checklist de seguridad, matriz de roles y perfiles, y verificación de experiencia de usuario (UX)**, junto con la estructura de la **presentación del día**.

En el **Avance 1** (Sprints 1 y 2) se entregó la primera vertical funcional de extremo a extremo: formulario público de reporte anónimo, API REST en Django que genera un código único de seguimiento (UUID) y un modelo relacional en Microsoft SQL Server diseñado bajo el principio de *privacidad por diseño* (sin clave foránea hacia usuarios y protegido por un patrón Proxy con lista blanca de campos). Desde entonces, durante el **Avance 2** (Sprints 3 y 4), el repositorio (rama `development`, con más de 80 commits y contribuciones de los tres integrantes) incorporó:
1. El **clasificador híbrido de riesgo con inteligencia artificial (HU-12)** en dos capas (regla determinista de emergencia + ensamble de *Machine Learning* con TF-IDF).
2. El **flujo de gestión de casos con cambio de estado e historial inmutable de auditoría (HU-07 y HU-08)**.
3. Los módulos de **estadísticas agregadas y análisis de concentración por zona de la sede (HU-13 y HU-14)** mediante un dashboard interactivo y un plano arquitectónico vectorial.
4. El motor de **sugerencias de intervención pedagógica y legal basadas en la Ley 1620 de 2013 y el Decreto 1965 de 2013 (HU-15)**.

La verificación empírica del avance arrojó resultados mixtos que se reportan con total transparencia técnica y sin maquillaje:
* De **43 pruebas manuales** definidas a partir de los criterios de aceptación (`PT-001` a `PT-043`), **24 resultaron satisfactorias (56 %)**, **11 fallaron (26 %)** y **8 están pendientes (19 %)**.
* En la suite de **100 pruebas automáticas del backend (`pytest`)**, **las 100 aprobaron satisfactoriamente (100 % passed en 3.52 s)** tras alinear la versión del clasificador serializado `.joblib` con el entorno de ejecución.
* El **checklist de seguridad** registra **12 de 18 criterios marcados como cumplidos** en la evaluación inicial del equipo; sin embargo, la auditoría directa contra el código fuente permitió precisar qué controles ya están implementados en código (como el manejador global de errores `500` y el mensaje genérico de login) y levantar **7 hallazgos técnicos abiertos (`H-01` a `H-07`)** —incluyendo la unificación de permisos entre roles, el aislamiento entre instituciones en el listado, los campos devueltos en la consulta pública y la protección de rutas en el frontend— con su respectivo plan de corrección en las secciones 7 y 11.
* La **verificación preliminar de UX** con cinco participantes produjo **15 propuestas de mejora** (5 de prioridad alta, 8 media y 2 baja) que trazan la hoja de ruta hacia la entrega final.

---

## 2. Presentación del proyecto

### 2.1. Problemática y oportunidad
En las instituciones de educación básica y media, los casos de acoso escolar y ciberacoso suelen comunicarse de forma verbal, informal o mediante mecanismos tradicionales (buzones físicos de papel o citaciones presenciales) que no garantizan el anonimato. Según la UNESCO (2019), uno de cada tres estudiantes en el mundo ha sufrido acoso escolar, pero una alta proporción nunca denuncia por temor a represalias sociales, vergüenza o desconfianza en el canal.

Esta situación produce cuatro limitaciones estructurales en los colegios:
* **Temor a represalias y subregistro sistemático** de incidentes.
* **Investigación manual y poca trazabilidad** sobre quién atiende cada caso y en qué estado se encuentra.
* **Dificultad para priorizar casos** según su nivel real de gravedad o urgencia vital.
* **Ausencia de datos consolidados** para detectar patrones temporales, grados afectados y zonas físicas críticas dentro del plantel.

La oportunidad consiste en ofrecer un canal digital confidencial que permita reportar sin revelar la identidad del estudiante y que entregue a orientadores y directivos información organizada, priorizada por inteligencia artificial y alineada con la normativa colombiana de convivencia escolar.

### 2.2. Análisis comparativo: Proceso AS-IS vs. Proceso TO-BE

| Dimensión | Proceso Tradicional (AS-IS) | Proceso con SafeVoice (TO-BE) |
| :--- | :--- | :--- |
| **1. Canal de denuncia** | Verbal ante un docente, buzón físico o correo electrónico identificable. | Formulario web público y responsivo, disponible 24/7 sin cuenta ni inicio de sesión. |
| **2. Garantía de anonimato** | Promesa verbal; el estudiante se expone físicamente al entregar la queja. | Anonimato técnico por diseño: tabla sin relación con usuarios, patrón Proxy con lista blanca y logs con IP enmascarada. |
| **3. Seguimiento del estudiante** | Incertidumbre total tras reportar; desconoce si su caso fue leído. | Código único de seguimiento (UUID) entregado al instante para consultar el avance. |
| **4. Priorización del caso** | Lectura manual por orden de llegada; riesgo de demorar casos graves. | Clasificación automática de riesgo en 4 niveles (`Bajo`, `Medio`, `Alto`, `Crítico`) con alerta de emergencia. |
| **5. Ruta de intervención** | Depende de la memoria o experiencia individual del orientador de turno. | Recomendaciones automáticas parametrizadas según la Ley 1620 de 2013 (Situaciones Tipo I, II y III). |
| **6. Prevención y analítica** | Caso cerrado en papel sin estadísticas ni cruce de zonas. | Dashboard institucional con métricas agregadas y concentración de incidentes por zona de la sede. |

### 2.3. Propuesta de solución y público objetivo
SafeVoice articula la solución en dos frentes de uso claramente diferenciados y cuatro grupos de usuarios dentro de la comunidad educativa:
1. **Frente Público — Comunidad educativa (Estudiantes víctimas o testigos, y familias):** Pueden consultar definiciones y señales de alerta sobre bullying, acceder a un directorio de líneas nacionales e institucionales de ayuda, registrar un reporte anónimo (con opción voluntaria de dejar contacto en casos graves) y recibir un código UUID para consultar el estado del caso.
2. **Frente Institucional — Personal educativo (Orientadores escolares y Directivos):**
   * **Orientadores escolares:** Reciben los reportes de su institución, visualizan el nivel de riesgo asignado por IA, consultan las sugerencias de intervención de la Ley 1620, registran notas de orientación y actualizan el estado de atención con trazabilidad de auditoría.
   * **Directivos y administradores:** Registran la institución en la plataforma y analizan indicadores agregados, tendencias por fechas y mapas de concentración de casos por zona para orientar acciones preventivas.

### 2.4. Objetivos del proyecto

#### Objetivo general
Desarrollar una plataforma web segura que facilite el reporte anónimo, la clasificación inteligente de riesgo y la gestión institucional de situaciones de bullying y ciberbullying en comunidades educativas.

#### Objetivos específicos
1. Diseñar un formulario accesible y claro para registrar incidentes sin solicitar la identidad del reportante.
2. Implementar un servicio backend desacoplado que valide, anonimice, cifre y almacene los reportes.
3. Generar un código de seguimiento anónimo (UUID) para cada reporte creado.
4. Proporcionar a orientadores y directivos una base segura para consultar, gestionar casos y auditar sus cambios de estado.
5. Preparar y explotar la información mediante un clasificador de riesgo por inteligencia artificial, sugerencias normativas de intervención (Ley 1620), estadísticas agregadas y análisis por zonas críticas.

### 2.5. Arquitectura y tecnologías
La arquitectura del sistema separa estrictamente la interfaz de usuario, la API de negocio y la capa de persistencia. En el backend se implementó una arquitectura limpia en cuatro capas:
1. **Views (Controladores HTTP):** Reciben la petición, invocan al serializador y delegan en el servicio sin tocar directamente el ORM.
2. **Serializers (Contratos de entrada/salida):** Validan tipos, campos obligatorios y reglas de negocio de formato.
3. **Services (Lógica de dominio):** Orquestan la clasificación por IA, las transiciones de estado, el historial de auditoría y las recomendaciones de la Ley 1620.
4. **Repository Proxy (`ReporteRepositoryProxy`):** Única vía autorizada para escribir o leer reportes en la base de datos. Aplica una **lista blanca inmutable (`ALLOWED_FIELDS`)** que rechaza cualquier campo identificable (IP, sesión, usuario) y ejecuta el cifrado simétrico Fernet sobre los datos sensibles antes de persistirlos.

| Capa | Tecnologías e implementación en el repositorio |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v4, Vite, React Router v7, Recharts (gráficos), consumo de API con Axios. |
| **Backend** | Python 3.12, Django 5 y Django REST Framework (DRF); autenticación con JWT (`djangorestframework-simplejwt` con rotación y lista negra de tokens). |
| **Base de datos** | Microsoft SQL Server 2022 orquestado en contenedor Docker (`docker-compose`); soporte alternativo en SQLite para pruebas locales rápidas. |
| **Inteligencia Artificial** | `scikit-learn`: arquitectura híbrida con regla determinista de emergencia por palabras críticas + pipeline ML (vectorización TF-IDF de n-gramas y ensamble `VotingClassifier`). |
| **Seguridad y Privacidad** | Cifrado simétrico `Fernet` (`cryptography`) para la descripción del reporte; `AnonymizeIPFilter` y middleware para enmascarar IP y `user-agent` en logs; `ScopedRateThrottle` por endpoint. |
| **Gestión y Calidad** | Metodología ágil Scrum (sprints de dos semanas), tablero Kanban en GitHub Projects, historias en Mural y suite de pruebas con `pytest` y plan manual de 43 casos. |

* **Enlaces oficiales del proyecto:**
  * Repositorio de código: [https://github.com/MariArbe/SafeVoice](https://github.com/MariArbe/SafeVoice)
  * Tablero Kanban: [https://github.com/users/MariArbe/projects/1/views/1](https://github.com/users/MariArbe/projects/1/views/1)
  * Tablero de Historias de Usuario (Mural): [Ver tablero en Mural](https://app.mural.co/t/mariana3648/m/mariana3648/1786567593185/02766a79e78c5ebcb765ef6e6e20710a77d7db66)

### 2.6. Metodología, organización y equipo
El trabajo se gestiona con prácticas de Scrum y seguimiento visual en un tablero Kanban con cuatro columnas oficiales (*Pendiente*, *En progreso*, *En revisión* y *Terminado*). Bajo la **Definición de Terminado (DoD)** acordada, una tarea solo pasa a *Terminado* cuando el código está integrado en la rama `development`, supera las pruebas automatizadas, cumple los criterios de aceptación y no introduce alertas de seguridad.

* **Distribución de liderazgos técnicos en el equipo:**
  * **Mariana Arbeláez:** Frontend y Experiencia de Usuario (UX).
  * **Daniel López:** Frontend, Inteligencia Artificial y Analítica.
  * **Esteban Álvarez:** Backend, Infraestructura, Persistencia y Seguridad.

---

## 3. Síntesis del Avance 1 (Sprints 1 y 2)

El Avance 1 cubrió los sprints 1 y 2 (semanas 6 a 9 del semestre) y se cerró con corte al 20 de septiembre de 2026. En dicho corte se completaron 9 de las 15 historias de usuario priorizadas y se dejaron listos los cimientos del clasificador de riesgo (HU-12).

| Sprint | Semanas | Objetivo del Sprint | Historias de Usuario | Estado al Avance 1 |
| :---: | :---: | :--- | :--- | :---: |
| **Sprint 1** | 6–7 | Diseño de arquitectura, acceso institucional y fundamentos | HU-11, HU-09, HU-10, HU-02 | Completado |
| **Sprint 2** | 8–9 | Reporte anónimo, protección de privacidad y backend | HU-03, HU-01, HU-05, HU-06, HU-04 | Completado |
| **Sprint 3** | 10–11 | Modelo de IA para clasificación automática de riesgo | HU-12 | Iniciando |
| **Sprint 4** | 12–13 | Dashboard, estadísticas, mapa de calor, gestión e integración | HU-07, HU-08, HU-13, HU-14, HU-15 | Planeado |

### Principales entregables consolidados en el Avance 1
1. **Vertical de reporte anónimo funcional:** Maquetación del formulario reactivo estructurado por pasos lógicos (institución, rol víctima/testigo, grado, ubicación, frecuencia, tipo de agresión y descripción), validación en cliente y servidor, creación mediante `POST /api/v1/reports/` y pantalla de confirmación con código UUID.
2. **Vistas públicas de prevención y apoyo:** Sección informativa sobre acoso escolar (`/informacion`) y vista de contactos y líneas de ayuda (`/contactos` y `/lineas-ayuda`).
3. **Seguridad y anonimato por diseño:** Modelo relacional en SQL Server sin claves foráneas hacia la tabla de usuarios, implementación de `ReporteRepositoryProxy`, cifrado de la descripción y contenedorización de la base de datos con Docker.
4. **Gestión de interesados y riesgos iniciales:** Definición de la matriz de 9 stakeholders (estudiantes, orientadores, directivos, instituciones, familias, equipo de desarrollo, docentes evaluadores, proveedores tecnológicos y autoridades como el ICBF) y valoración de los primeros 9 riesgos del proyecto (`R-01` a `R-09`).

---

## 4. Avance 2: Desarrollo de los Sprints 3 y 4

### 4.1. Alcance del periodo
El Avance 2 comprende la ejecución completa de los sprints 3 y 4. El análisis del repositorio al corte del 18 de octubre de 2026 evidencia **más de 80 commits integrados en la rama `development`**, con participación activa de los tres integrantes del equipo, y una suite de **100 casos de prueba automática en el backend** distribuidos en 7 módulos de prueba.

### 4.2. Estado consolidado de las 15 historias de usuario
La siguiente tabla sintetiza el estado real de cada historia de usuario contrastando el código del repositorio con los resultados del plan de pruebas manuales (cuyo detalle completo se presenta en la sección 6):

| ID | Historia de Usuario | Prioridad | Sprint | Estado al corte (Avance 2) | Observación técnica y de verificación |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **HU-01** | Reporte anónimo | P0 | 2 | **Terminado** | 3 de 4 pruebas OK; una prueba (`PT-003`) pendiente de aclarar redacción del registro. |
| **HU-02** | Información sobre bullying | P1 | 1 | **Terminado** | 3 de 3 pruebas manuales en estado OK. |
| **HU-03** | Recursos de ayuda | P1 | 2 | **Terminado con ajustes** | `PT-010`: cambios del admin no se reflejan al estudiante; UX reporta recursos vacíos en BD local. |
| **HU-04** | Confirmación del reporte | P0 | 2 | **Terminado** | 3 de 3 pruebas manuales en estado OK. |
| **HU-05** | Protección del anonimato | P0 | 2 | **Terminado** | Proxy y modelo verificados; falta adjuntar evidencia explícita de revisión de logs del servidor. |
| **HU-06** | Recibir reportes | P0 | 2 | **Parcial** | Listado paginado implementado en UI y API; correo de alerta sin servidor SMTP; hallazgo `H-01` en filtro. |
| **HU-07** | Consultar reportes | P0 | 4 | **En progreso** | Modal de detalle y filtros de estado/riesgo implementados; falta filtro de fechas en UI y ejecutar `PT-020`/`PT-022`. |
| **HU-08** | Actualizar estado | P1 | 4 | **Implementado** | Máquina de estados e historial inmutable con 14 pruebas automáticas en `pytest`; faltan `PT-024` y `PT-025` manuales. |
| **HU-09** | Acceso del orientador | P0 | 1 | **Implementado con ajustes** | Login JWT funcional; revisar `PT-027` (mensaje de error) y separación de permisos (`PT-028`). |
| **HU-10** | Acceso del directivo | P1 | 1 | **Implementado con desviación**| Se unificaron los roles en el código: el directivo accede tanto a estadísticas como a la bandeja (`PT-030`). |
| **HU-11** | Registro de institución | P1 | 1 | **Implementado, por re-probar**| Backend valida NIT/DANE único (14 tests automáticos OK), pero falta interfaz en frontend (`PT-032`, `PT-034`). |
| **HU-12** | Clasificación de riesgo (IA) | P1 | 3 | **Implementado parcialmente** | Modelo híbrido entrenado e integrado y nivel visible por color; ordenamiento automático por prioridad en ajuste. |
| **HU-13** | Estadísticas | P1 | 4 | **Implementado** | Endpoint de agregación seguro y dashboard con gráficos en vivo; falta probar filtro de fechas (`PT-039`, `PT-040`). |
| **HU-14** | Mapa de calor | P1 | 4 | **Parcial** | Endpoint de concentración por zona listo y plano SVG maquetado en dashboard; falta conectar datos en vivo (`PT-041`). |
| **HU-15** | Sugerencias de intervención | P1 | 4 | **Implementado** | Catálogo Ley 1620 expuesto en API, visible en bandeja y con 7 pruebas automáticas OK; agregar casos al plan manual. |

### 4.3. Evidencias técnicas de los desarrollos del Avance 2

#### 4.3.1. Clasificación automática de riesgo con Inteligencia Artificial (HU-12)
Se diseñó e integró en `backend/apps/reports/ml_service.py` una **arquitectura híbrida en dos capas** para maximizar la sensibilidad en casos urgentes:
1. **Capa 1 — Regla determinista de emergencia (Cero Falsos Negativos Críticos):** Evalúa expresiones regulares y vocabulario de peligro vital inmediato (armas blancas o de fuego, amenazas de muerte, suicidio, autolesión o abuso sexual). Si detecta un disparador, asigna de inmediato el nivel `CRITICO` sin depender de la probabilidad estadística.
2. **Capa 2 — Pipeline de Aprendizaje Automático (`scikit-learn`):** Combina la vectorización de texto libre mediante **TF-IDF** (con limpieza de *stopwords* en español y n-gramas) junto con la codificación de variables categóricas del formulario (frecuencia, ubicación, tipo de agresión) alimentando un **ensamble de clasificadores (`VotingClassifier`)** que predice entre cuatro niveles: `BAJO`, `MEDIO`, `ALTO` y `CRITICO`.
* El artefacto entrenado y su dataset curado se encuentran en la carpeta `model/`, acompañados de la documentación de criterios en `docs/Analysis/criterios_clasificacion_riesgo.md`. Tal como establece la mitigación del riesgo `R-04`, la predicción se muestra al orientador como **herramienta de apoyo a la decisión** y nunca ejecuta sanciones ni decisiones automáticas sobre los estudiantes.

#### 4.3.2. Gestión de casos, máquina de estados e historial de auditoría (HU-07 y HU-08)
* El endpoint `PATCH /api/v1/reports/<id>/estado/` exige autenticación JWT, rol autorizado y pertenencia a la misma institución del reporte.
* Implementa una **máquina de estados finita** que valida las transiciones permitidas (`nuevo` $\rightarrow$ `en_revision` $\rightarrow$ `en_seguimiento` / `atendido` $\rightarrow$ `cerrado`, manteniendo compatibilidad con los nombres de estados iniciales) y rechaza transiciones regresivas inválidas (como pasar de `cerrado` directamente a `nuevo`).
* Cada cambio de estado anexa una entrada inmutable en el campo JSON `historial_cambios` del reporte con el ID del orientador, su nombre, la fecha/hora exacta en formato ISO UTC, el estado anterior, el estado nuevo y el comentario de seguimiento. Este módulo cuenta con **14 pruebas automáticas dedicadas** en `test_historial_estado.py`.

#### 4.3.3. Estadísticas institucionales y concentración por zona de la sede (HU-13 y HU-14)
* Los endpoints `GET /api/v1/reports/statistics/` y `GET /api/v1/reports/heatmap/` se diseñaron bajo el principio de **mínimo privilegio analítico**: ejecutan únicamente consultas `COUNT` y `GROUP BY` sobre columnas no sensibles (estado, nivel de riesgo, tipo de agresión, ubicación, grado y mes) en `ReporteRepositoryProxy`, sin leer ni desencriptar jamás la descripción del hecho ni los datos de contacto de la víctima.
* Ambos servicios filtran por la institución del usuario autenticado y aceptan parámetros `fecha_inicio` y `fecha_fin`.
* El cálculo de mapa de calor agrupa los incidentes por micro-zona dentro del plantel educativo (salón de clases, baños, pasillos, patio/descanso, salida, internet) y calcula una **intensidad relativa normalizada entre `0.0` y `1.0`**, complementada en el frontend (`Dashboard.jsx`) con un plano arquitectónico vectorial en SVG.

#### 4.3.4. Sugerencias de intervención basadas en la Ley 1620 de 2013 (HU-15)
Se construyó el motor de recomendaciones normativas en `backend/apps/reports/recommendations.py` (documentado en `docs/Analysis/protocolos_intervencion_ley1620.md`), el cual homologa el nivel de riesgo y la tipología de agresión del reporte con la **Ruta de Atención Integral para la Convivencia Escolar de Colombia (Ley 1620 de 2013 y Artículo 40 del Decreto 1965 de 2013)**. Se expone mediante `GET /api/v1/reports/<id>/recomendaciones/` y se renderiza como un panel interactivo dentro del detalle del caso en la bandeja del orientador:

| Nivel de Riesgo | Clasificación Ley 1620 | Criterio Jurídico y Pedagógico | Plazo de Atención | Protocolo Principal y Rutas de Remisión |
| :---: | :---: | :--- | :---: | :--- |
| **🟢 BAJO** | **Situación Tipo I** | Conflictos interpersonales esporádicos que no generan daño al cuerpo ni a la salud física o mental. | Normal (`< 72 h`) | Mediación escolar, diálogo restaurativo en aula y compromiso pedagógico de no repetición. |
| **🟡 MEDIO** | **Situación Tipo I Reiterada** | Roce o exclusión con patrón incipiente de reiteración que afecta el clima emocional del estudiante. | Media (`< 48 h`) | Entrevistas diagnósticas por separado en orientación, acta de compromiso y taller preventivo de aula. |
| **🟠 ALTO** | **Situación Tipo II** | Acoso escolar (*bullying*) o ciberacoso sistemático y repetido que causa daño físico o psicológico sin constituir delito. | Alta (`< 24 h hábiles`) | Medidas cautelares de protección, atención socioemocional, citación individual a acudientes y Comité Escolar de Convivencia. |
| **🔴 CRÍTICO** | **Situación Tipo III** | Agresiones que constituyen presuntos delitos (lesiones graves, violencia sexual, porte de armas) o riesgo vital/suicida. | Inmediata (`< 2 h`) | Resguardo físico inmediato, urgencias médicas/psicológicas (Línea 123 / Salud) y remisión obligatoria a ICBF (Línea 141), Policía de Infancia o Fiscalía. |

---

### 4.4. Evidencias gráficas del Avance 2 (Guía de inserción Figuras 12 a 25)
Cada recuadro marcado como **[CAPTURA]** indica exactamente qué pantalla mostrar y cómo obtenerla. Al insertar la imagen definitiva en el documento, reemplace el recuadro y conserve el pie de figura APA. La numeración continúa la del Avance 1, que llegó hasta la Figura 11.

> **Criterios de seguridad para todas las capturas:** Usar exclusivamente datos de prueba o semilla (nunca reportes reales ni nombres de menores), ocultar tokens JWT, correos personales o contraseñas, capturar la ventana con la ruta visible y exportar en formato PNG.

#### A. Interfaz de usuario (Frontend)

**[CAPTURA 1 — insertar aquí]**  
*Qué mostrar:* Bandeja de reportes (`/docente/bandeja` o `/docente/reportes`) mostrando al menos un reporte de cada nivel de riesgo (insignias verde, amarilla, naranja y roja) y un caso crítico destacado.  
**Figura 12.** *Bandeja de reportes institucional con nivel de riesgo diferenciado por color (HU-07 y HU-12).*

**[CAPTURA 2 — insertar aquí]**  
*Qué mostrar:* Modal de detalle y actualización de estado abierto al hacer clic en un reporte, mostrando el selector de nuevo estado y el campo de notas de orientación.  
**Figura 13.** *Modal de actualización de estado y registro de notas de orientación (HU-08).*

**[CAPTURA 3 — insertar aquí]**  
*Qué mostrar:* Sección desplegada del historial de cambios de estado dentro del modal de un reporte, evidenciando usuario orientador, fecha/hora y comentario de al menos dos transiciones.  
**Figura 14.** *Línea de tiempo del historial de auditoría de cambios de estado de un reporte (HU-08).*

**[CAPTURA 4 — insertar aquí]**  
*Qué mostrar:* Panel de sugerencias de intervención abierto en el detalle de un caso de riesgo alto o crítico, mostrando plazo de urgencia, clasificación Ley 1620, acciones inmediatas y líneas de ayuda.  
**Figura 15.** *Panel de sugerencias de intervención basadas en la Ley 1620 de 2013 (HU-15).*

**[CAPTURA 5 — insertar aquí]**  
*Qué mostrar:* Vista del Dashboard institucional (`/docente/dashboard`) con las tarjetas de indicadores superiores y los gráficos interactivos de barras y distribución en vivo.  
**Figura 16.** *Dashboard institucional con estadísticas agregadas de reportes (HU-13).*

**[CAPTURA 6 — insertar aquí]**  
*Qué mostrar:* Sección del plano arquitectónico / concentración de casos por zona dentro de la sede en `/docente/dashboard`, mostrando la distinción visual por severidad y el detalle de una zona seleccionada.  
**Figura 17.** *Visualización de concentración de casos por zona física de la sede (HU-14).*

**[CAPTURA 7 — insertar aquí]**  
*Qué mostrar:* Formulario público de reporte anónimo (`/reporte`) con el diseño actualizado, incluyendo la casilla inferior de revelación voluntaria de identidad para casos graves.  
**Figura 18.** *Formulario de reporte anónimo con flujo condicional actualizado (HU-01).*

**[CAPTURA 8 — insertar aquí]**  
*Qué mostrar:* Composición con las pantallas de inicio de sesión (`/docente/login`), registro de personal (`/docente/registro`) y el nuevo menú principal docente (`/docente/menu`) completamente en español.  
**Figura 19.** *Pantallas de inicio de sesión, registro y menú principal del personal institucional (HU-09 y HU-10).*

**[CAPTURA 9 — insertar aquí]**  
*Qué mostrar:* Fila de la bandeja o sección del modal de detalle que muestra el nombre y medio de contacto de un estudiante de prueba que marcó voluntariamente la casilla de revelar identidad.  
**Figura 20.** *Visualización controlada de datos de contacto en casos con identidad revelada voluntariamente (HU-01 y HU-06).*

#### B. Backend, anonimato e inteligencia artificial

**[CAPTURA 10 — insertar aquí]**  
*Qué mostrar:* Consulta SQL en el motor de base de datos sobre la tabla `reportes` evidenciando las columnas almacenadas, el texto de `descripcion` cifrado con Fernet (`gAAAA...`) y la ausencia total de columnas de IP, dispositivo o sesión.  
**Figura 21.** *Registros en base de datos con descripción cifrada y sin metadatos identificables del remitente (HU-05).*

**[CAPTURA 11 — insertar aquí]**  
*Qué mostrar:* Salida de métricas de evaluación del clasificador de riesgo (exactitud, precisión, *recall*, *F1-score* y matriz de confusión) generadas por el script de entrenamiento en la carpeta `model/`.  
**Figura 22.** *Métricas de evaluación del modelo híbrido de clasificación de riesgo (HU-12).*

#### C. Calidad y gestión del proyecto

**[CAPTURA 12 — insertar aquí]**  
*Qué mostrar:* Salida de la terminal ejecutando `pytest apps` dentro de la carpeta `backend/`, donde se aprecia el resumen de las 100 pruebas automáticas recolectadas.  
**Figura 23.** *Ejecución de la suite de pruebas automáticas del backend con pytest.*

**[CAPTURA 13 — insertar aquí]**  
*Qué mostrar:* Vista de la hoja *Plan de pruebas* en Google Sheets (`SafeVoice_Plan_de_Pruebas.xlsx`) mostrando las columnas de resultado esperado, resultado obtenido y estado.  
**Figura 24.** *Artefacto de Plan de pruebas por criterio de aceptación con resultados registrados.*

**[CAPTURA 14 — insertar aquí]**  
*Qué mostrar:* Tablero Kanban en GitHub Projects actualizado al corte de los sprints 3 y 4.  
**Figura 25.** *Tablero Kanban del proyecto en GitHub Projects al corte del Avance 2.*

---

## 5. Cambios del proyecto y correcciones al Avance 1

### 5.1. Decisiones que modificaron lo planeado en el Avance 1
La siguiente tabla documenta las adaptaciones técnicas y de alcance realizadas durante los sprints 3 y 4 junto con su justificación e impacto en los criterios de aceptación:

| Aspecto | Planeado en el Avance 1 | Resultado en el Avance 2 | Justificación e impacto en criterios |
| :--- | :--- | :--- | :--- |
| **Roles de personal institucional** | Orientador y directivo con vistas y permisos estrictamente separados. | Roles unificados en el código (`EsDirectivoOOrientador`) y creación de `/docente/menu` con acceso a bandeja y dashboard. | Simplificar la navegación durante las pruebas integradas del piloto. Contradice `HU-09-CA03` y `HU-10-CA02`, por lo que en la sección 8.2 se define la decisión de cierre. |
| **Estados del reporte** | `PENDIENTE`, `EN_REVISION`, `ATENDIDO`, `DESCARTADO`. | `nuevo`, `en_revision`, `en_seguimiento` y `cerrado` (manteniendo compatibilidad con los estados anteriores). | Reflejar con mayor fidelidad el ciclo real de acompañamiento psicosocial escolar. |
| **Clasificador de IA (HU-12)** | Modelo único de clasificación de texto por definir. | Arquitectura híbrida: regla determinista de emergencia + ensamble ML (`VotingClassifier`) con TF-IDF y variables categóricas. | Garantizar que ningún reporte con mención de armas, suicidio o abuso sea subclasificado por un falso negativo estadístico. |
| **Mapa de calor (HU-14)** | Mapa geográfico con librería de coordenadas GPS. | Concentración por micro-zona física dentro de la sede (endpoint con intensidad 0–1 + plano arquitectónico SVG). | Dentro de un colegio los incidentes ocurren en salones, baños o patios (no en coordenadas satelitales), y se evita recolectar geolocalización sensible del menor. |
| **Recomendaciones (HU-15)** | Historia enunciada sin especificación normativa. | Catálogo estructurado fundamentado en la **Ley 1620 de 2013** y el **Decreto 1965 de 2013** (Situaciones Tipo I, II y III). | Alinear el soporte a la decisión del orientador con el marco legal obligatorio para todos los colegios en Colombia. |
| **Registro de personal** | Creación de cuentas únicamente por un directivo autenticado. | Incorporación adicional de endpoint público de registro (`/api/v1/users/register/`) con límite de 5 peticiones/minuto. | Facilitar el enrolamiento ágil de docentes en las pruebas de validación. |
| **Notificaciones (HU-06)** | Canal de notificación pendiente de definir. | Se implementó envío asíncrono de alerta por correo en hilo secundario en `ReporteService`, pero `PT-018` reporta que aún no llega al usuario. | Falta configurar un servidor SMTP real o un indicador reactivo en la interfaz de la bandeja. |
| **Documentación técnica** | Concentrada en un único informe externo. | Documentación modular versionada dentro del repositorio (`docs/Analysis/`, `docs/design/` y `model/README.md`). | Asegurar trazabilidad directa entre código fuente, modelo de datos, protocolos legales y pruebas. |

### 5.2. Autocrítica y correcciones a inconsistencias del Avance 1
Al auditar el documento entregado en el Avance 1 frente al estado real del proyecto, el equipo identificó cuatro inconsistencias que se dejan formalmente subsanadas en esta entrega acumulativa:
1. **Estado real de HU-06:** En la tabla del Avance 1, la historia `HU-06` (*Recibir reportes*) figuraba como *Terminada*, mientras que en la sección de estado de implementación las notificaciones aparecían como *Pendientes*. Se corrige su estado a **Parcial** hasta cerrar `PT-018` y el hallazgo `H-01`.
2. **Asignación de la tarea #62 (Patrón Proxy):** En la tabla de trazabilidad del Sprint 2 figuraba como *(por asignar)* aunque ya estaba terminada. Se deja constancia de que fue implementada en el backend por **Esteban Álvarez**.
3. **Sustitución de las Figuras 6 y 8 del Avance 1 y numeración:** Las figuras 6 y 8 incluidas en el Avance 1 correspondían a maquetas de plantillas genéricas en inglés ajenas al dominio de SafeVoice, y se omitió el número de la Figura 7. En este Avance 2 se reemplazan por las interfaces reales desarrolladas en React (`Dashboard.jsx` y `BandejaReportes.jsx`) y se retoma la numeración continua desde la **Figura 12**.
4. **Precisión sobre el anonimato en la pantalla de confirmación:** La pantalla de éxito del reporte indicaba que el reporte es *"100 % anónimo"* en todos los casos, pese a que el formulario incluye una casilla para que el estudiante revele voluntariamente su nombre y contacto en situaciones críticas. En adelante, el mensaje aclara expresamente esa excepción voluntaria.

---

## 6. Artefacto Nuevo 1: Plan de pruebas

### 6.1. Estrategia de verificación
Se definieron **43 criterios de aceptación** para las historias `HU-01` a `HU-14` (4 criterios para `HU-01` y 3 para cada una de las 13 historias restantes). Cada criterio dio origen a un caso de prueba funcional manual (`PT-001` a `PT-043`) documentado con descripción, datos de entrada, resultado esperado, resultado obtenido y estado (`OK`, `Error` o `Pendiente`). De manera complementaria, el backend cuenta con una suite de **100 pruebas automáticas** ejecutadas con `pytest`. La historia `HU-15` cuenta con 7 pruebas automáticas y sus criterios manuales se programan en el plan de cierre (sección 11).

### 6.2. Resumen cuantitativo de pruebas manuales por Historia de Usuario

| Historia de Usuario | Total Pruebas | OK | Error | Pendiente |
| :--- | :---: | :---: | :---: | :---: |
| **HU-01** — Reporte anónimo | 4 | 3 | 1 | 0 |
| **HU-02** — Información sobre bullying | 3 | 3 | 0 | 0 |
| **HU-03** — Recursos de ayuda | 3 | 2 | 1 | 0 |
| **HU-04** — Confirmación del reporte | 3 | 3 | 0 | 0 |
| **HU-05** — Protección del anonimato | 3 | 3 | 0 | 0 |
| **HU-06** — Recibir reportes | 3 | 1 | 2 | 0 |
| **HU-07** — Consultar reportes | 3 | 0 | 1 | 2 |
| **HU-08** — Actualizar estado | 3 | 1 | 0 | 2 |
| **HU-09** — Acceso del orientador | 3 | 1 | 2 | 0 |
| **HU-10** — Acceso del directivo | 3 | 2 | 1 | 0 |
| **HU-11** — Registro de institución | 3 | 1 | 2 | 0 |
| **HU-12** — Clasificación de riesgo (IA) | 3 | 3 | 0 | 0 |
| **HU-13** — Estadísticas | 3 | 1 | 0 | 2 |
| **HU-14** — Mapa de calor | 3 | 0 | 1 | 2 |
| **Total general** | **43** | **24 (56 %)** | **11 (26 %)** | **8 (19 %)** |

### 6.3. Matriz completa de ejecución del Plan de Pruebas (`PT-001` a `PT-043`)
La siguiente tabla reproduce íntegramente el registro oficial del archivo `SafeVoice_Plan_de_Pruebas.xlsx`:

| ID | HU | Criterio de Aceptación / Descripción | Datos de entrada | Resultado esperado | Resultado obtenido en la prueba | Estado |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **PT-001** | HU-01 | El formulario permite diligenciar tipo, descripción, fecha aprox. y ubicación sin pedir datos personales. | Abrir formulario de reporte y revisar campos disponibles. | Formulario visible sin campos obligatorios de nombre, correo ni documento. | El formulario está completo. | **OK** |
| **PT-002** | HU-01 | Al enviar el formulario con los campos obligatorios completos, guarda el reporte y retorna código. | Diligenciar todos los campos obligatorios con datos válidos y enviar. | El reporte se guarda y se muestra un código de seguimiento. | Se envía correctamente. | **OK** |
| **PT-003** | HU-01 | Si falta un campo obligatorio, el sistema muestra un mensaje de error y no envía el reporte. | Enviar el formulario dejando vacío el campo `descripción`. | El sistema muestra mensaje de error y no envía el reporte. | Error de completar el campo. | **Error** |
| **PT-004** | HU-01 | El reporte enviado no queda asociado a ningún dato que identifique al estudiante (IP, sesión, dispositivo). | Enviar un reporte válido y revisar la BD / logs del backend. | No existe ningún campo con IP, sesión o dato identificable del remitente. | No existe trackeo de la IP. | **OK** |
| **PT-005** | HU-02 | El estudiante puede acceder a la sección informativa sin necesidad de iniciar sesión. | Ingresar a la sección de información sin iniciar sesión. | La sección carga correctamente sin pedir login. | Fácil acceso. | **OK** |
| **PT-006** | HU-02 | La sección muestra definiciones y tipos de bullying/ciberbullying. | Revisar el contenido de la sección informativa. | Se muestran definiciones y tipos de bullying/ciberbullying. | Se muestra una página con toda la información. | **OK** |
| **PT-007** | HU-02 | La sección incluye señales de alerta para identificar una situación de acoso. | Revisar el contenido de la sección informativa. | Se listan señales de alerta para identificar una situación de acoso. | Se listan y se dan números de ayuda. | **OK** |
| **PT-008** | HU-03 | El estudiante puede consultar la lista de contactos y recursos de ayuda sin iniciar sesión. | Ingresar a la sección de recursos de ayuda sin iniciar sesión. | La lista de recursos es visible sin requerir login. | Acceso en 2 clics máximo. | **OK** |
| **PT-009** | HU-03 | Cada recurso muestra nombre, descripción y medio de contacto (teléfono, línea, enlace). | Abrir el detalle de un recurso de la lista. | Se muestra nombre, descripción y medio de contacto del recurso. | Se listan. | **OK** |
| **PT-010** | HU-03 | La lista reflejada al estudiante se actualiza cuando un administrador agrega, edita o elimina un recurso. | Agregar/editar un recurso desde administración y recargar vista estudiante. | El cambio se refleja correctamente en la lista visible al estudiante. | Aún no aparece la modificación para el estudiante. | **Error** |
| **PT-011** | HU-04 | Tras enviar un reporte válido, el sistema muestra una pantalla de confirmación. | Enviar un reporte con todos los datos válidos. | Se muestra pantalla de confirmación de envío exitoso. | Se muestra el código de seguimiento correctamente. | **OK** |
| **PT-012** | HU-04 | La confirmación incluye un código de seguimiento único generado por el sistema. | Revisar la pantalla de confirmación tras enviar un reporte. | Se muestra un código de seguimiento único. | Cada caso tiene un código distinto. | **OK** |
| **PT-013** | HU-04 | El código de seguimiento no contiene ni permite inferir información personal del estudiante. | Analizar el formato del código de seguimiento generado. | El código no contiene ni permite inferir datos personales. | El código solo muestra la gravedad y el tipo de caso *(ver nota 6.5)*. | **OK** |
| **PT-014** | HU-05 | El sistema no almacena IP, user-agent ni identificadores de sesión ligados al reporte enviado. | Enviar un reporte y revisar los datos almacenados en BD. | No se registra IP, user-agent ni sesión asociada al reporte. | Solo se almacenan si el estudiante lo pide. | **OK** |
| **PT-015** | HU-05 | Los logs del servidor no permiten reconstruir la identidad del remitente de un reporte. | Revisar los logs del servidor generados al enviar un reporte. | Los logs no contienen información que identifique al remitente. | Solo se identifica al estudiante si este lo quiere. | **OK** |
| **PT-016** | HU-05 | Pruebas de trazabilidad confirman que no es posible vincular un reporte con un estudiante específico. | Intentar cruzar el reporte con otros registros (sesión, auth, etc.). | No es posible vincular el reporte a un estudiante específico. | Solo se identifica al estudiante si este lo quiere. | **OK** |
| **PT-017** | HU-06 | El orientador, al iniciar sesión, visualiza la lista de reportes correspondientes a su institución. | Iniciar sesión como orientador y abrir la bandeja de reportes. | Se listan los reportes correspondientes a la institución del orientador. | Aún no está. | **Error** |
| **PT-018** | HU-06 | El orientador recibe una notificación o indicador visual cuando llega un nuevo reporte. | Enviar un nuevo reporte estando el orientador con sesión activa. | El orientador recibe una notificación o indicador visual del nuevo reporte. | No llega notificación. | **Error** |
| **PT-019** | HU-06 | Un orientador de otra institución no puede ver los reportes de una institución distinta a la suya. | Iniciar sesión en institución A e intentar ver reportes de institución B. | El sistema no muestra reportes de instituciones distintas. | No hay mix entre instituciones *(ver hallazgo H-01)*. | **OK** |
| **PT-020** | HU-07 | El orientador puede abrir el detalle de un reporte y visualizar toda su información. | Seleccionar un reporte del listado y abrir su detalle. | Se muestra la información completa del reporte. | *(Sin ejecutar al corte)* | **Pendiente** |
| **PT-021** | HU-07 | El orientador puede filtrar el listado de reportes por fecha, estado y nivel de riesgo. | Aplicar filtros de fecha, estado y nivel de riesgo en el listado. | El listado se actualiza según los filtros seleccionados. | Aún no está. | **Error** |
| **PT-022** | HU-07 | Los filtros aplicados muestran únicamente los reportes que cumplen el criterio seleccionado. | Aplicar un filtro específico (ej. estado = `atendido`) y revisar. | Solo se muestran los reportes que cumplen el criterio filtrado. | *(Sin ejecutar al corte)* | **Pendiente** |
| **PT-023** | HU-08 | El orientador puede cambiar el estado de un reporte entre los valores definidos. | Abrir un reporte y cambiar su estado a uno de los valores permitidos. | El estado del reporte se actualiza correctamente. | Lo permite. | **OK** |
| **PT-024** | HU-08 | El sistema registra quién y cuándo se realizó el cambio de estado (historial/trazabilidad). | Cambiar el estado de un reporte y revisar el historial de cambios. | Se registra usuario y fecha/hora del cambio de estado. | *(Cubierto en pytest; pendiente manual)* | **Pendiente** |
| **PT-025** | HU-08 | El sistema no permite una transición de estado no válida (ej. de `cerrado` directo a `nuevo`). | Intentar cambiar un reporte de `cerrado` directamente a `nuevo`. | El sistema rechaza la transición no permitida. | *(Cubierto en pytest; pendiente manual)* | **Pendiente** |
| **PT-026** | HU-09 | El orientador puede iniciar sesión con usuario y contraseña válidos. | Iniciar sesión con usuario y contraseña de orientador válidos. | El orientador accede correctamente a la plataforma. | Permite meterse a ver el dashboard o los procesos. | **OK** |
| **PT-027** | HU-09 | Con credenciales inválidas, el sistema muestra un mensaje de error y no permite el acceso. | Iniciar sesión con contraseña incorrecta. | El sistema muestra mensaje de error y no otorga acceso. | Deniega el acceso, pero el mensaje indica cuál dato falló. | **Error** |
| **PT-028** | HU-09 | Tras iniciar sesión, el orientador solo accede a las funcionalidades correspondientes a su rol. | Iniciar sesión como orientador e intentar acceder a funciones de directivo. | El sistema restringe el acceso a funciones fuera de su rol. | *(Falla por unificación de roles)* | **Error** |
| **PT-029** | HU-10 | El directivo puede iniciar sesión con usuario y contraseña válidos. | Iniciar sesión con usuario y contraseña de directivo válidos. | El directivo accede correctamente a la plataforma. | Permite iniciar sesión. | **OK** |
| **PT-030** | HU-10 | Tras iniciar sesión, el directivo accede a estadísticas y análisis, no a la bandeja del orientador. | Iniciar sesión como directivo y navegar a estadísticas / bandeja. | El directivo accede a estadísticas y no a la bandeja de reportes. | El directivo accede a ambas. | **Error** |
| **PT-031** | HU-10 | Con credenciales inválidas, el sistema deniega el acceso y muestra un mensaje de error. | Iniciar sesión con credenciales de directivo inválidas. | El sistema deniega el acceso y muestra error. | Muestra mensaje de error genérico correctamente. | **OK** |
| **PT-032** | HU-11 | El directivo puede registrar una nueva institución indicando los datos obligatorios. | Diligenciar el formulario de registro de institución con datos obligatorios. | La institución se registra correctamente en el sistema. | El registro no queda guardado, la institución no se habilita. | **Error** |
| **PT-033** | HU-11 | Si falta un dato obligatorio, el sistema muestra un error y no crea el registro de la institución. | Enviar el formulario dejando vacío el nombre de la institución. | El sistema muestra error y no crea el registro. | Si hay error o algún faltante, no permite crear el registro. | **OK** |
| **PT-034** | HU-11 | Una vez registrada, la institución queda habilitada para que sus usuarios usen la plataforma. | Registrar una institución e intentar crear un usuario asociado. | La institución queda habilitada y permite crear usuarios. | El sistema permite registrar el NIT duplicado sin mostrar validación. | **Error** |
| **PT-035** | HU-12 | Al recibirse un reporte, el sistema asigna automáticamente un nivel de riesgo (bajo, medio, alto, crítico). | Enviar un reporte con contenido de riesgo alto y revisar clasificación. | El sistema asigna automáticamente un nivel de riesgo al reporte. | Modelo clasificador entrenado con ensamble híbrido (`VotingClassifier`) y TF-IDF; integración en backend. | **OK** |
| **PT-036** | HU-12 | El nivel de riesgo asignado es visible para el orientador en el listado y en el detalle del reporte. | Iniciar sesión como orientador y revisar el listado/detalle de un reporte. | El nivel de riesgo es visible en ambas vistas. | Diferenciados por color según severidad (Verde, Amarillo, Naranja, Rojo) en bandeja y detalle. | **OK** |
| **PT-037** | HU-12 | Los reportes clasificados como `crítico` aparecen priorizados o destacados en la bandeja. | Enviar un reporte que el modelo clasifique como `crítico` y revisar bandeja. | El reporte aparece priorizado o destacado respecto a los demás. | Alerta visual para casos críticos maquetada en interfaz; ordenamiento automático en BD en desarrollo. | **OK** |
| **PT-038** | HU-13 | El directivo puede consultar estadísticas de los reportes (cantidad, tipo, estado) de su institución. | Iniciar sesión como directivo y abrir el módulo de estadísticas. | Se muestran estadísticas de cantidad, tipo y estado de la institución. | Permite ver el panel de estadísticas. | **OK** |
| **PT-039** | HU-13 | Las estadísticas se pueden filtrar por rango de fechas. | Aplicar un filtro de rango de fechas en el módulo de estadísticas. | Las estadísticas se recalculan según el rango seleccionado. | *(Sin ejecutar al corte)* | **Pendiente** |
| **PT-040** | HU-13 | Los datos mostrados en las estadísticas coinciden con los reportes realmente almacenados. | Comparar datos en estadísticas contra reportes en base de datos. | Los valores coinciden con los datos reales del sistema. | *(Sin ejecutar al corte)* | **Pendiente** |
| **PT-041** | HU-14 | El directivo puede visualizar un mapa con la concentración de casos reportados por zona o sede. | Iniciar sesión como directivo y abrir el mapa de calor. | Se visualiza el mapa con la concentración de casos por zona/sede. | Hay un análisis de frecuencia por lugar, pero no el mapa conectado. | **Error** |
| **PT-042** | HU-14 | El mapa se actualiza correctamente al aplicar filtros de fecha o tipo de incidente. | Aplicar filtros de fecha o tipo de incidente sobre el mapa de calor. | El mapa se actualiza reflejando el filtro aplicado. | *(Sin ejecutar al corte)* | **Pendiente** |
| **PT-043** | HU-14 | Las zonas con mayor cantidad de reportes se distinguen visualmente mediante color o intensidad. | Comparar visualmente zonas con distinta cantidad de reportes en el mapa. | Las zonas con más reportes se distinguen claramente por color/intensidad. | *(Sin ejecutar al corte)* | **Pendiente** |

### 6.4. Diagnóstico y acción propuesta para las 11 pruebas en estado `Error`

| ID | Criterio evaluado | Diagnóstico frente al código actual | Acción correctiva programada |
| :---: | :--- | :--- | :--- |
| **PT-003** | Campo obligatorio vacío bloquea el envío | El formulario en `Reporte.jsx` sí bloquea el envío y muestra error; el tester anotó *"Error de completar el campo"* y clasificó la fila como `Error`. | Repetir la prueba documentando explícitamente que el envío fue bloqueado como se esperaba y pasar a `OK`. |
| **PT-010** | Recursos reflejados tras cambios del admin | `ContactosRecursos.jsx` consulta la API, pero no hay pantalla de administración de recursos en el frontend y la BD local carecía de semillas. | Poblar recursos semilla por defecto y verificar la actualización desde el endpoint administrativo. |
| **PT-017** | Orientador visualiza reportes de su institución | La prueba se corrió antes de integrar `BandejaReportes.jsx`. El código actual ya cuenta con la bandeja paginada. | Re-ejecutar la prueba sobre la rama `development` actual tras corregir el filtro `H-01`. |
| **PT-018** | Notificación o indicador de nuevo reporte | En `ReporteService` existe envío de correo en segundo plano, pero no hay servidor SMTP configurado ni alerta en tiempo real en UI. | Configurar backend de correo de prueba y añadir un indicador visual de reportes en estado `nuevo` dentro de la bandeja. |
| **PT-021** | Filtros por fecha, estado y nivel de riesgo | En `BandejaReportes.jsx` funcionan los selectores de riesgo y estado, pero falta agregar los selectores de `fecha_inicio` y `fecha_fin` que el backend ya soporta. | Agregar los dos campos de fecha en la barra de filtros de la bandeja y re-probar. |
| **PT-027** | Mensaje genérico con credenciales inválidas | En el código actual (`tokens.py` y `Login.jsx`) ya se unificó el mensaje a *"Correo electrónico o contraseña incorrectos"*. | Re-ejecutar la prueba con la versión actual de `development` para confirmar el cierre. |
| **PT-028** | Orientador restringido solo a su rol | Falla porque el commit `5dadee8` unificó los permisos en `EsDirectivoOOrientador` y `MenuDocente.jsx` muestra ambas tarjetas. | Definir en el equipo si se separan las vistas por rol o se actualiza el criterio de aceptación. |
| **PT-030** | Directivo no accede a bandeja del orientador | Misma causa que `PT-028`: el directivo puede entrar tanto a estadísticas como a la bandeja de casos. | Aplicar la misma decisión arquitectónica que en `PT-028`. |
| **PT-032** | Registro de nueva institución | El endpoint `POST /api/v1/institutions/` funciona, pero en el frontend `/docente/registro` (`SignUp.jsx`) solo registra usuarios individuales. | Conectar o habilitar el formulario de alta institucional en el frontend y re-probar. |
| **PT-034** | Unicidad de NIT/DANE al registrar institución | El modelo `Institution` y `RegistrarInstitucionSerializer` ya tienen `UniqueConstraint` para `codigo_dane` (validado en `pytest`). | Re-probar contra el endpoint actual y registrar el mensaje de rechazo ante NIT duplicado. |
| **PT-041** | Mapa de calor por zona o sede | `Dashboard.jsx` incluye el plano arquitectónico SVG por bloques, pero usa el arreglo estático `zonasColegio` en lugar de consumir `/api/v1/reports/heatmap/`. | Conectar el plano SVG del dashboard con la respuesta dinámica del endpoint `heatmap`. |

### 6.5. Observaciones críticas sobre la calidad del registro de pruebas
Para asegurar que el plan de pruebas sea una evidencia impecable en la entrega final, el equipo dejó registradas las siguientes observaciones de auditoría interna:
1. **Inconsistencia en `PT-013`:** La celda de resultado obtenido dice que *"el código solo muestra la gravedad y el tipo de caso"*, pero en realidad el código de seguimiento es un `UUIDv4` completamente aleatorio (`e84b8124-...`) que no codifica ningún dato del caso. Debe corregirse la redacción de esa celda.
2. **Observación repetida en `PT-014`, `PT-015` y `PT-016`:** Las tres filas repiten *"Solo se identifica al estudiante si este lo quiere"*, lo cual no demuestra haber inspeccionado el archivo de logs del servidor para verificar el enmascaramiento de IP (`PT-015`).
3. **Estado optimista en `PT-035` y `PT-037`:** Ambas figuran en `OK` aunque el texto de resultado obtenido menciona partes *"en desarrollo"* (como el ordenamiento automático por prioridad en base de datos). Deben registrarse como parciales hasta culminar ese ordenamiento.
4. **Falso positivo en `PT-019`:** Figura como `OK` (*"No hay mix entre instituciones"*), pero la auditoría de código demostró que `ListarReportesView` no fuerza la institución del usuario autenticado si no se envía por URL (ver hallazgo `H-01` en la sección 7.2).

### 6.6. Cobertura y resultados de las Pruebas Automáticas (`pytest`)
El backend cuenta con **100 pruebas automatizadas** distribuidas en 9 archivos dentro de `backend/apps/`:

| Dominio / Módulo | Archivo de prueba | Casos de prueba | Estado de ejecución al corte |
| :--- | :--- | :---: | :--- |
| **Usuarios y Autenticación** | `apps/users/tests/test_login.py` | 19 | **19 aprobadas** |
| **Permisos por Rol** | `apps/users/tests/test_permisos.py` | 6 | **6 aprobadas** |
| **Creación de Usuarios** | `apps/users/tests/test_registro_usuario.py` | 5 | **5 aprobadas** |
| **Instituciones y DANE/NIT** | `apps/institutions/tests/test_registro_institucion.py` | 6 | **6 aprobadas** |
| **Anonimato y Proxy (HU-05)** | `apps/reports/tests/test_trazabilidad.py` | 3 | **3 aprobadas** |
| **Historial de Estados (HU-08)**| `apps/reports/tests/test_historial_estado.py` | 16 | **16 aprobadas** |
| **Sugerencias Ley 1620 (HU-15)**| `apps/reports/tests/test_recomendaciones.py` | 7 | **7 aprobadas** |
| **Contratos de Acceso y API** | `apps/reports/tests/test_access_stubs.py` | 13 | **13 aprobadas** |
| **Servicio ML de Riesgo (HU-12)**| `apps/reports/tests/test_ml_service.py` | 25 | **25 aprobadas** |
| **Total suite Backend** | **9 archivos de prueba en `apps/`** | **100** | **100 aprobadas (100 % passed en 3.52 s)** |

* **Nota técnica sobre la suite automatizada:** Durante la fase inicial de integración se detectó una diferencia de versión de `scikit-learn` en el archivo serializado `.joblib`, la cual fue resuelta re-entrenando y sincronizando el artefacto con el entorno del backend (`scikit-learn` con exactitud de `0.900` y F1-Macro `0.899`), logrando el **100 % de aprobación (100/100)** en `pytest apps`. Asimismo, se recomienda invocar `pytest apps` dado que el script heredado `backend/test_sprint2.py` ejecuta código al importarse.

---

## 7. Artefacto Nuevo 2: Checklist de seguridad y auditoría de código

### 7.1. Contraste del Checklist de Seguridad: Evaluación del Equipo vs. Revisión de Código
La columna **Equipo** reproduce el resultado registrado en la hoja *Checklist de seguridad* del archivo de pruebas (12 cumplidos y 6 no cumplidos sobre 18 criterios). Las columnas **Estado Real en Código** y **Verificación técnica contra el código al corte** contrastan cada ítem con la auditoría directa del repositorio:

| # | Categoría | Criterio de seguridad evaluado | Equipo | Estado Real en Código | Verificación técnica contra el código al corte |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | Autenticación | Requiere usuario y contraseña para ingresar (orientador/directivo) | **✓** | **✓** | **Confirmado:** `CustomTokenObtainPairView` exige email y contraseña validados contra `Usuario` y emite par de tokens JWT. |
| **2** | Autenticación | No permite acceder al panel de orientador/directivo sin haber iniciado sesión | **✗** | **✗** | **Confirmado (`H-07`):** Aunque la API exige JWT por defecto, `AppRouter.jsx` no tiene `ProtectedRoute`; `MenuDocente.jsx` es accesible sin token y `Dashboard.jsx` muestra datos *mock* ante error `401`. |
| **3** | Autenticación | La contraseña viaja y se guarda cifrada (no en texto plano) | **✗** | **Parcial** | **En BD sí cumple (`✓`):** Se guarda hasheada con PBKDF2 (`set_password`). **En tránsito (`✗`):** El servidor en Oracle Cloud (`157.137.205.82`) opera hoy sobre HTTP; falta configurar certificado HTTPS/TLS. |
| **4** | Autenticación | Existe límite de intentos fallidos de login o control anti fuerza bruta | **✓** | **✓** | **Implementado y verificado:** Módulo `brute_force.py` con límite de 5 intentos fallidos consecutivos por cuenta e IP, bloqueo temporal de 5 min (`HTTP 429 Too Many Requests`), reseteo en login exitoso, aviso de intentos restantes en frontend/API, y exención de `/api/v1/users/` en `AnonymizeRequestMiddleware` (`H-05` resuelto). |
| **5** | Roles | Existen roles diferenciados: estudiante (anónimo), orientador, directivo | **✓** | **✓** | **Confirmado:** El modelo `Usuario` define `ORIENTADOR` y `DIRECTIVO`, mientras que el estudiante opera de forma 100 % anónima sin cuenta. |
| **6** | Roles | Un orientador no puede acceder a estadísticas del directivo, y viceversa | **✓** | **✗** | **Discrepancia con el código:** Contradice `PT-028` y `PT-030`. En `core/permissions.py`, las clases `IsDirectivo`, `EsOrientador` y `EsDirectivoOOrientador` permiten ambos roles por igual (permisos unificados). |
| **7** | Roles | Un usuario no autenticado no puede cambiar el estado de un reporte | **✓** | **✓** | **Confirmado:** `ActualizarEstadoReporteView` exige token JWT válido y permiso de personal autorizado (`401 Unauthorized` sin sesión). |
| **8** | Anonimato | El formulario de reporte NO solicita nombre, correo ni identificación | **✓** | **✓** | **Confirmado:** Ningún dato personal es obligatorio; solo existe la casilla opcional de revelación voluntaria en casos graves (`acepta_revelar_identidad`). |
| **9** | Anonimato | No se guarda la IP ni el dispositivo del estudiante junto con el reporte | **✓** | **✓** | **Confirmado:** La tabla `reportes` en Oracle Cloud carece de esas columnas y `ReporteRepositoryProxy` bloquea cualquier campo fuera de `ALLOWED_FIELDS`. |
| **10** | Anonimato | Las contraseñas de orientadores/directivos no se muestran en pantallas ni API | **✓** | **✓** | **Confirmado:** El campo `password` es `write_only=True` en todos los serializadores y los inputs usan `type="password"`. |
| **11** | Anonimato | Los datos sensibles solo son visibles para roles autorizados | **✓** | **✗ (Parcial)** | **Discrepancia (`H-01`, `H-02`):** `ConsultarReporteView` retorna `ReporteLecturaSerializer` con descripción y contacto (`H-02`), y `ListarReportesView` no fuerza `request.user.institution_id` (`H-01`). |
| **12** | Validación | Los campos obligatorios del formulario están validados antes de enviar | **✓** | **✓** | **Confirmado:** Validaciones activas tanto en cliente React (`Reporte.jsx`) como en servidor (`CrearReporteSerializer`). |
| **13** | Validación | El sistema rechaza o sanea datos con formato incorrecto (ej. scripts/XSS) | **✓** | **Parcial** | **Parcial:** React escapa el renderizado JSX contra XSS y el ORM previene inyección SQL, pero el backend no aplica sanitización HTML explícita sobre `descripcion`. |
| **14** | Errores | Los mensajes de error no exponen información técnica (rutas, stack trace) | **✗** | **✓** | **Ya implementado en código:** En `core/exceptions.py`, `safevoice_exception_handler` intercepta errores `500` y devuelve un JSON genérico sin exponer rutas ni *stack trace*. |
| **15** | Errores | Mensajes claros sin revelar si el usuario o la contraseña fue la incorrecta | **✓** | **✓** | **Confirmado en código:** En `apps/users/tokens.py`, `CustomTokenObtainPairSerializer` retorna siempre *"Correo electrónico o contraseña incorrectos."* (la falla en `PT-027` era de una versión previa). |
| **16** | Sistema | Existe una opción de cerrar sesión (logout) para orientador y directivo | **✓** | **✓** | **Confirmado:** Botón y cierre de sesión implementados en `MenuDocente.jsx` y `BandejaReportes.jsx`. |
| **17** | Sistema | La sesión expira sola tras un tiempo de inactividad | **✗** | **✗** | **Confirmado (`H-07`):** El access token expira a los 60 minutos, pero no existe un temporizador de inactividad en React que limpie `localStorage`. |
| **18** | Sistema | No es posible ejecutar acciones manipulando la URL sin permisos adecuados | **✗** | **Parcial** | **Parcial (`H-07`):** La API bloquea mutaciones sin token, pero en el frontend se puede navegar por URL a `/docente/menu` o `/docente/dashboard` sin sesión activa. |

### 7.2. Hallazgos abiertos de la revisión de código (`H-01` a `H-07`)
Como valor agregado de esta auditoría técnica, se documentan los 7 hallazgos detectados directamente en el código fuente junto con su severidad y la corrección exacta a implementar:

| ID | Severidad | Descripción técnica del hallazgo en el código | Corrección técnica propuesta |
| :---: | :---: | :--- | :--- |
| **H-01** | **Alta** | En `ListarReportesView` (`backend/apps/reports/views.py`), el filtro `institucion_id` se toma de `request.query_params.get("institucion_id")`. Si no se envía en la URL o se manipula, devuelve reportes de todas las instituciones. | Ignorar el parámetro de la URL y forzar siempre `filtros["institucion_id"] = request.user.institution_id`, denegando el acceso si el usuario no tiene institución asignada. Añadir test negativo entre dos colegios. |
| **H-02** | **Alta** | `ConsultarReporteView` (`GET /api/v1/reports/consultar/?codigo=<uuid>`) serializa la respuesta con `ReporteLecturaSerializer`, exponiendo la descripción desencriptada y los datos de contacto de la víctima a quien posea el código. | Crear un `ReporteConsultaPublicaSerializer` minimalista que exponga únicamente `codigo_seguimiento`, `estado`, `fecha_creacion` y `fecha_actualizacion`. |
| **H-03** | **Media** | En `ReporteRepositoryProxy`, `ENCRYPTED_FIELDS` solo incluye `{"descripcion"}`. Cuando el estudiante acepta revelar su identidad, `nombre_contacto_victima` y `medio_contacto_victima` se guardan en texto plano. | Ampliar `ENCRYPTED_FIELDS = frozenset({"descripcion", "nombre_contacto_victima", "medio_contacto_victima"})` en `repository.py`. |
| **H-04** | **Alta** | En `ReporteService._validar_acceso_orientador()`, la condición valida `if reporte_inst_id and usuario_inst_id and reporte_inst_id != usuario_inst_id:`. Si alguno de los dos es `None`, la validación se salta y permite continuar. | Cambiar la guarda para exigir que ambos existan y sean idénticos: `if not reporte_inst_id or not usuario_inst_id or reporte_inst_id != usuario_inst_id: raise InstitucionNoCoincideError()`. |
| **H-05** | **Media** | `AnonymizeRequestMiddleware` (`core/middleware.py`) sobrescribe `REMOTE_ADDR` con `"[ENMASCARADO]"` antes de que actúe el `ScopedRateThrottle` de DRF, ocasionando que todos los usuarios anónimos compartan la misma IP ficticia en el contador de límites de petición. | Conservar un hash salado efímero en memoria solo para el *throttling* o aplicar el enmascaramiento únicamente en el filtro de logging (`AnonymizeIPFilter`). |
| **H-06** | **Baja** | Se encuentran versionados en Git archivos binarios o de entorno local como `backend/db.sqlite3`, `model/clasificador_riesgo.joblib` y scripts de siembra en la raíz (`run_seed.py`, `reseed_cloud.py`, `seed_upb.sql`). | Incluirlos en `.gitignore`, retirar `test_sprint2.py` de la raíz del backend y verificar que no existan secretos en el historial. |
| **H-07** | **Media** | En `frontend/src/routes/AppRouter.jsx` las rutas `/docente/menu`, `/docente/dashboard` y `/docente/reportes` son públicas en el cliente y carecen de expiración por inactividad. | Implementar el componente envolvente `<ProtectedRoute>` que verifique la vigencia del JWT en `localStorage` y agregar un *hook* de cierre automático tras 15 minutos de inactividad. |

---

## 8. Artefacto Nuevo 3: Matriz de roles y perfiles

### 8.1. Roles de usuario dentro de la plataforma
> **Nota de nomenclatura:** En la hoja de pruebas se emplearon los términos *Docente* y *Administrador*, mientras que en el código fuente y en el Avance 1 se utilizan **`ORIENTADOR`** y **`DIRECTIVO`**. Se adopta oficialmente esta segunda nomenclatura indicando su equivalencia.

| Rol en SafeVoice | Perfil del actor | Responsabilidades y expectativas en el proceso | Permisos de acceso en la aplicación |
| :--- | :--- | :--- | :--- |
| **Estudiante (Denunciante)** | Miembro de la comunidad estudiantil (víctima o testigo) que requiere reportar un caso o buscar apoyo. | Diligenciar reportes de bullying o ciberbullying de forma 100 % anónima (o revelando contacto voluntariamente en casos críticos), conservar su código UUID y consultar recursos de ayuda. | **Acceso público (sin login):** formulario `/reporte`, sección `/informacion`, directorio `/contactos` y `/lineas-ayuda`, y consulta de estado por código UUID. |
| **Orientador (Docente)** | Profesional institucional encargado de la atención psicosocial directa y seguimiento de casos. | Revisar los reportes entrantes de su institución, analizar el nivel de riesgo asignado por IA, aplicar las sugerencias de la Ley 1620 y actualizar el estado de atención documentando el historial. | **Acceso con Login JWT:** bandeja de reportes exclusiva de su institución, lectura de detalle, visualización de nivel de riesgo IA y recomendaciones, y cambio de estado con notas. |
| **Directivo (Administrador)** | Personal de liderazgo institucional (rectoría / coordinación) enfocado en gestión y toma de decisiones. | Registrar formalmente la institución en la plataforma, consultar paneles de estadísticas agregadas y analizar la concentración de incidentes por zona para orientar planes preventivos. | **Acceso con Login JWT:** registro de la institución, acceso al dashboard principal, visualización de estadísticas por periodo y consulta del mapa de calor por zonas. |

### 8.2. Matriz de permisos por funcionalidad vs. Estado real en el código

| Funcionalidad del sistema | Estudiante | Orientador | Directivo | Estado real verificado en el código al corte |
| :--- | :---: | :---: | :---: | :--- |
| Enviar reporte anónimo (`POST /api/v1/reports/`) | **Sí** | No aplica | No aplica | Público (`AllowAny`). |
| Consultar estado por código (`GET /consultar/`) | **Sí** | No aplica | No aplica | Público; requiere reducir campos devueltos (`H-02`). |
| Consultar información y recursos de ayuda | **Sí** | **Sí** | **Sí** | Público sin necesidad de sesión. |
| Iniciar sesión institucional (`POST /users/login/`) | No | **Sí** | **Sí** | Público con *rate limit* de 10 intentos/minuto (ver `H-05`). |
| Ver bandeja y detalle de reportes de su institución | No | **Sí** | *No en diseño* | Implementado para ambos roles (`EsDirectivoOOrientador`); corregir `H-01`. |
| Actualizar estado del reporte y ver historial | No | **Sí** | *No en diseño* | Implementado para ambos roles (`EsOrientador` en `core/permissions.py` incluye a `DIRECTIVO`). |
| Ver nivel de riesgo IA y sugerencias Ley 1620 | No | **Sí** | *No definido* | Implementado en backend y frontend para ambos roles (`EsDirectivoOOrientador`). |
| Consultar estadísticas y mapa de calor por zona | No | *No en diseño* | **Sí** | Implementado para ambos roles (`EsDirectivoOOrientador`), acotado a su institución. |
| Registrar institución (`POST /api/v1/institutions/`) | No | No | **Sí** | Endpoint con límite de 5/min; falta pantalla en frontend (`PT-032`). |
| Administrar catálogo de recursos de ayuda | No | No | **Sí (Admin)** | Endpoint en backend; falta interfaz administrativa (`PT-010`). |

* **Decisión arquitectónica pendiente para el cierre:** El diseño original (criterios `HU-09-CA03`, `HU-10-CA02`, matriz de roles y fila 6 del checklist) separa estrictamente las vistas del orientador (bandeja de casos individuales) y del directivo (estadísticas agregadas sin ver casos individuales), pero el código actual las unificó. Antes de la entrega final, el equipo definirá si restaura la restricción estricta por rol en vistas y menú o si formaliza un perfil unificado de Comité de Convivencia, re-ejecutando `PT-028` y `PT-030`.

### 8.3. Equipo de desarrollo y partes interesadas externas (Stakeholders)

| Actor / Grupo | Rol y responsabilidades dentro del proyecto SafeVoice |
| :--- | :--- |
| **Mariana Arbeláez** | **Líder de Frontend y UX:** Implementación de validaciones en cliente, diseño de la experiencia del formulario con textos de orientación, maquetación de vistas públicas/privadas y pruebas de usabilidad con usuarios. |
| **Daniel López** | **Líder de Frontend, IA y Analítica:** Diseño de interfaces del formulario, curaduría de datos, entrenamiento y validación del modelo híbrido de clasificación de riesgo (HU-12), catálogo de la Ley 1620 (HU-15) y métricas del mapa de calor. |
| **Esteban Álvarez** | **Líder de Backend, Infraestructura y Seguridad:** Desarrollo de endpoints de la API REST en Django, modelo relacional en SQL Server, cifrado Fernet, patrón Proxy de anonimización, filtros de logs y contenedorización Docker. |
| **Familias y acudientes** | Red de apoyo primario de los estudiantes; esperan contar con canales de orientación claros y garantías de que los datos de los menores están protegidos. |
| **Docente y evaluadores (UPB)** | Supervisores académicos del Proyecto Aplicado en TIC; evalúan la trazabilidad metodológica, la calidad de la ingeniería de software y la honestidad de las evidencias. |
| **ICBF, Salud y autoridades** | Entidades garantes de los derechos de los menores receptoras de las rutas de atención externa en Situaciones Tipo III (Ley 1620 de 2013). |
| **Proveedores tecnológicos** | Suministradores de infraestructura de contenedores, motor de base de datos y servicio de correo bajo acuerdos de disponibilidad y respaldo. |

---

## 9. Artefacto Nuevo 4: Verificación de experiencia de usuario (UX)

### 9.1. Método, alcance y limitaciones metodológicas
Se realizó una sesión preliminar de verificación de experiencia de usuario con **cinco participantes externos** al desarrollo: dos familiares mayores (`María Clara` y `Omar`), un familiar joven (`Nicolás`) y dos conocidos jóvenes (`Samuel` y `Juanita`). Cada participante interactuó libremente con el flujo público y docente de la plataforma, y sus observaciones se clasificaron por prioridad (`Alta`, `Media`, `Baja`) y estado.

* **Limitaciones metodológicas reconocidas:** En esta primera ronda no participaron estudiantes en edad escolar ni orientadores activos en colegios reales, y la hoja de registro no documentó tiempos por tarea ni guion estructurado. Por ello, estos hallazgos se asumen como una **evaluación heurística y de usabilidad temprana**, que se complementará en el piloto con usuarios finales.

### 9.2. Matriz de hallazgos y propuestas de mejora de UX

| Participante y perfil | Propuesta de mejora identificada | Prioridad | Estado en hoja UX | Relación técnica y estado en el repositorio |
| :--- | :--- | :---: | :---: | :--- |
| **María Clara** *(Familiar mayor)* | Agregar opciones de accesibilidad (tamaño de texto / lectura). | Media | Pendiente | Accesibilidad transversal en interfaz pública. |
| **María Clara** *(Familiar mayor)* | Cambiar de perfil más ágilmente mediante un botón visible. | Media | Pendiente | Navegación entre vista pública y portal docente. |
| **María Clara** *(Familiar mayor)* | Los recursos de emergencia del colegio aparecen vacíos. | **Alta** | Pendiente | Relacionado con `HU-03` y `PT-010`: falta poblar semillas de recursos en BD local y fallback en `ContactosRecursos.jsx`. |
| **Nicolás** *(Familiar joven)* | Colocar la opción **Otros** en la sección Ubicación del formulario de reporte. | **Alta** | Pendiente | Relacionado con `HU-01` y `HU-14`: agregar opción en `Reporte.jsx` y contemplar su agrupación en el mapa de calor. |
| **Nicolás** *(Familiar joven)* | Los enlaces a las páginas web de las líneas de ayuda no funcionan. | Media | Pendiente | Relacionado con `HU-03`: verificar URLs externas en los recursos de ayuda. |
| **Nicolás** *(Familiar joven)* | El botón para ir al portal docente solo está presente en la página principal. | Media | Pendiente | Navegación: incluir acceso institucional discreto en el `Header` de las demás páginas públicas. |
| **Nicolás** *(Familiar joven)* | Al iniciar sesión como docente se debería redirigir a la página principal docente, no directo a estadísticas. | **Alta** | Pendiente | Relacionado con `HU-09`/`HU-10`: **ya se avanzó en el código** creando `MenuDocente.jsx` (`/docente/menu`); falta validar y cerrar en la hoja. |
| **Omar** *(Familiar mayor)* | Incluir un selector de periodos/fechas en el dashboard principal. | Media | Pendiente | Relacionado con `HU-13` y `PT-039`: conectar selectores de `fecha_inicio` y `fecha_fin` en `Dashboard.jsx`. |
| **Omar** *(Familiar mayor)* | El botón del principio aparece muy pegado al borde. | **Alta** | Pendiente | Diseño visual: ajustar márgenes y espaciado (`padding`) en la sección principal de `Inicio.jsx`. |
| **Samuel** *(Conocido joven)* | Cuadros de texto desalineados en el formulario de reporte. | **Alta** | Pendiente | Relacionado con `HU-01`: alinear alturas de etiquetas en la cuadrícula de grados de `Reporte.jsx`. |
| **Samuel** *(Conocido joven)* | Mejorar el contraste en los cuadros de texto del formulario de reporte. | Media | Pendiente | Accesibilidad visual: oscurecer bordes y *placeholders* en el componente `Campo.jsx`. |
| **Samuel** *(Conocido joven)* | En la pantalla de bandeja de reportes desaparece la opción de protocolos. | Media | Pendiente | Relacionado con `HU-15`: mantener siempre visible el acceso a las recomendaciones de la Ley 1620 en el modal. |
| **Samuel** *(Conocido joven)* | Definir una fecha de caducidad o alerta de vencimiento según la prioridad del reporte. | Baja | Pendiente | Mejora funcional futura alineada con los plazos de la Ley 1620 (`< 2h`, `< 24h`, `< 48h`, `< 72h`). |
| **Juanita** *(Conocida joven)* | Verificar la seguridad del sistema ante ataques de denegación de servicio (DDoS). | Media | Pendiente | Corresponde a seguridad de infraestructura: se traslada como criterio al checklist de seguridad. |
| **Juanita** *(Conocida joven)* | Validar la seguridad al subir archivos adjuntos de evidencia. | Baja | Pendiente | Corresponde a seguridad de entrada (validar extensión, tipo MIME y tamaño máximo): pasa al checklist de seguridad. |

* **Síntesis del artefacto de UX:** Se consolidaron **15 propuestas** (5 de prioridad alta, 8 media y 2 baja). Dos de las propuestas de prioridad alta (*recursos vacíos* y *redirección tras el login*) convergen directamente con hallazgos del plan de pruebas (`PT-010`, `HU-09`), confirmando su carácter prioritario para el sprint de cierre.

---

## 10. Actualización de la matriz de gestión de riesgos

La valoración mantiene la escala de 1 a 5 para probabilidad ($P$) e impacto ($I$), donde $\text{Nivel} = P \times I$: **Bajo (1–4)**, **Medio (5–9)**, **Alto (10–16)** y **Crítico (17–25)**. En este Avance 2 se actualiza el estado de los riesgos del Avance 1 y se incorporan **tres riesgos técnicos nuevos (`R-10`, `R-11` y `R-12`)** surgidos de la auditoría de código y pruebas:

| ID | Riesgo identificado | P | I | Nivel | Estado y evolución al corte del Avance 2 | Responsable |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| **R-01** | Exposición de datos identificables que rompa el anonimato | 3 | 5 | **Alto (15)** | **Mitigado parcialmente:** El modelo no tiene FK a usuario y el Proxy filtra campos, pero falta cifrar los campos de contacto voluntario (`H-03`) y reducir la respuesta de consulta pública (`H-02`). | Esteban |
| **R-02** | Acceso institucional indebido o fuga entre instituciones | 3 | 5 | **Alto (15)** | **Materializado en revisión de código (`H-01` y `H-04`):** El listado de reportes no fuerza la institución del usuario autenticado. **Prioridad #1 de corrección inmediata.** | Esteban |
| **R-03** | Reportes incompletos, ambiguos o de baja calidad | 4 | 3 | **Alto (12)** | **Controlado:** Formulario guiado con validaciones en cliente y servidor; se atenderán las mejoras visuales de UX (`Samuel` y `Nicolás`). | Mariana |
| **R-04** | Clasificación automática de IA con falsas prioridades | 3 | 5 | **Alto (15)** | **Mitigado:** Se implementó la regla determinista de emergencia sobre el ensamble ML (`accuracy = 0.900`, `F1-Macro = 0.899`) y las 25 pruebas de `test_ml_service.py` están aprobadas al 100 %. | Daniel |
| **R-05** | Retraso del alcance por dependencias de IA, estadísticas y mapa | 2 | 4 | **Medio (8)** | **Reducido (bajó de 16 a 8):** Los módulos `HU-12` a `HU-15` ya están construidos en el repositorio; resta únicamente conectar el mapa en vivo y completar pruebas. | Equipo |
| **R-06** | Falta de adopción o desconfianza del canal | 3 | 4 | **Alto (12)** | **En seguimiento:** Se ejecutó la primera verificación de UX con 5 participantes y se corrigió el flujo hacia el menú docente. | Mariana |
| **R-07** | Interrupción, pérdida o indisponibilidad del servicio | 2 | 4 | **Medio (8)** | **Controlado en desarrollo:** Entorno estandarizado en Docker con SQL Server 2022 en Oracle Cloud; falta documentar procedimiento de respaldo para la demo final. | Esteban |
| **R-08** | Incumplimiento de requisitos legales y protección de menores | 2 | 5 | **Alto (10)** | **Mitigado en diseño legal:** Se incorporaron formalmente los protocolos de la Ley 1620 de 2013 y Decreto 1965 en `HU-15`. | Equipo |
| **R-09** | Indicadores o mapa de calor inducen interpretaciones erróneas | 3 | 3 | **Medio (9)** | **En control:** Las agregaciones operan por zona de la sede con intensidad normalizada 0 a 1; falta conectar `Dashboard.jsx` al endpoint en vivo (`PT-041`). | Daniel |
| **R-10** *(Nuevo)* | Límite de peticiones (*rate limit*) compartido entre usuarios por IP enmascarada | 3 | 4 | **Alto (12)** | **Abierto (`H-05`):** Como el middleware reemplaza la IP antes del *throttling* de DRF, un solo atacante bloquearía el login para todos los demás usuarios. | Esteban |
| **R-11** *(Nuevo)* | Incompatibilidad de versión de `scikit-learn` al cargar el modelo `.joblib` | 1 | 3 | **Bajo (3)** | **Mitigado y cerrado:** Se re-entrenó y sincronizó el artefacto `clasificador_riesgo.joblib` con el entorno del backend; las **100 de 100 pruebas en `pytest` pasan en verde**. Resta fijar versión exacta (`==`) en `requirements/base.txt`. | Daniel |
| **R-12** *(Nuevo)* | Datos de contacto voluntario de la víctima almacenados sin cifrar en BD | 3 | 5 | **Alto (15)** | **Abierto (`H-03`):** Aunque la descripción se cifra con Fernet (`gAAAA...`), el nombre y teléfono/correo opcionales quedan en texto plano. | Esteban |

---

## 11. Plan de cierre priorizado hacia la entrega final

Para llegar a la sustentación y entrega final con la totalidad de hallazgos cerrados, el equipo estableció el siguiente plan de trabajo en 10 puntos ordenados por criticidad:

| Prioridad | Acción técnica o metodológica concreta | Responsable propuesto | Criterio verificable de cierre (DoD) |
| :---: | :--- | :---: | :--- |
| **1** | Corregir el aislamiento multi-institución en el listado y en las guardas de acceso (`H-01` y `H-04`). | Esteban | Test automático negativo entre dos colegios en verde y prueba manual `PT-019` re-verificada. |
| **2** | Reducir los campos expuestos en la consulta pública por código y cifrar con Fernet los datos de contacto voluntario (`H-02` y `H-03`). | Esteban | `GET /consultar/` devuelve solo estado y fechas; columnas de contacto cifradas en SQL Server. |
| **3** | Tomar decisión definitiva sobre separación o unificación de roles (`Orientador` vs. `Directivo`) y alinear permisos o criterios. | Equipo | Pruebas `PT-028` y `PT-030` en estado `OK`; matriz de roles y fila 6 del checklist consistentes. |
| **4** | Implementar `<ProtectedRoute>` en React Router y temporizador de expiración de sesión por inactividad (`H-07`). | Mariana y Esteban | Filas 2, 17 y 18 del checklist de seguridad marcadas en **✓**. |
| **5** | Ajustar el orden del enmascaramiento de IP frente al *rate limiting* y re-ejecutar `PT-027` (`H-05`, `PT-027`). | Esteban | Prueba de límite de intentos independiente por cliente y `PT-027` actualizada a `OK` en la hoja de pruebas. |
| **6** | Congelar la versión exacta de `scikit-learn` en `requirements/base.txt` para preservar el **100/100 de aprobación** ya alcanzado en `pytest` (`R-11`). | Daniel | Versión fijada en `requirements/base.txt` y **100 de 100 pruebas automáticas aprobadas** en CI/local. |
| **7** | Implementar las 5 mejoras de UX de prioridad alta (opción *Otros* en ubicación, semillas de recursos, alineación de inputs y márgenes) y conectar el mapa en vivo (`PT-041`). | Mariana y Daniel | Las 5 filas de prioridad alta en estado *Terminado* en la hoja de UX y `PT-010` / `PT-041` en `OK`. |
| **8** | Re-ejecutar el plan de pruebas manual completo registrando versión/fecha, ejecutar las 8 pruebas pendientes y añadir los casos manuales de `HU-15`. | Equipo | Las 43 pruebas actuales + las de `HU-15` con resultado definitivo y observaciones de la sección 6.5 subsanadas. |
| **9** | Saneamiento del repositorio Git (`H-06`: retirar `db.sqlite3`, `.joblib` y `test_sprint2.py` del rastreo y actualizar `.gitignore`). | Esteban | Árbol de Git limpio de binarios locales y recolección de `pytest` directa sin errores. |
| **10** | Verificar las 14 capturas de evidencia (Figuras 12 a 25) y ensayar la presentación del día. | Equipo | Documento acumulativo con todas las figuras insertadas y presentación lista para sustentación. |

---

## 12. Estructura y guión de la presentación del día (Sustentación Avance 2)

A continuación se presenta el diseño de diapositivas y el guión de exposición preparado por el equipo para acompañar este documento:

| # Slide | Título de la diapositiva | Contenido visual y puntos clave | Orador asignado |
| :---: | :--- | :--- | :---: |
| **1** | **Portada institucional** | Título del proyecto, integrantes (Mariana, Daniel, Esteban), curso Proyecto Aplicado en TIC (2026-2) y fecha de corte. | Mariana |
| **2** | **Problemática y propuesta de valor** | El problema del silencio escolar (1 de cada 3 estudiantes sufre acoso según UNESCO); contraste visual *AS-IS vs. TO-BE*. | Mariana |
| **3** | **Síntesis del Avance 1 y Arquitectura** | Diagrama en 4 capas (*Views $\rightarrow$ Serializers $\rightarrow$ Services $\rightarrow$ Repository Proxy*); anonimato estructural sin FK y cifrado Fernet en SQL Server / Oracle Cloud. | Esteban |
| **4** | **Avance 2: Clasificador híbrido de riesgo (HU-12)** | Arquitectura en 2 capas: regla determinista de emergencia + ensamble ML con TF-IDF; niveles `Bajo`, `Medio`, `Alto` y `Crítico`; exactitud `90.0 %` y mitigación `R-04`. | Daniel |
| **5** | **Avance 2: Protocolos Ley 1620 de 2013 (HU-15)** | Homologación con Situaciones Tipo I (`<72h`), Tipo I Reiterada (`<48h`), Tipo II (`<24h`) y Tipo III (`<2h`, remisión a Salud, ICBF Línea 141 y Policía). | Daniel |
| **6** | **Avance 2: Gestión de casos y auditoría (HU-07 / HU-08)** | Bandeja paginada, modal de detalle, máquina de estados finita y trazabilidad inmutable en `historial_cambios` (16 tests automáticos). | Esteban |
| **7** | **Avance 2: Dashboard y análisis por zona (HU-13 / HU-14)** | Consultas agregadas sin desencriptar datos sensibles; gráficos interactivos y plano arquitectónico por zonas de la sede. | Mariana |
| **8** | **Cambios del proyecto y autocrítica** | Transparencia sobre unificación de roles, evolución de estados, sustitución de mapas GPS por zonas del colegio y correcciones al Avance 1. | Esteban |
| **9** | **Nuevos artefactos de calidad y seguridad** | Balance sin maquillaje: Plan de pruebas (43 manuales: 24 OK, 11 Error, 8 Pendientes + **100/100 aprobadas en `pytest`**), Checklist de seguridad (auditoría de 18 criterios y hallazgos `H-01` a `H-07`), Matriz de roles y 15 mejoras de UX. | Mariana y Daniel |
| **10** | **Demo en vivo y Plan de cierre (10 pasos)** | Demostración funcional en vivo (reporte anónimo $\rightarrow$ clasificación IA $\rightarrow$ protocolo Ley 1620 $\rightarrow$ cambio de estado con historial $\rightarrow$ dashboard) y ruta hacia la entrega final. | Todo el equipo |

---

## 13. Entregables y anexos

1. **Presentación del día:** Se adjunta por separado a este documento (`SafeVoice_Avance2_Presentacion_Dia.docx` / diapositivas de sustentación).
2. **Repositorio oficial del proyecto:** [https://github.com/MariArbe/SafeVoice](https://github.com/MariArbe/SafeVoice) (rama `development`).
3. **Tablero Kanban de gestión (GitHub Projects):** [https://github.com/users/MariArbe/projects/1/views/1](https://github.com/users/MariArbe/projects/1/views/1).
4. **Libro de aseguramiento de calidad (`SafeVoice_Plan_de_Pruebas.xlsx`):** Hoja de cálculo en Google Sheets con cinco pestañas: *Criterios de aceptación*, *Plan de pruebas*, *Matriz de roles y perfiles*, *Checklist de seguridad* y *UX*.
5. **Evidencias gráficas del Avance 2:** Recuadros de las Figuras 12 a 25 en la sección 4.4 listos para la inserción de las capturas PNG.

* **Declaración de uso ético de Inteligencia Artificial:** Para la auditoría cruzada del repositorio, la estructuración de tablas y la consolidación redaccional de este documento se emplearon como herramientas de apoyo los modelos de lenguaje Claude (Anthropic, 2026) y Gemini (Google, 2026), bajo revisión y verificación de los autores.

---

## 14. Referencias

* Anthropic. (2026). *Claude (Sonnet 5)* [Modelo de lenguaje de gran tamaño]. https://claude.ai
* Congreso de la República de Colombia. (2013). *Ley 1620 de 2013, por la cual se crea el Sistema Nacional de Convivencia Escolar y Formación para el Ejercicio de los Derechos Humanos, la Educación para la Sexualidad y la Prevención y Mitigación de la Violencia Escolar*. Diario Oficial No. 48.733.
* Google. (2026). *Gemini* [Modelo de lenguaje de gran tamaño]. https://gemini.google.com
* International Organization for Standardization. (2019). *ISO 31000:2018 Risk management — Guidelines*. ISO.
* International Organization for Standardization. (2021). *ISO/IEC 25010:2021 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model*. ISO.
* Presidencia de la República de Colombia. (2013). *Decreto 1965 de 2013, por el cual se reglamenta la Ley 1620 de 2013*. Diario Oficial No. 48.910.
* Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide: The definitive guide to Scrum: The rules of the game*. Scrum.org.
* UNESCO. (2019). *Behind the numbers: Ending school violence and bullying*. UNESCO Publishing.
