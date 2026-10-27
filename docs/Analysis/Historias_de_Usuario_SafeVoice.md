# Historias de Usuario — SafeVoice

## 1. Reporte Anónimo y Prevención

**HU-01 — Reporte anónimo**
Como estudiante, quiero diligenciar y enviar un formulario de reporte de bullying o ciberbullying de forma anónima y confidencial, para informar la situación y recibir ayuda sin miedo a represalias.
Debe tener:
- Diseño de formulario de reporte
  Requerimientos: Wireframe y UI del formulario accesible y empático; selección de rol (víctima/testigo), grado escolar, ubicación del incidente con soporte de selección múltiple (baños, pasillos, salón, internet, etc.), frecuencia, selección múltiple de tipos de agresión y descripción abierta; casilla voluntaria de revelación de identidad para casos graves; feedback visual de campos requeridos.
- Validación de campos en frontend
  Requerimientos: Validaciones de longitud mínima/máxima en descripción, campos obligatorios, validación de formatos y peso en adjuntos de evidencia; mensajes de error claros antes de enviar al backend.
- Endpoint POST /api/v1/reports/
  Requerimientos: Recibir payload del formulario, sanitizar entradas, generar ID único (UUID v4) del reporte, calcular nivel de riesgo automático con IA y devolver código de confirmación anónimo; manejo de errores 400/500.
- Subida anónima de evidencias (POST /api/v1/reports/evidencia/)
  Requerimientos: Soporte de subida multipart para imágenes o capturas de pantalla opcionales sin almacenar metadatos de usuario o remitente.
- Modelo de datos del reporte en BD (SQL Server)
  Requerimientos: Esquema con campos (`id`, `institucion_id`, `rol_reportante`, `grado_victima`, `ubicacion`, `frecuencia`, `descripcion`, `evidencia_url`, `nivel_riesgo`, `nivel_riesgo_confirmado`, `estado`, `historial_cambios`, `fecha_registro`).
- Encriptación de datos sensibles en reposo (Fernet / AES-128)
  Requerimientos: Cifrado en reposo para los campos sensibles (`descripcion`, `nombre_contacto_victima`, `medio_contacto_victima`) utilizando una clave simétrica robusta gestionada vía variables de entorno (`REPORTS_FERNET_KEY`).

**HU-02 — Información sobre bullying**
Como estudiante, quiero acceder a información sobre qué es el bullying y cómo identificarlo, para saber cuándo estoy frente a una situación de acoso y qué hacer.
Debe tener:
- Diseño de sección informativa
  Requerimientos: Layout de la página con secciones (definición, tipos, señales de alerta); iconografía y jerarquía visual clara para lectura rápida.

**HU-03 — Recursos de ayuda**
Como estudiante, quiero consultar contactos y recursos de ayuda, para saber a quién acudir cuando necesite apoyo.
Debe tener:
- Diseño de vista de contactos/recursos
  Requerimientos: Lista de contactos (líneas de ayuda nacionales como 141 ICBF, 106 Salud Mental, 123 Policía, correos institucionales) con categorías; diseño accesible y fácil de escanear visualmente.
- Endpoint GET /api/v1/users/recursos/
  Requerimientos: Devolver lista de recursos activos desde BD; soporte de filtrado por categoría.
- CRUD de recursos para administración
  Requerimientos: Endpoints protegidos por rol directivo/orientador para mantener actualizados los recursos institucionales.

**HU-04 — Confirmación del reporte**
Como estudiante, quiero recibir una confirmación de que mi reporte fue enviado correctamente, para saber que la información fue recibida.
Debe tener:
- Diseño de pantalla/mensaje de confirmación
  Requerimientos: Mensaje claro de éxito, mostrar código de seguimiento UUID, instrucciones de qué hacer después y opción de guardar/copiar el código.
- Generación de código o ticket de seguimiento anónimo
  Requerimientos: Generar identificador único no vinculado a datos personales; permitir la consulta futura del estado del caso mediante dicho código.
- Endpoint de respuesta tras envío exitoso
  Requerimientos: Respuesta HTTP 201 con el código de seguimiento; manejo de casos de fallo en el guardado.

