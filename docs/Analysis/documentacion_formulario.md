# Documentación: Formulario de Reporte Anónimo (HU-01)

---

## 1. Justificación y Propósito
Este documento detalla la estructura del formulario de captura de datos para los reportes de acoso escolar. El objetivo de este diseño es doble:
1. **Accesibilidad y Empatía (Frontend):** Utilizar un lenguaje claro y cotidiano para estudiantes en instituciones educativas, facilitando la denuncia y reduciendo el miedo.
2. **Estructuración Analítica (Backend e IA):** Asegurar la recolección de variables categóricas limpias y texto rico en contexto para el entrenamiento e inferencia del modelo de Inteligencia Artificial (Clasificación de Riesgo), garantizando la total confidencialidad del remitente.

---

## 2. Preguntas del Formulario (Vista del Estudiante)

### A. Institución Educativa (Selección / Buscador)
*Define a qué colegio se asignará el caso. Si se usa un enlace personalizado (ej. safevoice.app/upb), este campo puede pre-llenarse de forma oculta.*
**Pregunta:** ¿A cuál colegio o institución perteneces?
* [ Buscador / Desplegable con opciones de instituciones registradas ]

### B. Rol de Quien Reporta (Selección Única)
*Contexto crucial: Ayuda al orientador a entender la perspectiva del relato (más del 60% de reportes anónimos son de testigos).*
**Pregunta:** ¿Esta situación te está pasando a ti o la estás presenciando en otra persona?
* [ ] Me está pasando a mí (Soy la víctima).
* [ ] Lo vi / le está pasando a un compañero(a) (Soy testigo / observador).

### C. Grado o Nivel Escolar (Selección Única / Lista)
*Focaliza la intervención de los orientadores en el grado o bloque correspondiente.*
**Pregunta:** ¿En qué grado o curso está la persona afectada?
* [ Desplegable: 6°, 7°, 8°, 9°, 10°, 11°, etc. ]

### D. Ubicación del Incidente (Selección Única)
*Define el lugar exacto para alimentar el modelo del mapa de calor de la institución.*
**Pregunta:** ¿Dónde ocurrió la situación?
* [ ] En el salón de clases.
* [ ] En los pasillos o escaleras.
* [ ] En los baños.
* [ ] En el descanso / zonas deportivas.
* [ ] A la salida del colegio.
* [ ] En internet (WhatsApp, redes sociales, juegos online).

### E. Frecuencia del Incidente (Selección Única)
*Ayuda a determinar si se trata de un caso aislado o un patrón continuo de acoso (crucial para el Nivel de Riesgo).*
**Pregunta:** ¿Hace cuánto tiempo está pasando esto?
* [ ] Pasó hoy o es la primera vez.
* [ ] Lleva pasando algunas semanas.
* [ ] Lleva pasando varios meses.

### F. Tipos de Agresión (Selección Múltiple)
*Traduce acciones cotidianas a clasificaciones técnicas de bullying.*
**Pregunta:** ¿Qué fue lo que pasó? (Puedes marcar varias opciones)
* [ ] Me pegaron, me empujaron o me lastimaron. *(Mapeo interno: Físico)*
* [ ] Me quitaron, escondieron o dañaron mis cosas. *(Mapeo interno: Físico/Material)*
* [ ] Me insultaron, me gritaron o me pusieron apodos ofensivos. *(Mapeo interno: Verbal)*
* [ ] Inventaron chismes, me amenazaron o me dejaron por fuera del grupo a propósito. *(Mapeo interno: Psicológico/Social)*
* [ ] Me enviaron mensajes amenazantes, publicaron fotos mías sin permiso o me acosaron por internet. *(Mapeo interno: Ciberbullying)*
*(Nota: El texto debe adaptarse ligeramente con pronombres neutrales si el rol seleccionado en la sección B fue "Testigo").*

