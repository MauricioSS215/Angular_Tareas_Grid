# Tarea Viernes 16 — Usuarios y tareas

El repositorio contiene la API en `api` y el frontend Angular en `front`.

El frontend consume la API para listar, crear, editar y eliminar
usuarios y tareas. Los datos se guardan en PostgreSQL.

Los formularios se reutilizan en creación y edición y tienen
validaciones con Signal Forms.

Esta entrega funciona sin autenticación ni autorización.
Los usuarios nuevos tienen la contraseña de prueba `Prueba123`.
Las tareas usan al primer usuario disponible como creador de ejemplo.

Los archivos que paso el profesor siguen ahi en  `Archivos_TareaAngular2`.

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

