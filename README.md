# SafeVoice

> **Plataforma web para la prevención, reporte anónimo y gestión integral de casos de convivencia y acoso escolar (Ley 1620 de 2013).**

**SafeVoice** es una plataforma digital desarrollada como proyecto del curso **Proyecto Aplicado en TIC (2026-2)** de la Universidad Pontificia Bolivariana, bajo la orientación de la profesora **Yuri Marcela Escobar Cardona**.

El sistema fortalece los procesos de prevención, detección temprana e intervención escolar frente al bullying y ciberbullying, articulando **Inteligencia Artificial ética (Human-in-the-Loop)**, **protección estructural del anonimato**, **cifrado en reposo (Fernet AES-128)** y cumplimiento estricto del debido proceso establecido por el **Decreto 1965 de 2013** en Colombia.

---

## 👥 Integrantes

| Nombre | Rol Principal | GitHub |
| :--- | :--- | :--- |
| **Mariana Arbelaez** | Análisis y Requisitos | [@MariArbe](#) |
| **Esteban Álvarez**  | Frontend e Interfaz UI | [@EstebanchoAV](#) |
| **Daniel Lopez**     | Backend, IA y Arquitectura Cloud | [@dani1309](#) |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios |
| **Backend** | Python 3.12+, Django 5.x, Django REST Framework, SimpleJWT, Cryptography (Fernet) |
| **Inteligencia Artificial** | Scikit-Learn (TF-IDF + Soft Voting Ensemble: Random Forest, Logistic Regression, SGDClassifier), Joblib, Pandas |
| **Bases de Datos** | **Microsoft SQL Server** (Producción en la nube) / **SQLite** (Pruebas automatizadas en memoria) |
| **Infraestructura Cloud** | Oracle Cloud Infrastructure (Ubuntu Linux 24.04 LTS, servicios `systemd`, IP `157.137.205.82`) |

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
* **Python** 3.10 o superior instalado.
* **Node.js** v18+ y **npm** instalados.
* **Git** instalado.

---

### 1. Clonar el Repositorio
```bash
git clone https://github.com/dani1309/SafeVoice.git
cd SafeVoice
```

---

### 2. Configuración del Backend (Django)

1. **Crear y activar el entorno virtual de Python:**
   * En Windows (PowerShell):
     ```powershell
     cd backend
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   * En Linux / macOS:
     ```bash
     cd backend
     python3 -m venv .venv
     source .venv/bin/activate
     ```

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno (`backend/.env`):**  
   Crea un archivo `.env` en la raíz de la carpeta `backend/` con los siguientes parámetros base:
   ```env
   DEBUG=True
   SECRET_KEY=tu-clave-secreta-de-desarrollo-django-12345
   ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

   # Clave de cifrado simétrico Fernet (AES-128 en base64) para campos sensibles
   # Puedes generar una ejecutando: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   REPORTS_FERNET_KEY=0123456789abcdef0123456789abcdef0123456789a=

   # Motor de BD local (SQLite por defecto para desarrollo ágil)
   USE_SQLITE=True
   ```

4. **Aplicar migraciones:**
   ```bash
   python manage.py migrate
   ```

5. **(Opcional) Cargar tipos de agresión base y crear superusuario:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Iniciar el servidor de desarrollo del backend:**
   ```bash
   python manage.py runserver 8000
   ```
   *API disponible en:* `http://localhost:8000/api/v1/`  
   *Panel de administración Django:* `http://localhost:8000/admin/`

---

### 3. Configuración del Frontend (React + Vite)

En una **nueva terminal**:

1. **Navegar a la carpeta del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar paquetes de Node.js:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo de Vite:**
   ```bash
   npm run dev
   ```
   *Aplicación web disponible en:* `http://localhost:5173/`

---

### 4. Modelo de Inteligencia Artificial (Compilación Local)

El modelo binario pre-entrenado ya se encuentra disponible en `model/clasificador_riesgo.joblib`. Si deseas volver a entrenarlo sobre el dataset de 600 casos:
```bash
# Desde la raíz del proyecto
python model/train.py
```

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto cuenta con una batería completa de más de **128 pruebas unitarias y de integración** continuas (cubriendo servicios de IA, anonimato con patrón proxy, cifrado Fernet, endpoints REST y autenticación):

```bash
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```

Para ejecutar únicamente los tests del modelo de Machine Learning y reglas deterministas:
```bash
.\.venv\Scripts\python.exe -m pytest apps/reports/tests/test_ml_service.py -v
```

---

## ☁️ Despliegue en Producción (Oracle Cloud)

El sistema se encuentra desplegado y activo en una instancia de **Oracle Cloud Infrastructure (Ubuntu Linux)**:
* **IP Pública:** `http://157.137.205.82`
* **Gestión de Procesos:** Administrado mediante servicios nativos de `systemd`:
  * `safevoice-backend.service`: Servidor WSGI Gunicorn conectado a Microsoft SQL Server (`safevoice_db`).
  * `safevoice-frontend.service`: Servidor estático optimizado de producción en Node.js.
* **Persistencia:** Base de datos relacional Microsoft SQL Server con soporte T-SQL y backups automáticos.

---

## 📂 Mapa de Documentación del Proyecto

```
SafeVoice/
├── README.md                                          ← Usted está aquí
├── docs/
│   ├── index.md                                       ← Visión general, contexto y alcance
│   ├── Analysis/
│   │   ├── index.md                                   ← Especificación de Requisitos (RF y RNF)
│   │   ├── Historias_de_Usuario_SafeVoice.md          ← Catálogo de Historias de Usuario (HU-01 a HU-20)
│   │   ├── documentacion_formulario.md                ← Preguntas, selección múltiple y endpoints
│   │   ├── criterios_clasificacion_riesgo.md          ← Rúbrica de riesgo según Ley 1620
│   │   └── protocolos_intervencion_ley1620.md         ← Protocolos pedagógicos Tipo I, II y III
│   ├── design/
│   │   ├── database.md                                ← Esquema relacional SQL Server, ERD y DDL
│   │   ├── api_endpoints.md                           ← Catálogo completo de endpoints de la API REST
│   │   └── arquitectura_y_seguridad.md                ← Patrón Proxy, Fernet AES-128 y Clean Architecture
│   └── ai/
│       └── modelo_ia_clasificacion.md                 ← Arquitectura técnica del modelo IA (TF-IDF + Ensamble)
├── backend/                                           ← API REST en Django y servicios de dominio
├── frontend/                                          ← Aplicación SPA en React + Vite
└── model/                                             ← Dataset y scripts de entrenamiento de ML
```
