# Especificación de Requisitos del Sistema — SafeVoice

> **Proyecto:** SafeVoice – Plataforma Escolar de Convivencia, Reporte Anónimo y Asistencia Normativa (Ley 1620)  
> **Área:** Análisis de Requisitos y Modelado Funcional  

---

## 📚 Índice de Documentación Analítica del Proyecto

* [Historias_de_Usuario_SafeVoice.md](./Historias_de_Usuario_SafeVoice.md): Catálogo completo de historias de usuario (HU-01 a HU-20) organizadas por sprints y módulos funcionales.
* [documentacion_formulario.md](./documentacion_formulario.md): Especificación detallada de campos del formulario accesible, justificación pedagógica y estructura JSON.
* [criterios_clasificacion_riesgo.md](./criterios_clasificacion_riesgo.md): Rúbrica de clasificación de riesgo (Bajo, Medio, Alto, Crítico) y directrices para el modelo de IA.
* [protocolos_intervencion_ley1620.md](./protocolos_intervencion_ley1620.md): Marco normativo legal colombiano (Ley 1620 de 2013 y Decreto 1965 de 2013), protocolos y teléfonos de emergencia.

---

## 1. Requisitos Funcionales (RF)

### RF-001 — Autenticación y Control de Acceso Basado en Roles (RBAC)
* **Descripción:** El sistema debe permitir el inicio de sesión seguro a funcionarios escolares mediante credenciales (correo y contraseña), otorgando permisos diferenciados según el rol asignado (`DIRECTIVO` u `ORIENTADOR`).
* **Prioridad:** P0 (Crítica).
* **Criterios de Aceptación:**
  1. Validación mediante tokens criptográficos JWT.
  2. Los usuarios con rol `ORIENTADOR` tienen acceso a la bandeja de reportes, bitácora de seguimiento, asistente legal y actualización de estados de su colegio.
  3. Los usuarios con rol `DIRECTIVO` tienen acceso exclusivo a métricas globales, tableros analíticos, mapas de calor institucional y exportación para auditoría.
  4. Bloqueo temporal de la cuenta tras múltiples intentos fallidos continuos para mitigar ataques de fuerza bruta.

### RF-002 — Registro y Gestión de Instituciones Educativas
* **Descripción:** El sistema debe permitir el registro de colegios e instituciones educativas, fungiendo como la unidad de aislamiento lógico de los datos (*multi-tenancy*).
* **Prioridad:** P0 (Crítica).
* **Criterios de Aceptación:**
  1. Registro de nombre institucional, código DANE / NIT, ciudad y datos de contacto.
  2. Garantizar que ningún usuario u orientador pueda visualizar reportes pertenecientes a una institución diferente a la suya.

### RF-003 — Captura y Radicación Anónima de Reportes
* **Descripción:** El sistema debe proveer una interfaz pública y empática para que cualquier estudiante radique un reporte de acoso o violencia escolar sin necesidad de crear cuenta ni ingresar datos identificables.
* **Prioridad:** P0 (Crítica).
* **Criterios de Aceptación:**
  1. Captura de rol del reportante (víctima o testigo), grado escolar, temporalidad y modalidades de agresión (`FISICO`, `VERBAL`, `PSICOLOGICO_SOCIAL`, `CIBERBULLYING`, `MATERIAL`).
  2. Soporte de **selección múltiple de ubicaciones** (salones, pasillos, baños, descansos, salida, entorno virtual o exterior).
  3. Soporte opcional de subida segura de archivo de evidencia (máx. 5MB) despojado de metadatos identificables (`POST /api/v1/reports/evidencia/`).
  4. Casilla opcional de revelación voluntaria de identidad y contacto para casos extremos.

### RF-004 — Generación y Consulta de Ticket de Seguimiento Anónimo
* **Descripción:** Tras radicar el reporte, el sistema debe entregar un código único inmutable para que el estudiante consulte de forma segura el progreso de su atención.
* **Prioridad:** P0 (Crítica).
* **Criterios de Aceptación:**
  1. Generación de un UUID v4 no predecible y disociado de la identidad del remitente.
  2. Consulta pública (`GET /api/v1/reports/seguimiento/<uuid>/`) que muestra estado actual y notas formativas dirigidas a la víctima sin exponer información sensible de terceros.

