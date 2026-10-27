# SafeVoice — Documentación del Proyecto

> Sistema inteligente para la detección, reporte y gestión integral del bullying escolar.

---

## 📑 Tabla de Contenidos

1. [Introducción a la problemática](#1-introducción-a-la-problemática)
2. [Nuestra solución](#2-nuestra-solución)
3. [Público objetivo](#3-público-objetivo)
4. [Proceso AS-IS vs. TO-BE](#4-proceso-as-is-vs-to-be)
5. [Alcance del proyecto](#5-alcance-del-proyecto)
6. [Impacto organizacional esperado](#6-impacto-organizacional-esperado)
7. [Mapa de Documentación Técnica](#7-mapa-de-documentación-técnica)
8. [Equipo del proyecto](#8-equipo-del-proyecto)

---

## 1. Introducción a la problemática

En las instituciones educativas, el proceso de identificación, reporte y atención de casos de **bullying y ciberbullying** presenta una baja tasa de denuncias. Según la UNESCO, uno de cada tres estudiantes ha sufrido acoso escolar, y muchos de estos casos nunca son reportados.

Actualmente, la gestión de estos casos se desarrolla a través de **mecanismos tradicionales**: informar directamente a un docente, acudir al orientador escolar o utilizar buzones físicos de sugerencias.

Aunque este sistema ha funcionado parcialmente, presenta varias **limitaciones estructurales**:

| Problema | Descripción |
|---|---|
| **Falta de anonimato** | Los estudiantes temen represalias al denunciar por medios que no garantizan confidencialidad estructurada. |
| **Investigación manual** | El orientador debe investigar cada caso sin herramientas de clasificación o priorización automática, ralentizando la respuesta institucional. |
| **Ausencia de datos** | No existen herramientas de análisis que permitan identificar patrones, reincidencias, zonas ni horarios de mayor incidencia. |

---

## 2. Nuestra solución

Como respuesta a la problemática identificada, se propone el desarrollo de una **plataforma web inteligente** orientada al reporte anónimo de casos de bullying y ciberbullying en instituciones educativas.

### ¿Qué ofrece la plataforma?

> En lugar de depender de reportes verbales, correos o buzones físicos, la solución concentra en un solo espacio digital seguro y anónimo el registro y la gestión de todos los casos.

- **Reporte anónimo y seguro** — Los estudiantes registran incidentes sin revelar su identidad (con descarte de IP y cifrado en reposo Fernet AES-128), indicando modalidades de agresión, ubicación múltiple y descripción de los hechos.
- **Clasificación por IA (Human-in-the-Loop)** — Un módulo híbrido de inteligencia artificial (TF-IDF + Soft Voting Ensemble: Random Forest, Regresión Logística y SGD) y reglas deterministas clasifica el nivel de riesgo (Bajo, Medio, Alto, Crítico) permitiendo la confirmación o rectificación docente.
- **Asistente Legal Ley 1620 y Ruta Externa** — Checklists interactivos paso a paso basados en el Decreto 1965/2013 y registro formal de remisión interinstitucional con Acta Oficial PDF.
- **Seguimiento Longitudinal y Prevención** — Semáforo de chequeo post-cierre a los 15, 30 y 60 días con reactivación automática por reincidencia.
- **Panel de estadísticas y mapas de calor** — Visualización de patrones de incidencia y puntos ciegos del colegio para apoyar la toma de decisiones preventivas.

La solución busca **transformar el proceso institucional** de gestión del acoso escolar, pasando de una intervención tardía y sin seguimiento a una respuesta rápida, confidencial y basada en datos.

---

## 3. Público objetivo

El proyecto está dirigido a la comunidad educativa de instituciones de educación básica y media, públicas y privadas, en cuatro roles:

### 🧑‍🎓 Estudiantes
Usuarios principales de la plataforma, ya sea como víctimas o testigos de situaciones de acoso.
* Registro anónimo y seguro de reportes.
* Reducción del miedo a represalias.
* Consulta pública de estado mediante ticket UUID sin revelar identidad.

### 🧑‍🏫 Orientadores escolares
Responsables de gestionar, clasificar y dar seguimiento a los reportes registrados.
* Clasificación automática de casos y protocolos sugeridos bajo Ley 1620.
* Asistente legal interactivo para garantizar el debido proceso (Tipo I, II y III).
* Bitácora inmutable de auditoría y notas psicosociales.

### 👩‍🏫 Docentes
Usuarios de aula encargados del acompañamiento directo y la observación preventiva.
* Aporte de notas pedagógicas y validación de tipos de agresión fácticos.
* Monitoreo en descansos y zonas focalizadas por el mapa de calor.

### 🏢 Directivos
Responsables de las decisiones, políticas institucionales y rendición de cuentas.
* Indicadores consolidados, mapas de calor y analítica de tendencias.
* Activación y firma de actas oficiales de remisión externa (ICBF, Policía, Fiscalía).
* Exportación de reportes estructurados compatibles con el aplicativo SIUCE del MEN.

---

## 4. Proceso AS-IS vs. TO-BE

| Etapa | AS-IS (actual) | TO-BE (SafeVoice) |
| :---: | :--- | :--- |
| **1** | Ocurre la agresión o acoso. | Ocurre la agresión o acoso. |
| **2** | Silencio y temor a represalias. | Acceso al formulario anónimo sin registro ni rastreo de IP. |
| **3** | Reporte verbal informal o buzón físico ignorado. | Radicación anónima digital con ticket UUID confidencial. |
| **4** | Evaluación subjetiva tardía. | Triaje instantáneo con IA (TF-IDF + Random Forest + Reglas Críticas). |
| **5** | Improvisación en el manejo del caso. | Asistente Legal interactivo según la Ley 1620 (Checklist Tipo I, II, III). |
| **6** | Desarticulación con entidades públicas. | Activación de Ruta Externa y generación de Acta Oficial PDF. |
| **7** | Cierre sin verificación (alto riesgo de venganza). | Semáforo longitudinal a los 15, 30 y 60 días con reactivación automática. |
| **8** | Ausencia total de estadísticas. | Tableros analíticos, mapa de calor y exportación para SIUCE / Excel. |

---

## 5. Alcance del proyecto

**Incluye:**
- Plataforma web responsiva con cifrado simétrico Fernet (AES-128) y descarte de IP.
- Pipeline de Machine Learning local para clasificación de riesgo (Bajo, Medio, Alto, Crítico) y reglas deterministas de seguridad inmediata.
- Módulo docente Human-in-the-Loop para confirmación/corrección de riesgo y tipos de agresión.
- Asistente normativo Ley 1620, activación de ruta externa y acta formal de remisión.
- Semáforo de seguimiento post-cierre (15, 30 y 60 días).
- Tablero analítico y mapa de calor interactivo por ubicaciones.
- Base de datos relacional Microsoft SQL Server en Oracle Cloud Infrastructure.

**No incluye:**
- Aplicaciones móviles nativas para tiendas cerradas (App Store / Play Store); opera como Web App responsiva accesible desde cualquier navegador.
- Sustitución de la potestad legal del Comité Escolar de Convivencia; el sistema actúa como herramienta de apoyo a la decisión, no como entidad juzgadora.

---

## 6. Impacto organizacional esperado

| Dimensión | Impacto proyectado |
|---|---|
| **Tiempo y procesos** | Automatización del 100% del triaje inicial; reducción de más del 60% en el tiempo de respuesta institucional ante casos de riesgo alto o crítico. |
| **Personas** | Incremento proyectado de al menos 40% en la denuncia de incidentes ocultos gracias a la garantía estructural de anonimato. |
| **Cumplimiento legal** | Blindaje jurídico institucional al garantizar el debido proceso estipulado en la Ley 1620 y el Decreto 1965 de 2013 mediante actas oficiales y bitácoras inmutables. |
| **Costos y recursos** | Reducción del 35% en las horas dedicadas a tabulación manual por parte del equipo psicosocial. |

---

## 7. Mapa de Documentación Técnica

La documentación del sistema se encuentra estructurada en las siguientes carpetas:

* **Análisis y Requisitos:**
  * [docs/Analysis/index.md](./Analysis/index.md): Especificación formal de Requisitos Funcionales (RF-001 a RF-015) y No Funcionales (RNF-001 a RNF-006).
  * [docs/Analysis/Historias_de_Usuario_SafeVoice.md](./Analysis/Historias_de_Usuario_SafeVoice.md): Catálogo de 20 Historias de Usuario organizadas en 5 Sprints.
  * [docs/Analysis/documentacion_formulario.md](./Analysis/documentacion_formulario.md): Diseño del formulario empático, multiubicación y contratos de API.
  * [docs/Analysis/criterios_clasificacion_riesgo.md](./Analysis/criterios_clasificacion_riesgo.md): Rúbrica de niveles de riesgo.
  * [docs/Analysis/protocolos_intervencion_ley1620.md](./Analysis/protocolos_intervencion_ley1620.md): Marco normativo colombiano y catálogo de intervención.
* **Diseño y Arquitectura:**
  * [docs/design/database.md](./design/database.md): Modelo Entidad-Relación (ERD), diccionario de datos y DDL en Microsoft SQL Server (T-SQL).
  * [docs/design/api_endpoints.md](./design/api_endpoints.md): Especificación detallada de todos los endpoints de la API REST.
  * [docs/design/arquitectura_y_seguridad.md](./design/arquitectura_y_seguridad.md): Arquitectura en 3 capas, patrón Proxy, cifrado Fernet AES-128 y seguridad.
* **Inteligencia Artificial:**
  * [docs/ai/modelo_ia_clasificacion.md](./ai/modelo_ia_clasificacion.md): Documentación técnica del pipeline NLP (TF-IDF + Ensamble de votación), reglas fail-safe y métricas (90.0% accuracy).

---

## 8. Equipo del proyecto

| Integrante | Rol |
|---|---|
| **Mariana Arbeláez** | Líder de Análisis y Especificación de Requisitos |
| **Daniel López** | Arquitectura Backend, Ingeniería de Datos, Modelo de IA e Infraestructura Cloud |
| **Esteban Álvarez** | Desarrollo Frontend, Componentes UI y Visualización |
