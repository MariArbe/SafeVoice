# Documentación: Formulario de Reporte Anónimo (HU-01)

---

## 1. Justificación y Propósito
Este documento detalla la estructura del formulario de captura de datos para los reportes de acoso escolar. El objetivo de este diseño es doble:
1. **Accesibilidad y Empatía (Frontend):** Utilizar un lenguaje claro, respetuoso y cotidiano para estudiantes en colegios e instituciones educativas, facilitando la denuncia y eliminando el temor a represalias.
2. **Estructuración Analítica y Seguridad (Backend e IA):** Asegurar la recolección de variables categóricas estandarizadas y texto descriptivo rico en contexto para el modelo de Inteligencia Artificial (Clasificación de Riesgo), garantizando la total confidencialidad, el descarte de metadatos/IP y el cifrado en reposo con Fernet (AES-128).

---

## 2. Preguntas del Formulario (Vista del Estudiante)

### A. Institución Educativa (Selección / Buscador)
*Define a qué colegio se asignará el caso. Si se utiliza un enlace parametrizado institucional, este campo puede preseleccionarse automáticamente.*
**Pregunta:** ¿A cuál colegio o institución perteneces?
* [ Buscador / Desplegable con opciones de instituciones registradas ]

### B. Rol de Quien Reporta (Selección Única)
*Contexto crucial: Ayuda al orientador a entender la perspectiva del relato (un alto porcentaje de reportes provienen de observadores solidarios).*
**Pregunta:** ¿Esta situación te está pasando a ti o la estás presenciando en otra persona?
* [ ] Me está pasando a mí (Soy la víctima).
* [ ] Lo vi / le está pasando a un compañero(a) (Soy testigo / observador).

### C. Grado o Nivel Escolar (Selección Única / Lista)
*Focaliza la intervención de los orientadores en el grado o ciclo correspondiente.*
**Pregunta:** ¿En qué grado o curso está la persona afectada?
* [ Desplegable: 1° a 11°, Transición, etc. ]

### D. Ubicación del Incidente (Selección Múltiple)
*Identifica los puntos críticos del colegio o entornos digitales donde ocurren las agresiones, alimentando el Mapa de Calor institucional. Dado que el acoso suele extenderse a múltiples espacios, permite seleccionar varias opciones simultáneamente.*
**Pregunta:** ¿Dónde ocurrió o suele ocurrir la situación? (Puedes marcar varias opciones)
* [ ] Salón de clases.
* [ ] Pasillos o escaleras.
* [ ] Baños.
* [ ] Descanso / zonas deportivas.
* [ ] Salida del colegio.
* [ ] Internet / Redes sociales (WhatsApp, Instagram, TikTok, juegos online).
* [ ] Otro.

*(En el backend se consolida como una cadena separada por comas almacenada en `ubicacion` de hasta 500 caracteres).*

### E. Frecuencia del Incidente (Selección Única)
*Ayuda a determinar si se trata de un roce esporádico (Tipo I) o de un patrón continuado de hostigamiento sistemático (Tipo II / Tipo III).*
**Pregunta:** ¿Hace cuánto tiempo está pasando esto?
* [ ] Pasó hoy o es la primera vez.
* [ ] Lleva pasando algunas semanas.
* [ ] Lleva pasando varios meses.

### F. Tipos de Agresión (Selección Múltiple)
*Traduce situaciones cotidianas a las categorías técnicas del manual de convivencia escolar y la Ley 1620.*
**Pregunta:** ¿Qué fue lo que pasó? (Puedes marcar varias opciones)
* [ ] Me pegaron, me empujaron o me lastimaron físicamente. *(Mapeo interno: `FISICO`)*
* [ ] Me insultaron, me gritaron o me pusieron apodos ofensivos. *(Mapeo interno: `VERBAL`)*
* [ ] Inventaron chismes, me amenazaron o me dejaron por fuera del grupo a propósito. *(Mapeo interno: `PSICOLOGICO_SOCIAL`)*
* [ ] Me enviaron mensajes amenazantes, publicaron fotos mías sin permiso o me acosaron por internet. *(Mapeo interno: `CIBERBULLYING`)*
* [ ] Me quitaron, escondieron, rompieron o robaron mis cosas. *(Mapeo interno: `MATERIAL`)*

*(Nota: La redacción en la interfaz se ajusta con pronombres neutrales si el rol seleccionado en el paso B fue "Testigo").*

