# Especificación de la API REST — SafeVoice

> **Versión:** 1.0.0  
> **Prefijo Base:** `/api/v1/`  
> **Servidor Producción (Oracle Cloud):** `http://157.137.205.82:8000/api/v1/`  
> **Servidor Local (Desarrollo):** `http://localhost:8000/api/v1/`  

---

## 1. Convenciones Globales

### Autenticación y Encabezados
* Los endpoints públicos no requieren encabezado de autorización.
* Los endpoints protegidos requieren un token JWT en el encabezado `Authorization`:
  ```http
  Authorization: Bearer <access_token>
  ```
* Todas las peticiones con cuerpo deben declarar:
  ```http
  Content-Type: application/json
  ```
  *(Excepto la subida de evidencia multimedia que utiliza `multipart/form-data`).*

### Estructura de Respuestas de Error
```json
{
  "detail": "Descripción legible del error o motivo del rechazo.",
  "code": "CODIGO_INTERNO_OPCIONAL"
}
```

---

## 2. Dominio de Reportes (`/api/v1/reports/`)

### 2.1. Radicación Anónima de Reporte
* **Ruta:** `POST /api/v1/reports/`
* **Acceso:** Público (Estudiante - Víctima o Testigo).
* **Descripción:** Recibe el formulario de denuncia, anonimiza metadatos e IP mediante el repositorio proxy, cifra datos sensibles con Fernet AES-128, ejecuta la inferencia de riesgo con IA (TF-IDF + Random Forest + Reglas críticas) y almacena el caso.
* **Payload Request:**
  ```json
  {
    "institucion_id": 1,
    "rol_reportante": "victima",
    "grado_victima": "8°",
    "ubicacion": "Baños, Pasillos o escaleras, Salida del colegio",
    "frecuencia": "Lleva pasando algunas semanas",
    "involucrados_tipo": "grupo",
    "involucrados_grado": "mismo_grado",
    "tipos_agresion": ["FISICO", "VERBAL"],
    "descripcion": "Ayer en el descanso me encerraron en el baño y me exigieron dinero bajo amenaza.",
    "evidencia_url": "/media/evidencias/evidencia_abc123.jpg",
    "acepta_revelar_identidad": false,
    "nombre_contacto_victima": null,
    "medio_contacto_victima": null
  }
  ```
* **Respuesta (`201 Created`):**
  ```json
  {
    "codigo_seguimiento": "b4e85741-94f7-494b-97e3-0c4beea3b715",
    "nivel_riesgo_predicho": "ALTO",
    "estado": "nuevo",
    "fecha_creacion": "2026-10-27T14:30:00Z",
    "mensaje": "Tu reporte ha sido radicado con éxito."
  }
  ```

---

### 2.2. Subida Segura de Evidencia Fotográfica
* **Ruta:** `POST /api/v1/reports/evidencia/`
* **Acceso:** Público.
* **Content-Type:** `multipart/form-data`
* **Parámetros:** `archivo` (Archivo de imagen JPG, PNG o WEBP, máx. 5 MB).
* **Respuesta (`201 Created`):**
  ```json
  {
    "url": "/media/evidencias/evidencia_4f81c9a0.jpg"
  }
  ```

---

### 2.3. Consulta Anónima de Estado por Código
* **Ruta:** `GET /api/v1/reports/consultar/?codigo_seguimiento=<uuid>`
* **Acceso:** Público.
* **Descripción:** Permite al estudiante verificar el estado de su caso sin vulnerar su anonimato.
* **Respuesta (`200 OK`):**
  ```json
  {
    "codigo_seguimiento": "b4e85741-94f7-494b-97e3-0c4beea3b715",
    "estado": "en_seguimiento",
    "fecha_creacion": "2026-10-27T14:30:00Z",
    "fecha_actualizacion": "2026-10-27T16:00:00Z",
    "mensaje_orientador": "El equipo de orientación ya ha iniciado el protocolo de atención preventiva."
  }
  ```

---