**HU-05 — Protección del anonimato**
Como estudiante, quiero que mi identidad se mantenga protegida al realizar un reporte, para sentirme seguro al comunicar una situación de bullying.
Debe tener:
- Estrategia de anonimización de IP y metadata
  Requerimientos: Descartar encabezados HTTP sensibles (IP de origen, User-Agent, cookies de sesión) antes de persistir o auditar el reporte.
- Revisión de que no se guarden logs identificables
  Requerimientos: Auditar logs del servidor y proxy para confirmar que no persisten direcciones IP ligadas a un ID de reporte específico.
- Pruebas de trazabilidad y desvinculación
  Requerimientos: Casos de prueba automatizados que verifiquen que, dado un reporte, no es posible reconstruir la identidad del estudiante desde la BD ni los registros del sistema.
- Patrón de diseño Proxy en capa de persistencia (`ReporteRepositoryProxy`)
  Requerimientos: Implementar un proxy con lista blanca de campos admitidos (`ALLOWED_FIELDS`) para desacoplar el controlador del modelo de datos y aplicar de forma transparente la encriptación/desencriptación de campos protegidos.

---

## 2. Gestión y Atención de Casos

**HU-06 — Recibir reportes**
Como orientador escolar, quiero recibir los reportes realizados por los estudiantes, para identificar y atender oportunamente los casos.
Debe tener:
- Endpoint GET /api/v1/reports/ (listado) para orientador
  Requerimientos: Paginación, ordenar por fecha o urgencia de riesgo, filtrado automático por la institución educativa a la que pertenece el usuario autenticado.
- Alerta visual de nuevos reportes
  Requerimientos: Indicadores visuales en la barra de navegación y tarjetas de alerta para casos en estado `nuevo` o con nivel `critico`.
- Diseño de bandeja de reportes
  Requerimientos: Vista tipo bandeja/lista con badges cromáticos de estado y nivel de riesgo (bajo, medio, alto, crítico), grado, ubicación y acceso rápido al detalle.

**HU-07 — Consultar reportes**
Como orientador escolar, quiero consultar los reportes recibidos, para analizar la información de cada caso.
Debe tener:
- Endpoint GET /api/v1/reports/:id (detalle)
  Requerimientos: Devolver toda la información del reporte (desencriptando la descripción), lista de tipos de agresión, evidencia adjunta y bitácora completa de cambios.
- Filtros de búsqueda (fecha, estado, nivel de riesgo, grado)
  Requerimientos: Query params combinables en el endpoint de listado; validación de rangos de fecha y búsqueda por palabras clave.
- Diseño de vista de detalle de caso
  Requerimientos: Layout modal o vista dedicada con toda la información del caso, pestañas para Asistente Legal, Ruta Externa y Seguimiento Post-Cierre.

**HU-08 — Actualizar estado**
Como orientador escolar, quiero actualizar el estado de un reporte, para mantener actualizada la información sobre su proceso de atención.
Debe tener: 
- Endpoint PATCH /api/v1/reports/:id/estado/
  Requerimientos: Validar transiciones de estado permitidas (`nuevo` -> `en_proceso` -> `atendido` -> `cerrado` -> `reabierto`); registrar obligatoriamente nota de seguimiento y usuario responsable.
- Definición formal de estados y ciclo de vida
  Requerimientos: Documentar estados y reglas de negocio para transiciones válidas.
- Historial de cambios de estado (Auditoría JSON)
  Requerimientos: Campo `historial_cambios` estructurado que registre cada cambio con timestamp ISO, estado anterior, estado nuevo, usuario responsable y nota.
- Diseño de selector de estado en UI
  Requerimientos: Selector interactivo con confirmación modal y campo para redacción de nota de bitácora.

---

## 3. Usuarios y Acceso

**HU-09 — Acceso del orientador**
Como orientador escolar, quiero iniciar sesión en la plataforma, para acceder de forma segura a los reportes de los estudiantes.
Debe tener:
- Endpoint POST /api/v1/users/login/
  Requerimientos: Validar credenciales contra BD, retornar token JWT seguro; control de bloqueo temporal por intentos fallidos de autenticación (fuerza bruta).
