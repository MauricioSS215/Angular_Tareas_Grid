import { Routes } from '@angular/router';

export const tareasRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Tareas',
    loadComponent: () =>
      import('./pages/tareas/listar-tareas/listar-tareas.page').then(
        (m) => m.ListarTareasPage,
      ),
  },
  // "crear" debe ir antes del parámetro para que no se interprete como un ID.
  {
    path: 'crear',
    title: 'Crear tarea',
    loadComponent: () =>
      import('./pages/tareas/crear-tareas/crear-tareas.page').then(
        (m) => m.CrearTareasPage,
      ),
  },
  {
    path: ':id_tarea',
    title: 'Editar tarea',
    loadComponent: () =>
      import('./pages/tareas/editar-tareas/editar-tareas.page').then(
        (m) => m.EditarTareasPage,
      ),
  },
  // Las rutas de tareas desconocidas vuelven al listado.
  { path: '**', redirectTo: '' },
];

export default tareasRoutes;
