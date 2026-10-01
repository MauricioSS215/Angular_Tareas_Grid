# Angular: usuarios y tareas

Entrega de la 1er tarea de Angular

## Alcance de esta entrega

Páginas para listar, crear y editar usuarios y tareas. Los formularios están en componentes separados y usan Signal Forms.

Los datos están en arrays de ejemplo. Guardar envía el objeto a la página y lo muestra en la consola del navegador. Eliminar y finalizar también muestran la acción en consola. Por ahora, ninguna de estas acciones modifica las listas.


## Ejecutar

Se necesita Node.js. Versión usada: 24.19.0.

Abrir una terminal en la carpeta que contiene este README y package.json:

```powershell
npm ci
npm start
```

Abrir http://localhost:4200. Para detener el servidor: Ctrl+C.


## Rutas

| Ruta | Página |
| --- | --- |
| /home | Inicio |
| /usuarios | Listar usuarios |
| /usuarios/create | Crear usuario |
| /usuarios/:id_usuario | Editar usuario por ID |
| /tareas | Listar tareas |
| /tareas/create | Crear tarea |
| /tareas/:id_tarea | Editar tarea por ID |

Ejemplos de edición con datos existentes: /usuarios/1, /tareas/1 y /tareas/2.

Las rutas fijas `create` van antes de las rutas con parámetros. Así, “create” no se interpreta como un ID. El comodín general `**` queda al final y muestra “Página no encontrada”. Dentro de tareas, el comodín vuelve a la lista, como en clase. Si el ID no corresponde a un registro de ejemplo, la página de edición informa que no se encontró y no muestra un formulario vacío.


## Cómo funciona el formulario separado

1. La página muestra `<app-usuario-form>` o `<app-tarea-form>`.
2. En edición, pasa el registro mediante `[usuarioInicial]="actual"` o `[tareaInicial]="actual"`.
3. El componente recibe los datos con `@Input` y guarda una copia en `usuarioModel` o `tareaModel`, que son señales.
4. `form(...)` crea el formulario y `[formField]` enlaza cada control con su campo.
5. Al enviar, `preventDefault()` evita recargar la página y `output<Usuario>()` o `output<Tarea>()` emite el objeto.
6. La página lo captura con `(guardarUsuario)="onGuardarUsuario($event)"` o su equivalente para tareas.

La copia permite escribir en el formulario sin cambiar el registro de la lista.

Las páginas de edición leen el ID de la URL con `ActivatedRoute`, lo convierten a número y buscan el registro con `find`. `subscribe` permite repetir la búsqueda si cambia el ID. Al salir de la página, `ngOnDestroy` cancela esa suscripción.



## Comprobar la entrega

```powershell
npm run build
npm test -- --watch=false
```

## Prueba manual

1. Abrir Usuarios, pulsar Crear usuario y completar los tres campos.
2. Abrir la consola del navegador (F12 → Console), pulsar Guardar y comprobar el objeto recibido por la página.
3. Volver a Usuarios y pulsar Editar. Comprobar el ID en la URL y los datos precargados.
4. Repetir crear y editar desde Tareas, cambiando también grupo y prioridad.
5. Pulsar Eliminar y Finalizar y revisar la consola. Los arrays de ejemplo permanecen iguales.
6. Abrir /usuarios/999 y /tareas/999 para comprobar los mensajes de registro inexistente.

