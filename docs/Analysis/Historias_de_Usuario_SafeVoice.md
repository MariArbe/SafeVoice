# Historias de Usuario — SafeVoice

## 1. Reporte Anónimo y Prevención

**HU-01 — Reporte anónimo**
Como estudiante, quiero diligenciar y enviar un formulario de reporte de bullying o ciberbullying de forma anónima y confidencial, para informar la situación y recibir ayuda sin miedo a represalias.
Debe tener:
-Diseño de formulario de reporte
Requerimientos: Wireframe y UI del formulario (tipo de incidente, descripción, evidencia opcional, fecha aproximada); flujo sin campos de identificación personal; feedback visual de campos requeridos.
-Validación de campos en frontend
Requerimientos: Validaciones de longitud mínima/máxima, campos obligatorios, formato de archivos adjuntos (si aplica); mensajes de error claros antes de enviar al backend.
-Endpoint POST /reportes
Requerimientos: Recibir payload del formulario, sanitizar entradas, generar ID único del reporte, devolver código de confirmación; manejo de errores 400/500.
-Modelo de datos del reporte en BD
Requerimientos: Esquema con campos (id, tipo_incidente, descripción, fecha, estado, nivel_riesgo, institución_id, timestamp) sin campos de identidad del remitente.
-Encriptación de datos sensibles antes de guardar
Requerimientos: Definir qué campos se consideran sensibles; aplicar encriptación en reposo (ej. AES) antes de persistir; gestión segura de la llave de encriptación.

**HU-02 — Información sobre bullying**
Como estudiante, quiero acceder a información sobre qué es el bullying y cómo identificarlo, para saber cuándo estoy frente a una situación de acoso y qué hacer.
Debe tener:
-Diseño de sección informativa
Requerimientos: Layout de la página con secciones (definición, tipos, señales de alerta); iconografía y jerarquía visual clara para lectura rápida.

**HU-03 — Recursos de ayuda**
Como estudiante, quiero consultar contactos y recursos de ayuda, para saber a quién acudir cuando necesite apoyo.
Debe tener:
-Diseño de vista de contactos/recursos
Requerimientos: Lista de contactos (líneas de ayuda, correos, teléfonos) con categorías; diseño accesible y fácil de escanear visualmente.
-Endpoint GET /recursos
Requerimientos: Devolver lista de recursos activos desde BD; soporte de filtrado por categoría (opcional).
-CRUD de recursos para administración
Requerimientos: Endpoints POST/PUT/DELETE protegidos por rol directivo/orientador para mantener actualizados los recursos.

**HU-04 — Confirmación del reporte**
Como estudiante, quiero recibir una confirmación de que mi reporte fue enviado correctamente, para saber que la información fue recibida.
Debe tener:
-Diseño de pantalla/mensaje de confirmación
Requerimientos: Mensaje claro de éxito, mostrar código de seguimiento, instrucciones de qué hacer después.
-Generación de código o ticket de seguimiento anónimo
Requerimientos: Generar identificador único no vinculado a datos personales; almacenar relación código-reporte para consultas futuras.
-Endpoint de respuesta tras envío exitoso
Requerimientos: Respuesta HTTP 201 con el código de seguimiento; manejo de casos de fallo en el guardado.

**HU-05 — Protección del anonimato**
Como estudiante, quiero que mi identidad se mantenga protegida al realizar un reporte, para sentirme seguro al comunicar una situación de bullying.
Debe tener:
-Estrategia de anonimización de IP/metadata
Requerimientos: Definir qué metadata de la petición HTTP se descarta o anonimiza antes de procesar el reporte.
-Revisión de que no se guarden logs identificables
Requerimientos: Auditar logs del servidor/proxy para confirmar que no persisten IP o headers identificables ligados a un reporte específico.
-Pruebas de trazabilidad
Requerimientos: Casos de prueba que verifiquen que, dado un reporte, no es posible reconstruir la identidad del estudiante desde la BD ni los logs.
-Patron proxy
Requerimientos: Implementar un patrón proxy o similar para desacoplar el cliente del servicio que persiste los reportes.

---

## 2. Gestión y Atención de Casos

**HU-06 — Recibir reportes**
Como orientador escolar, quiero recibir los reportes realizados por los estudiantes, para identificar y atender oportunamente los casos.
Debe tener:
-Endpoint GET /reportes (listado) para orientador
Requerimientos: Paginación, ordenar por fecha/riesgo, filtrar por institución del orientador autenticado.
-Notificación de nuevo reporte entrante
Requerimientos: Notificación in-app o por correo al orientador cuando llega un nuevo reporte (definir canal según alcance del proyecto).
-Diseño de bandeja de reportes
Requerimientos: Vista tipo bandeja/lista con indicadores visuales de estado y nivel de riesgo; acceso rápido al detalle.

**HU-07 — Consultar reportes**
Como orientador escolar, quiero consultar los reportes recibidos, para analizar la información de cada caso.
Debe tener:
-Endpoint GET /reportes/:id (detalle)
Requerimientos: Devolver toda la información del reporte (sin identidad del remitente) más historial de estado.
-Filtros de búsqueda (fecha, estado, nivel de riesgo)
Requerimientos: Query params combinables en el endpoint de listado; validación de rangos de fecha.
-Diseño de vista de detalle de caso
Requerimientos: Layout con toda la información del reporte, historial de estados y acciones disponibles (cambiar estado, agregar notas).

