# SafeVoice — Documentación del Proyecto

> Sistema inteligente para la detección, reporte y gestión del bullying escolar.

---

## 📑 Tabla de Contenidos

1. [Introducción a la problemática](#1-introducción-a-la-problemática)
2. [Nuestra solución](#2-nuestra-solución)
3. [Público objetivo](#3-público-objetivo)
4. [Proceso AS-IS vs. TO-BE](#4-proceso-as-is-vs-to-be)
5. [Alcance del proyecto](#5-alcance-del-proyecto)
6. [Impacto organizacional esperado](#6-impacto-organizacional-esperado)
7. [Equipo del proyecto](#equipo-del-proyecto)

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

- **Reporte anónimo** — Los estudiantes registran incidentes sin revelar su identidad, indicando tipo de agresión, lugar y descripción de los hechos.
- **Clasificación por IA** — Un módulo de inteligencia artificial clasifica automáticamente el tipo de agresión y determina el nivel de riesgo (bajo, medio, alto).
- **Notificaciones priorizadas** — Orientadores y directivos reciben alertas oportunas según la gravedad del caso.
- **Panel de estadísticas y mapas de calor** — Visualización de patrones de incidencia y zonas críticas del colegio para apoyar la toma de decisiones.

La solución busca **transformar el proceso institucional** de gestión del acoso escolar, pasando de una intervención tardía y sin seguimiento a una respuesta rápida, confidencial y basada en datos.

---

## 3. Público objetivo

El proyecto está dirigido a la comunidad educativa de instituciones de educación básica y media, públicas y privadas, en zonas urbanas de Medellín, en cuatro roles:

### 🧑‍🎓 Estudiantes
Usuarios principales de la plataforma, ya sea como víctimas o testigos de situaciones de acoso.

**Beneficios:**
- Registro anónimo y seguro de reportes.
- Reducción del miedo a represalias.
- Canal directo y confidencial de denuncia.

### 🧑‍🏫 Orientadores escolares
Responsables de gestionar y dar seguimiento a los reportes registrados en la plataforma.

**Beneficios:**
- Clasificación automática de casos por tipo y nivel de riesgo.
- Panel administrativo para priorizar y documentar el estado de cada incidente.
- Reducción del tiempo dedicado a tabulación manual.

### 👩‍🏫 Docentes
Usuarios de apoyo con acceso a los casos que les sean asignados por el orientador.

**Beneficios:**
- Visibilidad de situaciones relevantes en el aula.
- Posibilidad de aportar observaciones al seguimiento.

### 🏢 Directivos
Responsables de las decisiones y políticas institucionales de convivencia escolar.

**Beneficios:**
- Indicadores, estadísticas y mapas de calor sobre los reportes.
- Identificación de patrones y zonas de mayor incidencia.
- Base para fortalecer estrategias preventivas.

---

## 4. Proceso AS-IS vs. TO-BE

| Etapa | AS-IS (actual) | TO-BE (propuesto) |
|---|---|---|
| 1 | Ocurre el acoso | Ocurre el acoso |
| 2 | Miedo a denunciar | Acceso a la plataforma |
| 3 | Reporte informal (si es que sucede) | Reporte anónimo |
| 4 | Orientador informa | Clasificación por IA |
| 5 | Investigación manual | Guardado de reporte en base de datos |
| 6 | Directivo decide | Intervención oportuna |
| 7 | Caso cerrado (sin estadísticas ni seguimiento) | Panel de estadísticas → Prevención continua |

---

## 5. Alcance del proyecto

**Incluye:**
- Plataforma web responsive con interfaz segura para el registro anónimo de incidentes.
- Componente de inteligencia artificial para clasificar el tipo de agresión y su nivel de riesgo.
- Panel de control para directivos y orientadores con estadísticas y, si es posible, mapas de calor.

**No incluye:**
- Integración directa con los sistemas de gestión/administración propios de cada institución.
- Aplicaciones móviles nativas (App Store / Google Play Store).

---

## 6. Impacto organizacional esperado

| Dimensión | Impacto proyectado |
|---|---|
| **Tiempo y procesos** | Automatización del 100% del triaje inicial de denuncias; reducción del 60% en el tiempo de respuesta ante casos de riesgo alto. |
| **Personas** | Incremento de al menos 40% en la tasa de reporte de incidentes ocultos durante el primer semestre de implementación. |
| **Costos y recursos** | Reducción del 30% en las horas dedicadas a tabulación manual por parte del equipo de orientación y psicología. |

---

## Equipo del proyecto

| Integrante | Rol |
|---|---|
| Mariana Arbeláez | Líder del proyecto |
| Daniel López | Ingeniero de datos / IA (clasificación de reportes) |
| Esteban Álvarez | Desarrollador backend (lógica de negocio, base de datos, servicios) |

---