### 2.4. Listar Reportes Institucionales
* **Ruta:** `GET /api/v1/reports/listar/`
* **Acceso:** Autenticado (`ORIENTADOR`, `DIRECTIVO`).
* **Query Params Opcionales:**
  * `estado`: `nuevo`, `en_revision`, `en_seguimiento`, `cerrado`, `reabierto`.
  * `nivel_riesgo`: `BAJO`, `MEDIO`, `ALTO`, `CRITICO`.
  * `ubicacion`: Subcadena para filtrar por zona.
  * `page`: Número de página (default: 1).
  * `page_size`: Elementos por página (default: 20).
* **Respuesta (`200 OK`):**
  ```json
  {
    "count": 45,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 12,
        "codigo_seguimiento": "b4e85741-94f7-494b-97e3-0c4beea3b715",
        "ubicacion": "Baños, Pasillos o escaleras",
        "frecuencia": "Lleva pasando algunas semanas",
        "grado_victima": "8°",
        "descripcion": "Ayer en el descanso me encerraron en el baño...",
        "nivel_riesgo_predicho": "ALTO",
        "nivel_riesgo_confirmado": "ALTO",
        "estado": "nuevo",
        "tipos_agresion": ["FISICO", "VERBAL"],
        "evidencia_url": null,
        "fecha_creacion": "2026-10-27T14:30:00Z"
      }
    ]
  }
  ```

---

### 2.5. Actualizar Estado de Reporte (HU-08)
* **Ruta:** `PATCH /api/v1/reports/<reporte_id>/estado/`
* **Acceso:** Autenticado (`ORIENTADOR`).
* **Payload Request:**
  ```json
  {
    "nuevo_estado": "en_seguimiento",
    "comentario": "Se realizó la primera sesión de escucha individual con el estudiante afectado."
  }
  ```
* **Respuesta (`200 OK`):**
  ```json
  {
    "id": 12,
    "estado": "en_seguimiento",
    "mensaje": "Estado actualizado correctamente."
  }
  ```

---

### 2.6. Confirmación / Rectificación Docente de IA (Human-in-the-Loop)
* **Ruta:** `PATCH /api/v1/reports/<reporte_id>/clasificacion/`
* **Acceso:** Autenticado (`ORIENTADOR`).
* **Descripción:** Permite al docente confirmar o rectificar el nivel de riesgo predicho por la IA y editar las modalidades de agresión asociadas, registrando trazabilidad en auditoría.
* **Payload Request:**
  ```json
  {
    "nivel_riesgo_confirmado": "CRITICO",
    "confirmar_ia": false,
    "tipos_agresion": ["FISICO", "VERBAL", "PSICOLOGICO_SOCIAL"],
    "comentario": "Se eleva a crítico debido a antecedentes de agresión física reiterada y daño psicosocial severo constatado en entrevista."
  }
  ```
* **Respuesta (`200 OK`):**
  ```json
  {
    "id": 12,
    "nivel_riesgo_confirmado": "CRITICO",
    "tipos_agresion": ["FISICO", "VERBAL", "PSICOLOGICO_SOCIAL"],
    "mensaje": "Clasificación verificada por el docente actualizada con éxito."
  }
  ```

---

### 2.7. Registrar Seguimiento o Activación de Ruta Externa
* **Ruta:** `POST /api/v1/reports/<reporte_id>/seguimiento/`
* **Acceso:** Autenticado (`ORIENTADOR`).
* **Payload Request:**
  ```json
  {
    "tipo_accion": "RUTA_EXTERNA",
    "comentario": "Remisión formal radicada ante la Comisaría de Familia e ICBF.",
    "metadata": {
      "entidad": "ICBF",
      "radicado": "RAD-2026-8849",
      "funcionario": "Dra. Martha Gómez"
    }
  }
  ```
* **Respuesta (`200 OK`):**
  ```json
  {
    "mensaje": "Acción de seguimiento registrada exitosamente en la bitácora."
  }
  ```

---