**HU-08 — Actualizar estado**
Como orientador escolar, quiero actualizar el estado de un reporte, para mantener actualizada la información sobre su proceso de atención.
Debe tener: 
-Endpoint PATCH /reportes/:id/estado
Requerimientos: Validar transición de estado permitida; registrar quién y cuándo hizo el cambio.
-Definición de estados posibles
Requerimientos: Documentar estados (nuevo, en proceso, atendido, cerrado) y transiciones válidas entre ellos.
-Historial de cambios de estado
Requerimientos: Tabla o campo de auditoría que registre cada cambio de estado con timestamp y usuario responsable.
-Diseño de selector de estado en UI
Requerimientos: Componente dropdown o stepper visual para cambiar el estado desde el detalle del caso.

---

## 3. Usuarios y Acceso

**HU-09 — Acceso del orientador**
Como orientador escolar, quiero iniciar sesión en la plataforma, para acceder de forma segura a los reportes de los estudiantes.
-Endpoint POST /auth/login
Requerimientos: Validar credenciales contra BD, retornar token; manejo de intentos fallidos.
-Manejo de sesión/token JWT
Requerimientos: Generación y verificación de JWT, tiempo de expiración, refresh token si aplica.
-Diseño de pantalla de login
Requerimientos: Formulario de usuario/contraseña, mensajes de error, opción de recuperar contraseña (si está en alcance).
-Validación de rol "orientador" en middleware
Requerimientos: Middleware que verifique el rol del token antes de permitir acceso a endpoints de reportes.

**HU-10 — Acceso del directivo**
Como directivo, quiero iniciar sesión en la plataforma, para acceder a las estadísticas y herramientas de análisis.
Debe tener:
-Reutilización de auth con validación de rol "directivo"
Requerimientos: Extender el middleware de roles para permitir acceso a endpoints de estadísticas/mapa de calor solo a directivos.
-Redirección según rol tras login

**HU-11 — Registro de institución**
Como directivo, quiero registrar la institución en SafeVoice, para habilitar el uso de la plataforma.
Debe tener:
-Endpoint POST /instituciones 
Requerimientos: Recibir datos de la institución (nombre, dirección, contacto), crear registro asociado al directivo.
-Diseño de formulario de registro institucional
Requerimientos: Formulario con los campos requeridos, validaciones visuales, confirmación de registro exitoso.
-Validación de datos institucionales
Requerimientos: Validar unicidad de institución, formato de datos de contacto, campos obligatorios

---

## 4. Inteligencia Artificial

**HU-12 — Clasificación de riesgo**
Como orientador escolar, quiero conocer el nivel de riesgo de cada reporte, para priorizar la atención de los casos según su gravedad.
Debe tener:
-Definición de niveles de riesgo
Requerimientos: Documentar criterios y ejemplos para cada nivel (bajo, medio, alto, crítico) que usará el modelo
-Entrenamiento o selección de modelo de clasificación de texto
Requerimientos: Dataset de entrenamiento/prueba (o uso de modelo preentrenado vía API), métricas de evaluación (precisión, recall).
-Servicio de inferencia sobre el reporte
Requerimientos: Endpoint o función que reciba el texto del reporte y devuelva el nivel de riesgo estimado.
-Visualización del nivel de riesgo en la bandeja de reportes
Requerimientos: Indicador visual (color/etiqueta) del nivel de riesgo en la lista y detalle de reportes.


**HU-15 — Sugerencias de intervención**
Como orientador escolar o docente, quiero que el sistema me proporcione recomendaciones automáticas de intervención al visualizar un reporte, para poder actuar de manera rápida y adecuada según el nivel de riesgo y el tipo de agresión identificados.

---

## 5. Visualización y Análisis

**HU-13 — Estadísticas**
Como directivo, quiero consultar las estadísticas de los reportes, para conocer la situación de bullying en la institución y tomar decisiones informadas.
Debe tener:
-Endpoint GET /estadisticas
Requerimientos: Agregaciones por fecha, tipo de incidente y nivel de riesgo; filtrable por rango de fechas e institución.
-Diseño de dashboard de estadísticas
Requerimientos: Layout con tarjetas resumen y gráficos; filtros de fecha visibles y usable
-Gráficos (barras, líneas, tendencias)
Requerimientos: Integración de librería de gráficos, conexión con datos del endpoint de estadísticas, diseño responsivo.

**HU-14 — Mapa de calor**
Como directivo, quiero consultar un mapa de calor de los casos reportados, para identificar las zonas más afectadas y tomar acciones pertinentes.
Debe tener:
-Geolocalización o agrupación por zona/sede de los reportes
Requerimientos: Definir cómo se asocia cada reporte a una zona (sede, salón, etc.) sin comprometer el anonimato del estudiante.
-Endpoint GET /mapa-calor
Requerimientos: Devolver datos agregados por zona con conteo de reportes para alimentar el mapa.
-Integración de librería de mapas
Requerimientos: Selección e integración de librería (ej. Leaflet), configuración de capas de calor.
-Diseño de visualización del mapa de calor
Requerimientos: Leyenda de intensidad, interacción al pasar el mouse/tocar zona, responsive

---

## Planificación por Sprints

### Sprint 1 — Diseño de arquitectura + Acceso y fundamentos
- HU-11 Registro de institución
- HU-09 Acceso del orientador
- HU-10 Acceso del directivo
- HU-02 Información sobre bullying
- HU-03 Recursos de ayuda

### Sprint 2 — Reporte anónimo y backend
- HU-01 Reporte anónimo
- HU-05 Protección del anonimato
- HU-06 Recibir reportes
- HU-04 Confirmación del reporte

### Sprint 3 — Modelo de IA
- HU-12 Clasificación de riesgo — versión definitiva

### Sprint 4 — Dashboard, estadísticas y mapa de calor
- HU-07 Consultar reportes
- HU-08 Actualizar estado
- HU-13 Estadísticas
- HU-14 Mapa de calor
- HU-15 Sugerencia de intervención

### Cierre
- Integración completa
- Testing
- Correcciones
- Deployment / demo