### G. Descripción Abierta (Campo de Texto - Insumo Principal IA)
*Texto libre que se enviará al servicio de inferencia para el análisis de Procesamiento de Lenguaje Natural (NLP).*
**Pregunta:** Cuéntanos con tus propias palabras qué pasó:
*(Placeholder sugerido: "Escribe aquí lo que pasó sin decir tu nombre. Por ejemplo: Ayer en el recreo me acorralaron y me dijeron que...")*

### H. Evidencia Adjunta (Opcional)
*Prueba visual, especialmente útil para casos de ciberacoso.*
**Pregunta:** Si tienes fotos, capturas de pantalla o pruebas, puedes adjuntarlas aquí (Opcional):
* [ Botón de subida de archivo / imagen ]

### I. Garantía de Anonimato y Revelación Voluntaria (NUEVO)
*Mensaje estático en la interfaz, con la nueva opción para casos graves.*
**Nota de seguridad:** "Este reporte es 100% anónimo. Nadie sabrá quién eres, no guardaremos tus datos y la información solo se usará para protegerte."

**(Opcional) Casilla de Verificación:**
* [ ] "Por la gravedad del caso, acepto revelar mi identidad a la institución para recibir ayuda directa."

*(Si el estudiante marca la casilla, se despliegan condicionalmente estos dos campos):*
* **Nombre completo:** [ _________________________ ]
* **Medio de contacto (Correo o celular):** [ _________________________ ]

---

## 3. Estructura de Intercambio de Datos (JSON Payload)

Este es el formato estructurado que el Frontend enviará al endpoint `POST /reportes` del Backend:

```json
{
  "institucion_id": 1,
  "rol_reportante": "victima",
  "grado_victima": "8°",
  "ubicacion": "en los banos",
  "frecuencia": "lleva pasando algunas semanas",
  "tipos_agresion": [
    "fisico",
    "verbal"
  ],
  "descripcion_abierta": "Ayer en el descanso me acorralaron y me dijeron que si no les daba mi plata me iban a pegar a la salida, además me empujaron duro contra la pared.",
  "evidencia_url": "https://storage.safevoice.app/evidencias/img_8923.jpg",
  "acepta_revelar_identidad": true,
  "nombre_contacto_victima": "Juan Pérez",
  "medio_contacto_victima": "juan.perez@estudiante.upb.edu.co"
}
```

---

## 4. Esquema de Base de Datos (SQL Server / T-SQL)

Script para la creación de la tabla principal de reportes en Microsoft SQL Server. Cumple con los requisitos de la historia de usuario para no guardar información personal (IP, nombres, correos) y utiliza `NEWID()` para generar tickets de seguimiento anónimos.

```sql
CREATE TABLE reportes (
    -- Genera el código de seguimiento anónimo automáticamente
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Relación con la institución
    institucion_id INT NOT NULL, 
    
    -- Variables categóricas extraídas del formulario
    rol_reportante VARCHAR(50) NOT NULL,
    grado_victima VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    
    -- SQL Server no tiene tipo ARRAY nativo. Se recomienda almacenar el arreglo JSON como texto
    tipo_incidente VARCHAR(MAX) NOT NULL, 
    
    -- El texto libre que procesará el modelo de IA (VARCHAR(MAX) reemplaza al antiguo TEXT)
    descripcion VARCHAR(MAX),
    
    -- Evidencia adjunta (Opcional)
    evidencia_url VARCHAR(255),
    
    -- Manejo opcional de identidad para casos graves (HU actualizada)
    acepta_revelar_identidad BIT DEFAULT 0,
    nombre_contacto_victima VARCHAR(150),
    medio_contacto_victima VARCHAR(150),
    
    -- Clasificación predictiva asignada por el modelo de NLP
    nivel_riesgo VARCHAR(20), 
    
    -- Ciclo de vida del reporte (inicia como 'nuevo')
    estado VARCHAR(20) DEFAULT 'nuevo',
    
    -- Marca de tiempo de registro para métricas y gráficas
    fecha_registro DATETIME DEFAULT GETDATE()
);
```

