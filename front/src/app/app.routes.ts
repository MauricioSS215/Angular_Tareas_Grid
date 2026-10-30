import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { authenticatedGuard } from './guards/authenticated-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', title: 'Inicio', component: HomePage },
  {
    path: 'clase-grid',
    title: 'Ejemplo de CSS Grid',
    loadComponent: () =>
      import('./pages/clase-grid/clase-grid.page').then((m) => m.ClaseGridPage),
  },
  {
    path: 'usuarios',
    title: 'Usuarios',
    loadComponent: () =>
      import('./pages/usuarios/listar-usuarios/listar-usuarios.page').then(
        (m) => m.ListarUsuariosPage,
      ),
  },
  // La ruta fija debe ir antes de usuarios/:id_usuario.
  {
    path: 'usuarios/crear',
    title: 'Crear usuario',
    loadComponent: () =>
      import('./pages/usuarios/crear-usuarios/crear-usuarios.page').then(
        (m) => m.CrearUsuariosPage,
      ),
  },
  {
    path: 'usuarios/:id_usuario',
    title: 'Editar usuario',
    loadComponent: () =>
      import('./pages/usuarios/editar-usuarios/editar-usuarios.page').then(
        (m) => m.EditarUsuariosPage,
      ),
  },
  {
    path: 'tareas',
    canActivateChild: [authenticatedGuard],
    loadChildren: () => import('./tareas.routes').then((m) => m.tareasRoutes),
  },
  {
    path: 'login',
    title: 'Iniciar sesión',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  // El comodín siempre va al final.
  {
    path: '**',
    title: 'No encontrado',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
