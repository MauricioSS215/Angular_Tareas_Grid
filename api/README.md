# Parcial 1 API REST 2026 — Gestión de tareas

Backend de Desarrollo Web 2026 con Fastify, TypeScript, TypeBox y PostgreSQL.
Implementa el dominio y las cinco reglas de tareas de la letra incluida en
`../DatosParcial2026`. Usa `grupos`, como el SQL y los archivos del profesor.

## Ejecutar en Windows

Requiere **Node.js 24 o superior** y PostgreSQL con la extensión `pgcrypto`.

Desde esta carpeta:

```powershell
npm install
npm run dev
```

La configuración se carga desde `.env`. Si no existe:

```powershell
Copy-Item .env.example .env
```

Completar la conexión `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
y un `FASTIFY_SECRET` propio. `.env` está excluido de Git.

Para una **base nueva y vacía**, ejecutar en pgAdmin/DBeaver
`db/Parcial2026Tareas.sql`, proporcionado por el profesor.
Los INSERT de ejemplo son para la carga inicial: no volver a ejecutarlos en una base ya cargada.
El backend no reinicializa ni cambia la estructura de la base al arrancar.

API: **http://localhost:3000**. Swagger: **http://localhost:3000/docs**.
OpenAPI JSON: **http://localhost:3000/docs/json**.

En la instalación local existente, se conserva `.env` y la base ya cargada.

## Inicio de sesión y pruebas desde Swagger

Las cuentas de ejemplo del SQL usan la contraseña **Contraseña1**:

| Username | Grupos |
|---|---|
| superadmin | superadmin |
| admin | admin, user |
| user | user |
| mgonzalez | user |
| srodriguez | user |
| lfernandez | user |

1. Ejecutar `POST /auth/login` con `username` y `password`.
2. Copiar el campo `token` de la respuesta.
3. En Swagger, pulsar **Authorize** y pegar el token.
4. Probar las rutas protegidas.

Los tokens duran ocho horas. Solo contienen identificador, username y grupos,
además de las marcas JWT. En cada petición se comprueba que la cuenta sigue activa
y se consultan sus grupos actuales. No se publican contraseñas ni hashes.

## Reglas de tareas

| Operación | Permiso |
|---|---|
| Consultar lista o detalle | Cualquier usuario autenticado |
| Crear | admin o superadmin |
| Editar título, descripción, grupo o prioridad | Creador o superadmin |
| Finalizar | Pertenecer al grupo destinatario exacto |
| Eliminar | Exclusivamente el creador |

**superadmin no hereda otros grupos** y no puede borrar tareas ajenas.
El usuario admin de ejemplo puede cerrar tareas user porque tiene ambos grupos.

La creación toma `id_creador` del usuario autenticado.
`creada` y `estado` los calcula PostgreSQL. El cierre escribe `terminada`.
La edición general no acepta creador, estado ni fechas.
No hay reapertura: un segundo cierre devuelve **409 Conflict**.

## API

| Método | Recurso | Resultado |
|---|---|---|
| POST | /auth/login | 200: token |
| GET | /auth | 200: identidad y grupos actuales |
| GET | /tareas | 200: arreglo global |
| GET | /tareas/:id_tarea | 200: tarea |
| POST | /tareas | 201: tarea y cabecera Location |
| PATCH | /tareas/:id_tarea | 200: tarea actualizada |
| PATCH | /tareas/:id_tarea/finalizacion | 200: tarea cerrada |
| DELETE | /tareas/:id_tarea | 204: sin cuerpo |
| GET | /usuarios | 200: usuarios; admin o superadmin |
| GET | /usuarios/:id_usuario | 200: perfil propio o consulta administrativa |
| POST | /usuarios | 201: usuario; solo superadmin |
| PATCH | /usuarios/:id_usuario | 200: perfil actualizado |
| DELETE | /usuarios/:id_usuario | 204; solo superadmin |

Las rutas de colección también admiten barra final.

**Extra de usuarios:** cada usuario puede editar sus datos personales.
Solo superadmin puede editar otras cuentas, cambiar grupos/activo o dar de alta/baja usuarios.
La baja devuelve 409 si el usuario todavía tiene tareas propias: esto impide saltarse
el permiso de eliminación de tareas a través del ON DELETE CASCADE del SQL.
Las credenciales se crean junto con el usuario en una transacción sobre la misma conexión.

## Autenticación y autorización

`onRequest` ejecuta `authenticate`: verifica el JWT y carga los grupos actuales
de la cuenta activa. Luego se validan los schemas y, en `preHandler`, se ejecuta
el decorador de autorización de cada operación. Los handlers llaman al repositorio
y construyen la respuesta, sin decidir los permisos.

Los decoradores están en `src/plugins/authorization.ts`. Crear tareas usa `isAdmin`,
editar usa `puedeEditarTarea`, finalizar usa `puedeFinalizarTarea` y borrar usa
`esCreadorTarea`. Los permisos de usuarios también se resuelven en `preHandler`.

El SQL conserva condiciones de permiso en las modificaciones para protegerlas si
los datos cambian entre la autorización y la escritura. El cierre repetido es una
regla de negocio del repositorio y produce 409. Los errores pasan por el manejador central.

Ejemplo explicado paso a paso: [docs/RECORRIDO_PETICION.md](docs/RECORRIDO_PETICION.md).

## Validación y errores

Schemas TypeBox para parámetros, cuerpos y respuestas.
Los cuerpos JSON mantienen sus tipos: `descripcion: null` no se convierte en cadena vacía.
Los IDs de URL se convierten a enteros positivos de PostgreSQL.
Se rechazan campos desconocidos, grupos/prioridades inválidos y cuerpos de edición vacíos.

Los errores comparten esta forma:

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Solo el creador puede eliminar la tarea.",
  "code": "FORBIDDEN"
}
```