### 2.8. Registrar Chequeo Post-Cierre (Semáforo 15, 30 y 60 Días)
* **Ruta:** `POST /api/v1/reports/<reporte_id>/chequeo-post-cierre/`
* **Acceso:** Autenticado (`ORIENTADOR`).
* **Payload Request:**
  ```json
  {
    "hito": "DIA_15",
    "semaforo": "VERDE",
    "observaciones": "El estudiante manifiesta tranquilidad y clima armónico en el aula.",
    "reactivar_caso": false
  }
  ```
* **Respuesta (`200 OK`):**
  ```json
  {
    "mensaje": "Chequeo post-cierre registrado con éxito.",
    "estado_reporte": "cerrado"
  }
  ```

---

### 2.9. Obtener Recomendaciones de Intervención (Ley 1620)
* **Ruta:** `GET /api/v1/reports/<reporte_id>/recomendaciones/`
* **Acceso:** Autenticado (`ORIENTADOR`, `DIRECTIVO`).
* **Respuesta (`200 OK`):**
  ```json
  {
    "tipo_situacion": "Tipo II",
    "protocolo": "Intervención Tipo II: Contención, Protección Cautelar y Comité de Convivencia",
    "plazo_maximo_horas": 24,
    "acciones_sugeridas": [
      "Garantizar medidas cautelares de separación y protección inmediata.",
      "Atención socioemocional individual y confidencial a la víctima.",
      "Citación por separado a acudientes de las partes involucradas.",
      "Convocatoria de sesión extraordinaria del Comité Escolar de Convivencia."
    ],
    "lineas_ayuda": [
      {"entidad": "Línea 106 - Salud Mental", "telefono": "106"},
      {"entidad": "ICBF - Protección Infantil", "telefono": "141"}
    ]
  }
  ```

---

### 2.10. Historial y Bitácora de Auditoría
* **Ruta:** `GET /api/v1/reports/<reporte_id>/historial/`
* **Acceso:** Autenticado (`ORIENTADOR`, `DIRECTIVO`).
* **Respuesta (`200 OK`):**
  ```json
  [
    {
      "fecha": "2026-10-27T15:10:00Z",
      "autor": "orientacion@colegio.edu.co",
      "tipo": "CAMBIO_ESTADO",
      "estado_anterior": "nuevo",
      "estado_nuevo": "en_seguimiento",
      "comentario": "Inicio de protocolo de atención."
    }
  ]
  ```

---

### 2.11. Métricas y Estadísticas Institucionales
* **Ruta:** `GET /api/v1/reports/statistics/`
* **Acceso:** Autenticado (`DIRECTIVO`, `ORIENTADOR`).
* **Query Params Opcionales:** `fecha_inicio`, `fecha_fin`.
* **Respuesta (`200 OK`):**
  ```json
  {
    "total_reportes": 128,
    "casos_criticos": 8,
    "casos_resueltos": 104,
    "distribucion_riesgo": {
      "BAJO": 45,
      "MEDIO": 50,
      "ALTO": 25,
      "CRITICO": 8
    },
    "distribucion_agresion": {
      "FISICO": 32,
      "VERBAL": 78,
      "PSICOLOGICO_SOCIAL": 54,
      "CIBERBULLYING": 21,
      "MATERIAL": 14
    }
  }
  ```

---

### 2.12. Mapa de Calor Institucional
* **Ruta:** `GET /api/v1/reports/heatmap/`
* **Acceso:** Autenticado (`DIRECTIVO`, `ORIENTADOR`).
* **Respuesta (`200 OK`):**
  ```json
  {
    "zonas": [
      {"ubicacion": "Baños", "total": 34, "intensidad": "ALTA"},
      {"ubicacion": "Pasillos o escaleras", "total": 28, "intensidad": "MEDIA"},
      {"ubicacion": "Descanso / zonas deportivas", "total": 21, "intensidad": "MEDIA"},
      {"ubicacion": "Salida del colegio", "total": 19, "intensidad": "MEDIA"},
      {"ubicacion": "Internet / Redes sociales", "total": 15, "intensidad": "BAJA"}
    ]
  }
  ```

