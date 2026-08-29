# Decisiones Backend
> Proyecto: **SafeVoice**

## Frameworks considerados

Se evaluaron tres opciones — Spring Boot, Django REST Framework y FastAPI — considerando los requisitos del sistema, la naturaleza sensible de los datos que maneja la plataforma (reportes de menores de edad) y la necesidad de integrar un módulo de inteligencia artificial para la clasificación automática de casos.

---

### 🌼 Spring Boot (Java)
Framework que simplifica el desarrollo de aplicaciones Java empresariales, proporcionando configuración automática y un enfoque de convención sobre configuración. Ampliamente adoptado en sistemas de gran escala, con un ecosistema maduro para seguridad y acceso a datos.

**Ventajas**
- Spring Security ofrece autenticación robusta y control de acceso por roles de forma integrada.
- Arquitectura en capas bien definida, útil para el trabajo colaborativo.
- Alta escalabilidad y rendimiento probados en producción.

**Desventajas**
- Introduce Java como un lenguaje separado del módulo de IA (Python), lo que obliga a comunicar dos servicios distintos.
- Más verboso y con mayor configuración inicial para llegar a un MVP funcional.
- El ecosistema de Machine Learning en Java es limitado, por lo que de todas formas se necesitaría un servicio Python aparte para la clasificación.

---

### 🐍 Django REST Framework (Python)
Framework backend de alto nivel basado en Python que sigue el principio de "baterías incluidas". Provee herramientas completas para autenticación, manejo de base de datos, serialización y panel de administración de forma nativa.

**Ventajas**
- Autenticación y hashing de contraseñas (PBKDF2/Argon2) integrados por defecto, sin configuración adicional.
- ORM propio robusto, con soporte para SQL Server mediante `mssql-django`.
- Panel de administración automático, útil para que orientadores/directivos gestionen datos sin desarrollo extra.
- Protección integrada contra ataques comunes (SQL Injection, XSS, CSRF) — relevante al manejar datos de menores.


**Desventajas**
- El soporte para WebSockets es un complemento externo (Django Channels), aunque SafeVoice no depende de tiempo real como requisito crítico.
- Estructura más rígida que sigue convenciones estrictas del framework.
- Menor rendimiento comparado con alternativas asíncronas para APIs puras.

---

### 🏃 FastAPI (Python)
Framework moderno y ligero de alto rendimiento para Python, diseñado para crear APIs rápidas con tipado automático y documentación interactiva. Usa ASGI, con soporte nativo para programación asíncrona.

**Ventajas**
- Muy alto rendimiento gracias a su arquitectura async/await.
- Documentación interactiva automática (Swagger/OpenAPI).
- Integración muy directa con librerías de Machine Learning.

**Desventajas**
- La autenticación, permisos y administración deben configurarse manualmente, sin nada "incluido" por defecto — mayor esfuerzo para cubrir los requisitos de seguridad de SafeVoice.
- Ecosistema más joven, con menos herramientas listas para gestión de roles y paneles administrativos.
- El equipo tendría que construir desde cero funcionalidades que Django ya trae resueltas (auth, ORM, admin).

---

## Análisis por criterio del proyecto

| Criterio | Spring Boot | Django | FastAPI |
|---|---|---|---|
| Autenticación y roles integrados | Alto (requiere config.) | Muy alto | Bajo |
| Seguridad por defecto (CSRF, XSS, SQLi) | Alto | Muy alto | Medio |
| Integración con módulo de IA (Python) | Bajo (servicio externo) | Muy alto (mismo lenguaje) | Muy alto (mismo lenguaje) |
| Panel administrativo | Requiere desarrollo | Incluido | Requiere desarrollo |
| Compatibilidad con SQL Server | Alta | Alta (con `mssql-django`) | Media |
| Velocidad de desarrollo (MVP) | Medio | Alto | Medio |

---

## 🎯 Framework Seleccionado: Django REST Framework (Python)

### ✅ Justificación

Después de comparar Spring Boot, Django REST Framework y FastAPI, se selecciona Django por las siguientes razones:

1. Django trae autenticación, hashing seguro de contraseñas y control de permisos por rol integrados de forma nativa, lo cual es crítico dado que SafeVoice maneja información sensible de menores de edad (directivos, orientadores, docentes y estudiantes con distintos niveles de acceso).
2. Su protección incorporada contra ataques comunes (CSRF, XSS, SQL Injection) reduce el riesgo de vulnerabilidades sin depender de configuración manual adicional.
3. Al usar Python, el backend comparte lenguaje con el módulo de clasificación por IA, simplificando el intercambio de lógica, estructuras de datos y facilitando que el mismo equipo pueda apoyar ambos componentes si es necesario.
4. Existe soporte confiable para conectar con SQL Server mediante `mssql-django`, cubriendo el motor de base de datos elegido para el proyecto.
5. El principio de "baterías incluidas" permite avanzar más rápido hacia un MVP funcional sin tener que resolver manualmente autenticación, ORM y validaciones, como sí sería necesario en FastAPI.

### ⚖️ Alternativas descartadas

- **Spring Boot:** ecosistema robusto y probado en producción, pero introduce Java como un lenguaje separado del módulo de IA, obligando a comunicar dos servicios en lenguajes distintos. Además, su ecosistema de Machine Learning es limitado, por lo que de todas formas se necesitaría un servicio Python aparte.
- **FastAPI:** excelente rendimiento y muy buena integración con IA, pero carece de autenticación, ORM y panel administrativo "incluidos", lo que implicaría construir manualmente varias piezas de seguridad que Django ya resuelve, aumentando el esfuerzo de desarrollo para un equipo con tiempo limitado.

### 🚀 Conclusión

Django REST Framework es la mejor opción porque combina:

- Autenticación y seguridad robustas por defecto, adecuadas para el manejo de datos de menores de edad.
- Mismo lenguaje que el módulo de inteligencia artificial, facilitando la integración entre ambos componentes.
- Panel administrativo y ORM incluidos, acelerando el desarrollo del MVP.
- Compatibilidad confirmada con SQL Server como motor de base de datos.
- Mayor compatibilidad debido a la experiencia del equipo con python.