- Manejo de sesión y tokens JWT
  Requerimientos: Generación y verificación de tokens con tiempo de expiración y almacenamiento seguro en cliente.
- Diseño de pantalla de login
  Requerimientos: Formulario responsivo con validaciones, visibilidad de contraseña y alertas de error claras.
- Validación de rol "orientador" en permisos
  Requerimientos: Permisos basados en roles que restringen el acceso a los reportes de la institución asignada.

**HU-10 — Acceso del directivo**
Como directivo, quiero iniciar sesión en la plataforma, para acceder a las estadísticas y herramientas de análisis institucional.
Debe tener:
- Reutilización de auth con validación de rol "directivo"
  Requerimientos: Control de permisos que permite a directivos ver tableros agregados, mapas de calor y exportación de datos sin invadir detalles clínicos confidenciales.
- Redirección según rol tras login
  Requerimientos: Envío directo al Dashboard de Métricas si el rol es directivo, o a la Bandeja de Casos si es orientador.

**HU-11 — Registro de institución**
Como directivo o administrador, quiero registrar la institución en SafeVoice, para habilitar el uso de la plataforma en la comunidad educativa.
Debe tener:
- Endpoint POST /api/v1/institutions/
  Requerimientos: Recibir datos de la institución (nombre, código DANE, dirección, municipio, departamento, contacto), crear registro asociado.
- Diseño de formulario de registro institucional
  Requerimientos: Formulario con campos requeridos, validación de formato y confirmación de alta.
- Validación de datos institucionales
  Requerimientos: Validar unicidad del nombre/código de institución y obligatoriedad de datos de contacto.

---

## 4. Inteligencia Artificial y Soporte Normativo

**HU-12 — Clasificación de riesgo con IA**
Como orientador escolar, quiero conocer el nivel de riesgo sugerido de cada reporte, para priorizar la atención de los casos según su gravedad objetiva.
Debe tener:
- Definición de niveles de riesgo (Bajo, Medio, Alto, Crítico)
  Requerimientos: Rúbrica con criterios pedagógicos y legales según Decreto 1965/2013.
- Pipeline de Machine Learning (TF-IDF + Random Forest)
  Requerimientos: Vectorización de texto con TF-IDF sobre el corpus en español, clasificador Random Forest optimizado serializado en formato `.pkl`.
- Sistema Híbrido con Reglas Críticas Deterministas
  Requerimientos: Inferencia en `ml_service.py` que combina la probabilidad estadística del modelo con palabras clave deterministas de alto riesgo (armas, muerte, violación, suicidio) para garantizar que situaciones extremas se clasifiquen inmediatamente como `critico`.
- Visualización del nivel de riesgo en la bandeja
  Requerimientos: Badges con código de color (Verde: Bajo, Amarillo: Medio, Naranja: Alto, Rojo: Crítico) con soporte de tooltip explicativo.

**HU-15 — Sugerencias de intervención (Ley 1620)**
Como orientador escolar o docente, quiero que el sistema me proporcione recomendaciones automáticas de intervención al visualizar un reporte, para poder actuar de manera rápida y adecuada según el nivel de riesgo y el tipo de agresión identificados.
Debe tener:
- Endpoint GET /api/v1/reports/:id/recomendaciones/
  Requerimientos: Devolver protocolos específicos clasificados por Situación Tipo I, II o III, plazos máximos legales de atención y teléfonos de emergencia aplicables.
- Pautas específicas por tipología de agresión
  Requerimientos: Generación de directrices pedagógicas contextuales (ciberacoso, violencia física, exclusión, daño material).
- Integración con la bitácora
  Requerimientos: Botón "Copiar a notas" en la interfaz para trasladar las acciones sugeridas directamente a las notas de seguimiento del caso con un clic.

**HU-16 — Validación y ajuste docente de clasificación IA (Human-in-the-Loop)**
Como orientador escolar o docente, quiero tener la potestad de confirmar o cambiar manualmente el nivel de riesgo y los tipos de agresión predichos por la IA, para que prevalezca el criterio profesional humano cuando la IA clasifique con imprecisión.
Debe tener:
- Endpoint PATCH /api/v1/reports/:id/clasificacion/
  Requerimientos: Permitir la actualización de `nivel_riesgo_confirmado` y la lista de `tipos_agresion` asociados al reporte.
