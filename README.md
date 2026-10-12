# Tarea Angular 2

El repositorio contiene la API del parcial en `api` y el frontend en `front`.
Funcionan por separado: Angular usa arreglos en los servicios y no consume la API.
Los archivos que fueron provistos para esta tarea están en `Archivos_TareaAngular2` a modo de respaldo...

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

Abrir http://localhost:4200. Los cambios se pierden al recargar la página.

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

## Pruebas

En `front`: `npm test -- --watch=false`.
En `api`: `npm test` (pruebas HTTP sin PostgreSQL).