### G. Descripción Abierta (Campo de Texto - Insumo Principal IA)
*Texto libre procesado por el pipeline de Procesamiento de Lenguaje Natural (TF-IDF + Random Forest) y el detector determinista de emergencias críticas.*
**Pregunta:** Cuéntanos con tus propias palabras qué pasó:
*(Placeholder orientativo: "Escribe aquí lo que pasó sin necesidad de decir tu nombre. Por ejemplo: Ayer en el recreo me acorralaron y me dijeron que si no les daba mi almuerzo me iban a pegar...")*

### H. Evidencia Adjunta (Opcional - Subida Segura)
*Prueba visual o captura de pantalla, fundamental para evidenciar ciberacoso o daños materiales.*
**Pregunta:** Si tienes fotos o capturas de pantalla, puedes adjuntarlas aquí (Opcional, máx. 5MB):
* [ Botón selector de imagen / archivo JPG, PNG, WEBP ]

*(Flujo técnico: El archivo se envía inicialmente al endpoint seguro `POST /api/v1/reports/evidencia/`, el cual valida tipo MIME y tamaño, genera un nombre de archivo anonimizado sin metadatos EXIF/IP y retorna la URL que se asocia al reporte).*

### I. Garantía de Anonimato y Revelación Voluntaria Opcional
*Módulo de confianza y autodeterminación de la víctima.*
**Mensaje destacado:** *"Este reporte es 100% confidencial y anónimo. El sistema no guarda tu dirección IP ni datos de tu dispositivo. La información solo será usada por el orientador escolar para protegerte."*

**Casilla voluntaria para situaciones graves:**
* [ ] *"Por la gravedad del caso, acepto voluntariamente compartir mis datos de contacto con el orientador escolar para recibir acompañamiento directo."*

*(Si el estudiante marca la casilla voluntaria, se despliegan dinámicamente dos campos adicionales):*
* **Nombre de contacto:** [ _________________________ ]
* **Medio de contacto (Celular, WhatsApp o correo):** [ _________________________ ]

*(Ambos campos son cifrados en reposo en la base de datos mediante Fernet AES-128 para garantizar absoluta reserva).*

---

## 3. Estructura de Intercambio de Datos (API REST)

### Envío del Reporte: `POST /api/v1/reports/`

**Headers requeridos:**
```http
Content-Type: application/json
```

**Payload JSON de Envío (Frontend -> Backend):**
```json
{
  "institucion_id": 1,
  "rol_reportante": "victima",
  "grado_victima": "8°",
  "ubicacion": "Baños, Pasillos o escaleras, Salida del colegio",
  "frecuencia": "Lleva pasando algunas semanas",
  "involucrados_tipo": "grupo",
  "involucrados_grado": "mismo_grado",
  "tipos_agresion": [
    "FISICO",
    "VERBAL"
  ],
  "descripcion": "Ayer en el descanso me acorralaron en el baño y me dijeron que si no les daba mi dinero me iban a golpear a la salida, además me empujaron fuerte contra la pared.",
  "evidencia_url": "/media/evidencias/evidencia_a1b2c3d4.jpg",
  "acepta_revelar_identidad": true,
  "nombre_contacto_victima": "Juan Camilo Pérez",
  "medio_contacto_victima": "3101234567 / estudiante@colegio.edu.co"
}
```

**Respuesta Exitosa del Servidor (`201 Created`):**
```json
{
  "codigo_seguimiento": "b4e85741-94f7-494b-97e3-0c4beea3b715",
  "nivel_riesgo_predicho": "ALTO",
  "estado": "nuevo",
  "fecha_creacion": "2026-10-27T14:30:00Z",
  "mensaje": "Tu reporte ha sido radicado con éxito de manera segura."
}
```

---

## 4. Consulta Anónima de Estado: `GET /api/v1/reports/seguimiento/<codigo_seguimiento>/`

El estudiante puede ingresar a la plataforma pública en cualquier momento, digitar su código de seguimiento UUID v4 y consultar el avance de su caso sin revelar su identidad.

**Respuesta JSON (`200 OK`):**
```json
{
  "codigo_seguimiento": "b4e85741-94f7-494b-97e3-0c4beea3b715",
  "estado": "en_seguimiento",
  "fecha_creacion": "2026-10-27T14:30:00Z",
  "fecha_actualizacion": "2026-10-27T16:15:00Z",
  "mensaje_orientador": "El caso ya fue recibido por el equipo de orientación escolar y se han adoptado las primeras medidas preventivas de acompañamiento en el plantel."
}
```

---

## 5. Esquema de Persistencia Relacionado (SQL Server)

Para la especificación detallada de tablas, índices, llaves foráneas y scripts DDL en Microsoft SQL Server, consultar el documento oficial de arquitectura de datos en:
👉 [docs/design/database.md](file:///c:/Users/danie/.gemini/antigravity/scratch/SafeVoice/docs/design/database.md).
