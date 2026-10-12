# Frontend Angular — Tarea 2

Gestión de usuarios y tareas con datos ficticios en los servicios.
Funciona por separado de la API.

## Ejecutar

Desde la carpeta front:

Instalar las dependencias
```bash
npm install 
```
Y luego ejecutar 

```bash
npm run start
```

Abrir http://localhost:4200.

## Funcionalidades

- Listar, crear, editar y eliminar usuarios.
- Listar tareas con TareaCard.
- Crear, editar y eliminar tareas.
- Formularios con Signal Forms.
- Cambios guardados en memoria; se pierden al recargar.
- Para borrar un usuario hay que eliminar primero sus tareas, incluidas las cerradas.
- Las tareas nuevas usan el primer usuario disponible como creador ficticio.
  Si no hay usuarios, primero hay que crear uno.

Las páginas llaman a los servicios. Los componentes reciben datos
y emiten eventos.