# API de usuarios y tareas

API del parcial 2026 usada en la Tarea Angular 2. Utiliza Fastify, TypeScript,
TypeBox y PostgreSQL. El frontend de esta entrega funciona por separado.

## Ejecutar

Requiere Node.js 24 o superior y Docker Desktop.
Desde esta carpeta:

1. Copiar `.env.example` a `.env`.
2. Completar `PGPASSWORD` y `FASTIFY_SECRET` y revisar la conexión PostgreSQL.
3. Instalar dependencias e iniciar la base y el servidor:

```bash
docker compose up -d db
npm run dev
```

Si el puerto 5432 está ocupado, cambiar `PGPORT` en `.env`. En mi entorno uso 5434.
El contenedor y la API toman el mismo puerto de ese archivo.

El SQL está en `db/Parcial2026Tareas.sql` y se ejecuta al inicializar la base del contenedor.
No volver a ejecutar los INSERT sobre una base que ya tiene los datos cargados.
Los archivos de referencia están en `../Archivos_TareaAngular2`.

Swagger: http://localhost:3000/docs.

## Autenticación

Usar `POST /auth/login`. Las cuentas del SQL `superadmin`, `admin` y `user`
tienen la contraseña de prueba `Contraseña1`.
Copiar el token de la respuesta y pegarlo en Authorize en Swagger.
`GET /auth` devuelve el identificador, username y grupos del usuario autenticado.

## Rutas

| Método | Ruta | Operación |
|---|---|---|
| POST | /auth/login | Iniciar sesión |
| GET | /auth | Consultar identidad |
| GET, POST | /usuarios | Listar y crear usuarios |
| GET, PATCH, DELETE | /usuarios/:id_usuario | Consultar, editar y eliminar usuario |
| GET, POST | /tareas | Listar y crear tareas |
| GET, PATCH, DELETE | /tareas/:id_tarea | Consultar, editar y eliminar tarea |
| PATCH | /tareas/:id_tarea/finalizacion | Finalizar tarea |

## Permisos

Cualquier usuario autenticado puede consultar tareas. Admin y superadmin pueden crearlas.
Solo el creador o superadmin puede editarlas. Para finalizar una tarea hay que pertenecer
al grupo destinatario. Solo el creador puede eliminarla.

Admin y superadmin pueden listar usuarios. Cada usuario puede consultar y editar sus datos
personales. Superadmin puede crear y eliminar usuarios, editar otros perfiles y cambiar
grupos o el estado activo. No se puede eliminar un usuario que todavía tenga tareas propias.

PostgreSQL calcula `nombre_completo` y `estado`. Las credenciales se guardan aparte del perfil.

## Pruebas y comandos

- `npm run dev`: ejecuta TypeScript y reinicia al guardar cambios.
- `npm run typecheck`: comprueba tipos sin generar JavaScript.
- `npm test`: comprueba tipos y ejecuta pruebas HTTP con repositorios en memoria.
- `npm run test:db`: compila y prueba contra PostgreSQL en un esquema temporal.
- `npm start`: compila a `dist` y ejecuta el servidor compilado.

Los dos últimos comandos generan JavaScript en `dist`.

Detalles de peticiones y respuestas: [API](docs/API_ANGULAR.md).
Ejemplo de una petición: [recorrido](docs/RECORRIDO_PETICION.md).