---

### 2.13. Exportación Consolidada para SIUCE / Excel (CSV)
* **Ruta:** `GET /api/v1/reports/exportar/csv/`
* **Acceso:** Autenticado (`DIRECTIVO`, `ORIENTADOR`).
* **Query Params:** `fecha_inicio`, `fecha_fin`, `estado`, `nivel_riesgo`.
* **Respuesta (`200 OK`):**
  * **Content-Type:** `text/csv; charset=utf-8`
  * **Content-Disposition:** `attachment; filename=reportes_convivencia_2026-10-27.csv`

---

## 3. Dominio de Usuarios y Autenticación (`/api/v1/users/`)

### 3.1. Inicio de Sesión
* **Ruta:** `POST /api/v1/users/login/`
* **Acceso:** Público.
* **Payload Request:**
  ```json
  {
    "email": "orientador@colegio.edu.co",
    "password": "PasswordSegura123!"
  }
  ```
* **Respuesta (`200 OK`):**
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsIn...",
    "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 3,
      "email": "orientador@colegio.edu.co",
      "nombre": "Ana María",
      "apellido": "Gómez",
      "rol": "ORIENTADOR",
      "institucion_id": 1,
      "institucion_nombre": "Colegio UPB"
    }
  }
  ```

---

### 3.2. Renovar Token de Acceso
* **Ruta:** `POST /api/v1/users/token/refresh/`
* **Payload Request:** `{"refresh": "<refresh_token>"}`
* **Respuesta (`200 OK`):** `{"access": "<new_access_token>"}`

---

### 3.3. Perfil del Usuario Autenticado
* **Ruta:** `GET /api/v1/users/me/`
* **Acceso:** Autenticado.
* **Respuesta (`200 OK`):** Datos completos del perfil institucional y rol del usuario.

---

### 3.4. Registro de Usuario (SignUp Público / Administrativo)
* **Ruta:** `POST /api/v1/users/register/`
* **Acceso:** Público / Asignación a institución.
* **Payload Request:**
  ```json
  {
    "email": "profesor@colegio.edu.co",
    "password": "Password123!",
    "first_name": "Carlos",
    "last_name": "Pérez",
    "rol": "ORIENTADOR",
    "institucion_id": 1
  }
  ```
* **Respuesta (`201 Created`):** `{"mensaje": "Usuario registrado exitosamente."}`

---

## 4. Dominio de Instituciones (`/api/v1/institutions/`)

### 4.1. Listado Público de Colegios
* **Ruta:** `GET /api/v1/institutions/`
* **Acceso:** Público.
* **Respuesta (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "nombre": "Colegio Mayor de Antioquia",
      "codigo_dane": "105001002345",
      "ciudad": "Medellín"
    }
  ]
  ```

---

### 4.2. Registro de Institución y Directivo (HU-11)
* **Ruta:** `POST /api/v1/institutions/register/`
* **Acceso:** Público.
* **Payload Request:**
  ```json
  {
    "nombre": "Instituto San Juan",
    "codigo_dane": "105001099887",
    "ciudad": "Bello",
    "admin_email": "rectoria@sanjuan.edu.co",
    "admin_password": "AdminPassword123!",
    "admin_nombre": "Luis",
    "admin_apellido": "Martínez"
  }
  ```
* **Respuesta (`201 Created`):**
  ```json
  {
    "mensaje": "Institución y cuenta directiva registradas con éxito.",
    "institucion_id": 2
  }
  ```

---

## 5. Dominio de Recursos de Ayuda (`/api/v1/resources/`)

* **`GET /api/v1/resources/`:** Consulta pública de contactos, líneas telefónicas 24/7 y entidades de apoyo.
* **`POST /api/v1/resources/admin/`:** Creación de recursos institucionales (solo Directivo/Orientador).
* **`PUT /api/v1/resources/admin/<id>/`:** Edición de información de contacto o entidad.
* **`DELETE /api/v1/resources/admin/<id>/`:** Desactivación de un canal de ayuda.
