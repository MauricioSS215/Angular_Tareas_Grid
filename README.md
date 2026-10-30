# CLase Grid Viernes 30/10/2026 — Usuarios y tareas


Los ejemplos de CSS Grid tienen bloques **A (antes fijo)** y **B (después responsive)** en estos archivos:

- [app.css](front/src/app/app.css): marco de la página, menú y área principal.
- [listar-tareas.page.css](front/src/app/pages/tareas/listar-tareas/listar-tareas.page.css): distribución de las tarjetas de tareas.
- [clase-grid.page.css](front/src/app/pages/clase-grid/clase-grid.page.css): distribución del panel de una materia.

Para alternar, comentar A y descomentar B, dejando **un solo bloque activo por archivo**. Para ver el después completo de cada ejemplo, también debe estar activo B en `app.css`.

## Usuario de prueba

Username: admin
Password: Contraseña1

El repositorio contiene la API en `api` y el frontend Angular en `front`.

El frontend consume la API para listar, crear, editar y eliminar
usuarios y tareas. Los datos se guardan en PostgreSQL.

Los formularios se reutilizan en creación y edición y tienen
validaciones con Signal Forms.

Esta entrega funciona sin autenticación ni autorización.
Los usuarios nuevos tienen la contraseña de prueba `Prueba123`.
Las tareas usan al primer usuario disponible como creador de ejemplo.


## Dependencias

En cada caso, instalar las dependencias con el siguiente comando:

```bash
npm install
```

## Frontend

Desde la carpeta `front`, luego de instalar las dependencias la primera vez y levantar Angular:

```bash
npm run start
```

Abrir http://localhost:4200. La API debe estar ejecutándose en
http://localhost:3000.

## API

Requiere Node.js 24 o superior y Docker Desktop en ejecución.
Desde `api`, copiar `.env.example` a `.env` y completar `PGPASSWORD` y `FASTIFY_SECRET`.
Revisar también los datos de conexión PostgreSQL.

```bash
docker compose up -d db
npm run dev
```

El ejemplo usa `PGPORT=5432`. Si está ocupado, cambiarlo en `.env`, en mi entorno uso `5434`.
Docker y la API usan ese mismo valor.
El SQL de `api/db` se carga al inicializar la base del contenedor.

Swagger: http://localhost:3000/docs.