- Auditoría de intervención humana
  Requerimientos: Registrar en `historial_cambios` el autor docente, fecha/hora, valor original de la IA, valor confirmado/rectificado por el docente y el motivo pedagógico del cambio.
- Indicador visual "Validado por Docente"
  Requerimientos: Distintivo en la interfaz para diferenciar si el riesgo mostrado corresponde a la predicción del modelo o a la validación oficial del orientador.

**HU-17 — Asistente Legal Interactivo Ley 1620 (Checklist de Cumplimiento)**
Como orientador escolar o miembro del Comité de Convivencia, quiero contar con un asistente interactivo con lista de chequeo basada en la Ley 1620 y Decreto 1965 de 2013, para garantizar el estricto cumplimiento del debido proceso según sea Tipo I, Tipo II o Tipo III.
Debe tener:
- Endpoint PATCH /api/v1/reports/:id/protocolo/
  Requerimientos: Persistir en el reporte el estado de cumplimiento (ítems completados y pendientes) del checklist legal correspondiente a la tipificación del caso.
- Checklist dinámico por tipo de situación
  Requerimientos:
  - *Tipo I:* Mediación dialógica, compromiso de no repetición, seguimiento pedagógico.
  - *Tipo II:* Medidas cautelares de protección, remisión a Comité de Convivencia, citación por separado a padres, plan de intervención.
  - *Tipo III:* Atención médica de urgencia, custodia segura, aviso a Rectoría, remisión externa obligatoria, sesión extraordinaria de Comité en 24h y reporte SIUCE en 48h.
- Barra de progreso de cumplimiento legal
  Requerimientos: Indicador visual de porcentaje de pasos completados en el expediente del caso.

**HU-18 — Activación de Ruta Externa y Generación de Acta Oficial**
Como directivo u orientador escolar, quiero registrar la activación de la ruta externa con entidades competentes del Estado y generar un acta oficial PDF formal, para blindar legalmente a la institución ante entes de control (Secretaría de Educación, ICBF, Fiscalía).
Debe tener:
- Endpoint POST /api/v1/reports/:id/ruta-externa/
  Requerimientos: Registrar entidad de remisión (ICBF, Policía de Infancia y Adolescencia, Fiscalía General, Sector Salud / EPS), número de radicado o folio oficial, funcionario receptor, fecha y observaciones.
- Generación y descarga de Acta Oficial de Remisión
  Requerimientos: Formato imprimible/PDF con datos anonimizados de la víctima (o con identidad si fue voluntariamente revelada), tipificación jurídica bajo Ley 1620, hechos constatados, firmas de rectoría y orientación, y constancia de entrega a la entidad externa.
- Marcador de Caso Remitido en Bandeja
  Requerimientos: Distintivo visual prioritario que identifique que el caso ya trascendió a la esfera de protección interinstitucional del Estado.

**HU-19 — Semáforo de Seguimiento Post-Cierre y Reactivación por Reincidencia**
Como orientador escolar, quiero programar y registrar evaluaciones periódicas de seguimiento a los 15, 30 y 60 días tras cerrar un caso, para prevenir represalias o reactivar el caso inmediatamente si el acoso persiste.
Debe tener:
- Endpoint POST /api/v1/reports/:id/chequeo-post-cierre/
  Requerimientos: Registrar hito de seguimiento (día 15, 30 o 60), estado de convivencia verificado (Favorable / Alerta / Crítico) y nota de evaluación.
- Reactivación automática por reincidencia
  Requerimientos: Si en un chequeo post-cierre se detecta persistencia o represalias, el sistema debe cambiar automáticamente el estado del reporte de `cerrado` a `reabierto`, alertando a la coordinación de convivencia.
- Semáforo visual en el detalle del caso
  Requerimientos: Indicadores cromáticos interactivos en el panel del orientador que muestran el estado de cumplimiento de los 3 hitos longitudinales post-cierre.

---

## 5. Visualización, Análisis y Cumplimiento Normativo