### RF-005 — Clasificación Automatizada del Nivel de Riesgo (IA Híbrida)
* **Descripción:** El sistema debe evaluar automáticamente la narrativa del reporte mediante un modelo de Machine Learning combinado con reglas críticas deterministas para sugerir un nivel de riesgo objetivo (`BAJO`, `MEDIO`, `ALTO`, `CRITICO`).
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Procesamiento de lenguaje natural mediante pipeline entrenado TF-IDF + Random Forest.
  2. Reglas deterministas de seguridad inmediata: si la descripción contiene indicios de armas, homicidio, abuso sexual o ideación suicida, se asigna forzosamente el nivel `CRITICO` como mecanismo fail-safe.
  3. Tolerancia a fallos: ante indisponibilidad del modelo, el sistema asigna un nivel de respaldo seguro sin bloquear la radicación del reporte.

### RF-006 — Sugerencias de Intervención según Ley 1620
* **Descripción:** El sistema debe sugerir de manera instantánea el protocolo pedagógico aplicable al caso con base en el nivel de riesgo y las directrices del Decreto 1965 de 2013.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Asociación a Situaciones Tipo I (diálogo restaurativo), Tipo II (medidas cautelares y comité escolar) o Tipo III (emergencia y ruta externa).
  2. Visualización de plazos máximos legales de atención sugeridos y teléfonos de emergencia colombianos (141 ICBF, 106 Salud Mental, 123 Policía).
  3. Opción de copiar las recomendaciones sugeridas directamente a las notas de seguimiento con un clic.

### RF-007 — Bandeja de Gestión y Filtrado de Reportes
* **Descripción:** La plataforma debe proveer una bandeja de entrada para orientadores escolares donde se liste y priorice el universo de casos radicados en su colegio.
* **Prioridad:** P0 (Crítica).
* **Criterios de Aceptación:**
  1. Badges cromáticos según gravedad de riesgo y estado de ciclo de vida.
  2. Filtros combinados por estado (`nuevo`, `en_revision`, `en_seguimiento`, `cerrado`, `reabierto`), nivel de riesgo, grado escolar y rango de fechas.

### RF-008 — Actualización de Estado y Bitácora de Auditoría
* **Descripción:** Los orientadores deben poder registrar avances, notas pedagógicas y transiciones de estado del caso.
* **Prioridad:** P0 (Crítica).
* **Criterios de Aceptación:**
  1. Registro de notas de seguimiento y usuario orientador responsable.
  2. Persistencia estructurada en el campo `historial_cambios` (JSON) que almacena de forma inmutable la fecha, hora, usuario y notas de cada transición.

### RF-009 — Validación y Rectificación Docente de la Clasificación IA (Human-in-the-Loop)
* **Descripción:** Los orientadores deben tener la facultad de confirmar o corregir el nivel de riesgo y los tipos de agresión predichos por la IA cuando identifiquen discrepancias con la realidad pedagógica del caso.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Endpoint `PATCH /api/v1/reports/:id/clasificacion/` que permite actualizar `nivel_riesgo_confirmado` y `tipos_agresion`.
  2. Registro inmutable en el historial de cambios del autor docente, justificación y valor anterior.
  3. Prevalencia en toda la plataforma (tableros, filtros y protocolos) del nivel confirmado sobre el predicho.

### RF-010 — Asistente Legal Interactivo Ley 1620 (Checklist de Cumplimiento)
* **Descripción:** La plataforma debe ofrecer una lista de chequeo interactiva guiada que oriente paso a paso el cumplimiento del debido proceso exigido por el Decreto 1965/2013 según la tipificación del caso.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Checklists diferenciados para Situaciones Tipo I, II y III.
  2. Persistencia en tiempo real de los ítems completados (`PATCH /api/v1/reports/:id/protocolo/`).
  3. Indicador visual de porcentaje de avance legal en el expediente del caso.

### RF-011 — Activación de Ruta Externa y Generación de Acta Oficial PDF
* **Descripción:** El sistema debe registrar formalmente la remisión de casos graves a entidades externas del Estado y generar un acta oficial descargable.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Registro de entidad receptora (ICBF, Policía de Infancia, Fiscalía, Sector Salud), radicado oficial, funcionario y observaciones.
  2. Generación de un Acta Oficial de Remisión en formato imprimible/PDF con los datos técnicos del caso, tipificación bajo Ley 1620 y espacios para firmas institucionales.

