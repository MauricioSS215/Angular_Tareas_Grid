# Contrato para el próximo frontend Angular

URL base local: `http://localhost:3000`.

Todas las rutas salvo login, raíz y documentación requieren:
`Authorization: Bearer TOKEN`.
No se envía el identificador del creador en el cuerpo.

## Autenticación

`POST /auth/login`

```json
{ "username": "admin", "password": "Contraseña1" }
```

Respuesta 200:

```json
{ "token": "JWT" }
```

`GET /auth` permite recuperar la identidad actual después de iniciar sesión.
La respuesta contiene `id_usuario`, `username` y `grupos`.
Ante 401, el frontend debe solicitar un nuevo inicio de sesión.

## Tipos de datos

```typescript
type Grupo = 'user' | 'admin' | 'superadmin';
type Prioridad = '0:baja' | '1:media' | '2:alta';

interface Identidad {
  id_usuario: number;
  username: string;
  grupos: Grupo[];
}

interface Tarea {
  id_tarea: number;
  id_creador: number;
  grupo: Grupo;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  creada: string;                 // ISO 8601, UTC
  terminada: string | null;       // ISO 8601, UTC
  estado: 'Abierta' | 'Cerrada';
}

interface CrearTarea {
  grupo: Grupo;
  titulo: string;                 // 1 a 100 caracteres, no solo espacios
  descripcion?: string | null;
  prioridad?: Prioridad;          // por defecto '1:media'
}

type EditarTarea = Partial<CrearTarea>; // al menos un campo

interface ErrorAPI {
  statusCode: number;
  error: string;
  message: string;
  code?: string;
}
```

## Operaciones

- `GET /tareas` → `Tarea[]`, lista global ordenada de más reciente a más antigua.
- `GET /tareas/:id_tarea` → `Tarea`.
- `POST /tareas` con `CrearTarea` → 201, `Tarea`.
- `PATCH /tareas/:id_tarea` con `EditarTarea` → 200, `Tarea`.
- `PATCH /tareas/:id_tarea/finalizacion` con `{}` → 200, `Tarea` cerrada.
- `DELETE /tareas/:id_tarea` → 204, sin cuerpo.

Para cerrar con fecha explícita:

```json
{ "terminada": "2026-10-10T15:00:00Z" }
```

Para usar la hora actual, enviar un objeto vacío `{}`.
Una tarea ya cerrada responde 409.
No enviar `estado`, `creada`, `id_creador`, `id_tarea` ni `terminada` en la edición general.

## Visibilidad de acciones en la interfaz

```typescript
const puedeCrear = identidad.grupos.some(g => g === 'admin' || g === 'superadmin');
const puedeEditar = tarea.id_creador === identidad.id_usuario
  || identidad.grupos.includes('superadmin');
const puedeFinalizar = tarea.terminada === null
  && identidad.grupos.includes(tarea.grupo);
const puedeEliminar = tarea.id_creador === identidad.id_usuario;
```

Estas condiciones permiten mostrar las acciones correspondientes.
El backend vuelve a verificar cada permiso: la interfaz no sustituye la autorización.

Los usuarios con superadmin no heredan otros grupos.
Un usuario puede tener varios grupos.

## Usuarios (extra disponible)

`GET /usuarios` requiere admin o superadmin.
`GET /usuarios/:id_usuario` permite el perfil propio o una consulta administrativa.

Los perfiles contienen: `id_usuario`, `username`, `nombres`, `apellidos`,
`fecha_nacimiento` (YYYY-MM-DD), `nombre_completo`, `grupos` y `activo`.

La alta requiere superadmin, datos personales, username y password de al menos seis caracteres.
Los grupos son opcionales y por defecto se asigna user.
El PATCH permite nombres, apellidos y fecha_nacimiento al propio usuario.
Cambiar grupos/activo o editar otra cuenta requiere superadmin.
La baja requiere superadmin y no se admite si la cuenta tiene tareas propias (409).

## Manejo de respuestas

- 400: mostrar error de datos/formulario.
- 401: solicitar inicio de sesión.
- 403: mostrar que la acción no está permitida.
- 404: informar que el recurso ya no existe.
- 409: mostrar conflicto y refrescar el recurso.
- 500: mostrar el mensaje genérico y permitir reintentar.

La respuesta DELETE 204 tiene cuerpo vacío; usar `void` como tipo de respuesta.
El JSON de error conserva `message` para mostrar una explicación al usuario.

Los orígenes localhost:4200 y 127.0.0.1:4200 están habilitados para CORS.