**HU-13 — Estadísticas de Convivencia Escolar**
Como directivo, quiero consultar las estadísticas de los reportes, para conocer la situación de bullying en la institución y tomar decisiones informadas.
Debe tener:
- Endpoint GET /api/v1/reports/statistics/
  Requerimientos: Agregaciones por fecha, tipo de incidente, nivel de riesgo y estado; filtrable por rango de fechas e institución.
- Diseño de dashboard de estadísticas
  Requerimientos: Layout con tarjetas resumen (total casos, críticos, atendidos, promedio de atención) y gráficos interactivos.
- Gráficos analíticos
  Requerimientos: Gráficos de barras, distribución circular y tendencias temporales responsivas.

**HU-14 — Mapa de calor institucional**
Como directivo, quiero consultar un mapa de calor de las zonas escolares reportadas, para identificar puntos ciegos y desplegar vigilancia preventiva.
Debe tener:
- Agrupación por zonas de riesgo
  Requerimientos: Agrupación de incidentes por ubicaciones frecuentes (baños, pasillos, descansos, salida, entorno digital).
- Endpoint GET /api/v1/reports/heatmap/
  Requerimientos: Devolver recuento ponderado por gravedad para alimentar la intensidad visual del mapa.
- Interfaz gráfica de calor
  Requerimientos: Vista visual intuitiva con gradiente cromático (verde, amarillo, naranja, rojo) y ranking de zonas críticas.

**HU-20 — Exportación de Datos para SIUCE y Formato Excel/CSV**
Como directivo u orientador escolar, quiero exportar la información consolidada de los reportes en formato CSV/Excel estructurado, para cumplir con las auditorías de las Secretarías de Educación y cargar la información al sistema SIUCE (Sistema de Información Unificado de Convivencia Escolar).
Debe tener:
- Endpoint GET /api/v1/reports/exportar/csv/
  Requerimientos: Generar archivo CSV plano descargable con codificación UTF-8, filtrable por rango de fechas y estado; exportar tipología de violencia, fechas, nivel de riesgo confirmado y estado de ruta de atención.
- Garantía de protección de datos en la exportación
  Requerimientos: Ocultar o disociar datos de contacto de víctimas anónimas para evitar filtración masiva fuera del aplicativo.

---

## Planificación por Sprints

### Sprint 1 — Diseño de arquitectura, acceso y fundamentos
- HU-11 Registro de institución
- HU-09 Acceso del orientador
- HU-10 Acceso del directivo
- HU-02 Información sobre bullying
- HU-03 Recursos de ayuda

### Sprint 2 — Reporte anónimo, seguridad y persistencia
- HU-01 Reporte anónimo (Formulario multizona y evidencias)
- HU-05 Protección del anonimato (Patrón Proxy y cifrado Fernet AES)
- HU-06 Recibir reportes
- HU-04 Confirmación del reporte y ticket de seguimiento

### Sprint 3 — Modelo de IA y clasificación de riesgo
- HU-12 Clasificación de riesgo (Pipeline TF-IDF + Random Forest + Reglas Críticas)
- HU-15 Sugerencias de intervención temprana

### Sprint 4 — Gestión de casos, estadísticas y mapa de calor
- HU-07 Consultar reportes y detalle confidencial
- HU-08 Actualizar estado y bitácora de seguimiento
- HU-13 Estadísticas institucionales
- HU-14 Mapa de calor de zonas de riesgo

### Sprint 5 — Fase Avanzada Ley 1620 y Human-in-the-Loop
- HU-16 Validación y ajuste docente de clasificación IA (Human-in-the-Loop)
- HU-17 Asistente Legal Interactivo Ley 1620 (Checklists Tipo I, II, III)
- HU-18 Activación de Ruta Externa y Generación de Acta Oficial de Remisión
- HU-19 Semáforo de Seguimiento Post-Cierre (15, 30 y 60 días) y reactivación automática
- HU-20 Exportación estructurada compatible con SIUCE (CSV/Excel)

### Cierre y Entrega
- Integración integral Frontend-Backend
- Suite de pruebas unitarias y de integración (128 tests passing)
- Despliegue en la nube (Oracle Cloud Ubuntu + Microsoft SQL Server)
- Puesta en producción y documentación técnica final
