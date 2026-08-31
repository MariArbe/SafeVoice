# Documentación: Formulario de Reporte Anónimo (HU-01)

**Proyecto:** SafeVoiceTIC  
**Módulo:** Interfaz de Estudiante y Estructura de Datos Inicial  
**Responsable:** Equipo de Desarrollo (IA, Backend, Frontend)

---

## 1. Justificación y Propósito
Este documento detalla la estructura del formulario de captura de datos para los reportes de acoso escolar. El objetivo de este diseño es doble:
1. **Accesibilidad y Empatía (Frontend):** Utilizar un lenguaje claro y cotidiano para estudiantes en instituciones educativas, facilitando la denuncia y reduciendo el miedo.
2. **Estructuración Analítica (Backend e IA):** Asegurar la recolección de variables categóricas limpias y texto rico en contexto para el entrenamiento e inferencia del modelo de Inteligencia Artificial (Clasificación de Riesgo), garantizando la total confidencialidad del remitente.

---

## 2. Preguntas del Formulario (Vista del Estudiante)

### A. Ubicación del Incidente (Selección Única)
*Define el lugar exacto para alimentar el modelo del mapa de calor de la institución.*
**Pregunta:** ¿Dónde ocurrió la situación?
* [ ] En el salón de clases.
* [ ] En los pasillos o escaleras.
* [ ] En los baños.
* [ ] En el descanso / zonas deportivas.
* [ ] A la salida del colegio.
* [ ] En internet (WhatsApp, redes sociales, juegos online).

### B. Frecuencia del Incidente (Selección Única)
*Ayuda a determinar si se trata de un caso aislado o un patrón continuo de acoso (crucial para el Nivel de Riesgo).*
**Pregunta:** ¿Hace cuánto tiempo está pasando esto?
* [ ] Pasó hoy o es la primera vez.
* [ ] Lleva pasando algunas semanas.
* [ ] Lleva pasando varios meses.

### C. Tipos de Agresión (Selección Múltiple)
*Traduce acciones cotidianas a clasificaciones técnicas de bullying.*
**Pregunta:** ¿Qué fue lo que pasó? (Puedes marcar varias opciones)
* [ ] Me pegaron, me empujaron o me lastimaron. *(Mapeo interno: FISICO)*
* [ ] Me quitaron, escondieron o dañaron mis cosas. *(Mapeo interno: MATERIAL)*
* [ ] Me insultaron, me gritaron o me pusieron apodos ofensivos. *(Mapeo interno: VERBAL)*
* [ ] Inventaron chismes, me amenazaron o me dejaron por fuera del grupo a propósito. *(Mapeo interno: PSICOLOGICO)*
* [ ] Me enviaron mensajes amenazantes, publicaron fotos mías sin permiso o me acosaron por internet. *(Mapeo interno: CIBERBULLYING)*

### D. Involucrados (Selección Única - Opcional)
*Permite dimensionar el caso.*
**Pregunta:** ¿Quién o quiénes están involucrados?
* [ ] Una sola persona.
* [ ] Un grupo de personas.
* [ ] No estoy seguro/a.

**Pregunta:** ¿Son de tu mismo salón o grado?
* [ ] Sí, de mi mismo salón.
* [ ] De otro salón del mismo grado.
* [ ] De un grado mayor.
* [ ] De un grado menor.
* [ ] No lo sé.

### E. Grado Escolar (Selección Única - Opcional)
*Identifica focos por grado escolar sin exponer identidad.*
**Pregunta:** ¿En qué grado estás? *(Ej. 6°, 7°, 8°...)*

### F. Descripción Abierta (Campo de Texto - Insumo Principal IA)
*Texto libre que se enviará al servicio de inferencia para el análisis de Procesamiento de Lenguaje Natural (NLP).*
**Pregunta:** Cuéntanos con tus propias palabras qué pasó:
*(Placeholder sugerido: "Escribe aquí lo que pasó sin decir tu nombre. Por ejemplo: Ayer en el recreo me acorralaron y me dijeron que...")*

### G. Evidencia (Archivo - Opcional)
*Especialmente relevante para Ciberbullying.*
**Pregunta:** (Opcional) Si tienes una foto o captura de pantalla de lo que pasó, puedes subirla aquí.

### H. Garantía de Anonimato
*Mensaje estático obligatorio en la interfaz.*
**Nota de seguridad:** "Este reporte es 100% anónimo. Nadie sabrá quién eres, no guardaremos tus datos y la información solo se usará para protegerte."

---

## 3. Estructura de Intercambio de Datos (JSON Payload)

Este es el formato estructurado que el Frontend enviará al endpoint `POST /reportes` del Backend. Se utilizan enums para estandarizar la entrada:

```json
{
  "ubicacion": "BANOS",
  "frecuencia": "SEMANAS",
  "tipos_agresion": [
    "FISICO",
    "VERBAL"
  ],
  "involucrados_tipo": "GRUPO",
  "involucrados_grado": "MISMO_SALON",
  "grado_victima": "7",
  "evidencia_url": "https://bucket.s3.../file.jpg",
  "descripcion_abierta": "Ayer en el descanso me acorralaron y me dijeron que si no les daba mi plata me iban a pegar a la salida, además me empujaron duro contra la pared."
}
```

---

## 4. Esquema de Base de Datos (PostgreSQL)

Script SQL para la creación de la tabla principal de reportes. Cumple con los requisitos de la historia de usuario para no guardar información personal (IP, nombres, correos) y utiliza UUID para generar tickets de seguimiento anónimos.

```sql
-- Habilitar la extensión para generar identificadores alfanuméricos únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE reportes (
    -- Genera el código de seguimiento anónimo
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación con la institución
    institucion_id INT NOT NULL, 
    
    -- Variables categóricas extraídas del formulario
    ubicacion VARCHAR(50) NOT NULL,
    frecuencia VARCHAR(50) NOT NULL,
    involucrados_tipo VARCHAR(50),
    involucrados_grado VARCHAR(50),
    grado_victima VARCHAR(10),
    
    -- Almacena las selecciones múltiples del JSON como un arreglo nativo
    tipo_incidente TEXT[] NOT NULL, 
    
    -- El texto libre que procesará el modelo de IA
    descripcion TEXT,
    
    -- Evidencias (URL o path del archivo)
    evidencia_url VARCHAR(255),
    
    -- Clasificación predictiva asignada por el modelo de NLP
    nivel_riesgo VARCHAR(20), 
    
    -- Ciclo de vida del reporte (inicia como 'nuevo')
    estado VARCHAR(20) DEFAULT 'nuevo',
    
    -- Marca de tiempo de registro para métricas y gráficas
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
