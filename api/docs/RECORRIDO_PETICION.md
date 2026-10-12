# Cómo se procesa una petición

Ejemplo: `PATCH /tareas/10/finalizacion`, con `Authorization: Bearer TOKEN`
y cuerpo `{}`. Suponemos que la tarea pertenece al grupo `user` y está abierta.

1. **Autenticación, en `onRequest`.** `authenticate`, definido en
   `src/plugins/jwt.ts`, verifica el token y consulta la cuenta activa.
   Coloca su identidad y grupos actuales en `request.user`. Si el token no sirve
   o la cuenta está desactivada, lanza un error 401.
2. **Validación.** Los schemas de `src/schemas/tareas-schema.ts` comprueban
   el ID y el cuerpo. `{}` permite usar la hora actual. Una fecha inválida o un
   campo que no corresponde produce 400 antes de consultar el permiso.
3. **Autorización, en `preHandler`.** `puedeFinalizarTarea`, definido en
   `src/plugins/authorization.ts`, busca la tarea y comprueba si su grupo está
   incluido en `request.user.grupos`. Si no existe, el repositorio lanza 404;
   si existe y falta el grupo, el decorador lanza 403.
4. **Handler.** La ruta en `src/routes/tareas/tareas-routes.ts` llama a
   `tareasRepo.finalizar` con el ID, el usuario autenticado y la fecha opcional.
5. **Repositorio y base de datos.** `src/repositories/tareas-repository.ts`
   ejecuta un UPDATE parametrizado. Solo modifica una tarea abierta del grupo
   permitido. Guarda la fecha y PostgreSQL calcula el estado `Cerrada`.
   Si ya estaba cerrada, se lanza un conflicto 409.
6. **Respuesta.** Se devuelve la tarea actualizada con 200 y el schema de
   respuesta. Si algún paso lanza una excepción, el manejador central de
   `src/app.ts` genera la respuesta de error.

## Qué diferencia hay entre los conceptos

- **Autenticación:** ¿quién está haciendo la petición? Comprueba el JWT.
- **Validación:** ¿los datos recibidos tienen la forma permitida? Comprueba schemas.
- **Autorización:** ¿esa persona puede hacer esta operación? Comprueba permisos.
- **Regla de negocio:** ¿la operación es válida para el estado actual?
  Por ejemplo, no cerrar dos veces la misma tarea.

Ser superadmin no permite finalizar automáticamente tareas de `user` o `admin`:
la letra exige pertenecer al grupo destinatario. Tampoco permite borrar tareas
ajenas: la eliminación corresponde exclusivamente al creador.

Las condiciones de permiso del UPDATE y DELETE complementan al `preHandler`.
Evitan una escritura indebida si la tarea cambia entre el chequeo y la consulta SQL.

Una petición autenticada con datos inválidos devuelve 400 antes de evaluar permisos.
Sin autenticación, devuelve 401 primero.