400: validación; 401: autenticación; 403: permisos; 404: recurso inexistente;
409: conflicto o cierre repetido; 500: fallo interno con mensaje público genérico.
Las restricciones PostgreSQL se traducen en el manejador central.

## Preparado para Angular

Contrato con ejemplos y tipos: [docs/API_ANGULAR.md](docs/API_ANGULAR.md).

CORS permite `http://localhost:4200` y `http://127.0.0.1:4200`,
incluidos PATCH, DELETE y Authorization. Configurable en `CORS_ORIGINS`.
El cliente envía `Authorization: Bearer TOKEN`.
Las fechas de tareas son strings ISO 8601; la fecha de nacimiento es YYYY-MM-DD.

## Comandos y comprobación

```powershell
npm run typecheck
npm test
npm run test:db
npm start
```

- `npm test`: tipado y pruebas HTTP de autenticación, permisos, schemas, errores, Swagger y CORS.
  Usa repositorios de prueba y no necesita PostgreSQL.
- `npm run test:db`: compilación y pruebas de API/repositorios contra PostgreSQL real.
  Crea un esquema único `parcial_test_...` con los datos del profesor y lo elimina al terminar.
  Requiere permiso CREATE sobre la base y pgcrypto ya instalado; no toca las tablas de public.
  Usa `.env`, o `TEST_DATABASE_URL` si se configura.
- `npm start`: compila a `dist` y ejecuta el backend compilado.
- `npm run dev`: ejecuta TypeScript y reinicia ante cambios.

## Estructura

```text
src/server.ts                   Inicio y cierre del servidor
src/app.ts                      Autoload y manejo central de errores
src/plugins/                    JWT, autorización, CORS, Swagger y utilidades Fastify
src/routes/auth/                Login e identidad
src/routes/tareas/              Rutas, schemas y operaciones de tareas
src/routes/usuarios/            Perfiles y administración (extra)
src/schemas/                    TypeBox y validación
src/repositories/               Consultas parametrizadas a PostgreSQL
src/db/database.ts              Pool de conexión
src/errors/response.errors.ts   Excepciones y traductor PostgreSQL
test/                           Pruebas HTTP y de integración
```

Se conserva el SQL del profesor y la organización por capas de los ejemplos de clase.