### RF-012 — Semáforo de Seguimiento Post-Cierre y Reactivación por Reincidencia
* **Descripción:** El sistema debe habilitar un cronograma de verificación a los 15, 30 y 60 días tras el cierre de un caso para prevenir represalias contra la víctima.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Registro de evaluaciones periódicas (`POST /api/v1/reports/:id/chequeo-post-cierre/`).
  2. Si el orientador detecta que el hostigamiento o la violencia persisten, el sistema reabre automáticamente el reporte cambiando su estado a `reabierto`.

### RF-013 — Tablero de Métricas y Analítica de Convivencia Escolar
* **Descripción:** Proveer a los directivos un panel analítico interactivo para monitorear el clima escolar y la efectividad de las intervenciones.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Tarjetas de resumen: total de reportes, casos críticos, porcentaje de resolución y tiempo promedio de respuesta.
  2. Gráficos de tendencias temporales, distribución por tipo de agresión y desglose por niveles de riesgo.

### RF-014 — Mapa de Calor Institucional
* **Descripción:** Visualizar los puntos de la institución o entornos donde ocurren con mayor recurrencia los incidentes.
* **Prioridad:** P1 (Alta).
* **Criterios de Aceptación:**
  1. Visualización graduada por intensidad y criticidad de cada ubicación (baños, patios, pasillos, etc.).
  2. Alimentación dinámica a partir del campo multiubicación de los reportes.

### RF-015 — Exportación Consolidada de Datos para SIUCE y Excel/CSV
* **Descripción:** Permitir la descarga de reportes estructurados para rendición de cuentas ante el Sistema de Información Unificado de Convivencia Escolar (SIUCE) del Ministerio de Educación Nacional.
* **Prioridad:** P2 (Media).
* **Criterios de Aceptación:**
  1. Endpoint `GET /api/v1/reports/exportar/csv/` con soporte de filtrado por fechas y estado.
  2. Disociación y anonimización de datos personales en el archivo resultante para preservar la confidencialidad.

---

## 2. Requisitos No Funcionales (RNF)

| Código | Dimensión | Especificación y Criterio Técnico |
| :---: | :--- | :--- |
| **RNF-001** | **Confidencialidad y Anonimato** | La arquitectura debe implementar el **Patrón Proxy** (`ReporteRepositoryProxy`) para garantizar que la dirección IP de origen, el agente de usuario (User-Agent) y cualquier encabezado HTTP identificable se descarten antes de la persistencia. La tabla `reportes` no almacena claves foráneas hacia personas físicas ni registros de red. |
| **RNF-002** | **Cifrado en Reposo (Habeas Data)** | Todos los datos con potencial identificativo o de alta sensibilidad (`descripcion`, `nombre_contacto_victima`, `medio_contacto_victima`) deben almacenarse cifrados en el motor de persistencia mediante **Fernet (AES-128 en modo CBC)**, utilizando una clave simétrica robusta (`REPORTS_FERNET_KEY`) almacenada en variables de entorno. |
| **RNF-003** | **Seguridad en Tránsito y Autenticación** | Todas las comunicaciones deben viajar cifradas vía HTTPS/TLS 1.3. La autenticación de directivos y orientadores debe emitirse mediante tokens seguros **JWT (JSON Web Tokens)** con algoritmo HMAC-SHA256 y caducidad temporal controlada. |
| **RNF-004** | **Rendimiento y Disponibilidad** | El tiempo de respuesta de los endpoints de radicación de reportes y consulta de estadísticas debe ser inferior a 250 ms en condiciones normales de operación. La inferencia del modelo de IA se ejecuta en memoria y cuenta con salvaguardas que garantizan disponibilidad 24/7. |
| **RNF-005** | **Integridad y Trazabilidad** | Toda modificación de estado, confirmación de riesgo por parte del docente o activación de ruta externa debe quedar registrada de forma inmutable en el campo JSON de auditoría `historial_cambios`, identificando autor y marca de tiempo ISO-8601. |
| **RNF-006** | **Compatibilidad y Portabilidad** | El sistema debe ser totalmente operable en entornos en la nube (Ubuntu Linux en Oracle Cloud Infrastructure), gestionado por servicios `systemd`, con backend Django REST Framework y frontend moderno en React + Vite + Tailwind CSS. |
