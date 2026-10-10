import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { routes } from './app.routes';
import { UsuarioForm } from './components/usuario/usuario.form';
import { TareaForm } from './components/tarea/tarea.form';
import { CrearUsuariosPage } from './pages/usuarios/crear-usuarios/crear-usuarios.page';
import { CrearTareasPage } from './pages/tareas/crear-tareas/crear-tareas.page';
import { EditarUsuariosPage } from './pages/usuarios/editar-usuarios/editar-usuarios.page';
import { EditarTareasPage } from './pages/tareas/editar-tareas/editar-tareas.page';
import { ListarTareasPage } from './pages/tareas/listar-tareas/listar-tareas.page';
import { ListarUsuariosPage } from './pages/usuarios/listar-usuarios/listar-usuarios.page';
import { NotFoundPage } from './pages/not-found/not-found.page';
import { UsuarioService } from './services/usuario.service';
import { listaUsuarios } from './model/listaUsuarios';
import { listaTareas } from './model/listaTareas';

describe('Entrega: navegación y comunicación entre componentes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
  });

  afterEach(() => vi.restoreAllMocks());

  it('abre crear usuario y recibe el objeto escrito en el formulario', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/usuarios/create', CrearUsuariosPage);
    await harness.fixture.whenStable();
    const received = vi.spyOn(page, 'onGuardarUsuario');
    const root = harness.routeNativeElement!;
    for (const [id, value] of [
      ['nombre', 'Ana'], ['apellido', 'Pérez'], ['username', 'ana'],
    ]) {
      const field = root.querySelector<HTMLInputElement>('#' + id)!;
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(received).toHaveBeenCalledWith({
      id_usuario: 0, nombre: 'Ana', apellido: 'Pérez', username: 'ana',
    });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain('Ana');
    expect((await TestBed.inject(UsuarioService).getAll()).at(-1)?.id_usuario).toBe(2);
  });

  it('abre crear tarea y recibe los datos del formulario, incluidos los select', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/tareas/create', CrearTareasPage);
    const received = vi.spyOn(page, 'onGuardarTarea');
    const root = harness.routeNativeElement!;
    for (const [id, value, event] of [
      ['titulo', 'Preparar entrega', 'input'],
      ['descripcion', 'Revisar las rutas', 'input'],
      ['grupo', 'admin', 'input'],
      ['prioridad', '2:alta', 'input'],
    ]) {
      const field = root.querySelector<HTMLInputElement | HTMLSelectElement>('#' + id)!;
      field.value = value;
      field.dispatchEvent(new Event(event, { bubbles: true }));
    }
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(received).toHaveBeenCalledWith({
      id_tarea: 0, id_creador: 1, titulo: 'Preparar entrega',
      descripcion: 'Revisar las rutas', grupo: 'admin', prioridad: '2:alta',
      creada: '', terminada: null, estado: 'Abierta',
    });
  });

  it('carga el usuario por ID y envía una copia editada a la página', async () => {
    const original = { ...listaUsuarios[0] };
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/usuarios/1', EditarUsuariosPage);
    await harness.fixture.whenStable();
    const received = vi.spyOn(page, 'onGuardarUsuario');
    const form = harness.routeDebugElement!.query(By.directive(UsuarioForm)).componentInstance as UsuarioForm;
    expect(form.usuarioModel()).toEqual(listaUsuarios[0]);
    form.usuarioModel.update((value) => ({ ...value, nombre: 'Editado' }));
    form.submitForm(new Event('submit'));
    expect(received).toHaveBeenCalledWith({ ...listaUsuarios[0], nombre: 'Editado' });
    expect(listaUsuarios[0]).toEqual(original);
    await harness.fixture.whenStable();
    expect((await TestBed.inject(UsuarioService).getById(1))?.nombre).toBe('Editado');
    expect(harness.routeNativeElement!.textContent).toContain('Editado');
  });

  it('actualiza el formulario al navegar entre IDs de tarea y conserva los datos originales', async () => {
    const original = { ...listaTareas[1] };
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas/1', EditarTareasPage);
    const page = await harness.navigateByUrl('/tareas/2', EditarTareasPage);
    const received = vi.spyOn(page, 'onGuardarTarea');
    const form = harness.routeDebugElement!.query(By.directive(TareaForm)).componentInstance as TareaForm;
    expect(form.tareaModel()).toEqual(listaTareas[1]);
    form.tareaModel.update((value) => ({ ...value, titulo: 'Editada' }));
    form.submitForm(new Event('submit'));
    expect(received).toHaveBeenCalledWith({ ...listaTareas[1], titulo: 'Editada' });
    expect(listaTareas[1]).toEqual(original);
  });

  it('muestra un mensaje y no un formulario cuando el ID no existe o no es numérico', async () => {
    const harness = await RouterTestingHarness.create();
    for (const url of ['/usuarios/999', '/usuarios/abc', '/tareas/999', '/tareas/abc']) {
      await harness.navigateByUrl(url);
      await harness.fixture.whenStable();
      expect(harness.routeNativeElement!.textContent).toContain('No se encontró');
      expect(harness.routeNativeElement!.querySelector('form')).toBeNull();
    }
  });

  it('enlaza los botones Editar con sus IDs y conecta Eliminar en usuarios', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/usuarios', ListarUsuariosPage);
    const remove = vi.spyOn(page, 'eliminarUsuario');
    await harness.fixture.whenStable();
    const buttons = harness.routeNativeElement!.querySelectorAll('tbody button');
    buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(remove).toHaveBeenCalledWith(listaUsuarios[0]);
    const edit = harness.routeDebugElement!.queryAll(By.css('tbody button'))[0];
    const { RouterLink } = await import('@angular/router');
    expect(edit.injector.get(RouterLink).urlTree?.toString()).toBe('/usuarios/1');
    await harness.fixture.whenStable();
    expect(await TestBed.inject(UsuarioService).getAll()).toEqual([]);
    expect(harness.routeNativeElement!.textContent).toContain('No se encontraron usuarios');
  });

  it('conecta acciones de tareas y no permite finalizar una ya cerrada', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/tareas', ListarTareasPage);
    const finish = vi.spyOn(page, 'finalizarTarea');
    const remove = vi.spyOn(page, 'eliminarTarea');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await harness.fixture.whenStable();
    const buttons = harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('tbody button');
    buttons[1].click();
    buttons[2].click();
    expect(finish).toHaveBeenCalledWith(listaTareas[0]);
    expect(remove).toHaveBeenCalledWith(listaTareas[0]);
    expect(log).toHaveBeenCalledWith(
      'Finalizar tarea:', listaTareas[0],
    );
    expect(buttons[4].disabled).toBe(true);
    expect(listaTareas[0].terminada).toBeNull();
  });

  it('redirige rutas desconocidas de tareas y muestra NotFound fuera de tareas', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas/ruta/desconocida', ListarTareasPage);
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('Tareas');
    await harness.navigateByUrl('/no-existe', NotFoundPage);
    expect(harness.routeNativeElement!.textContent).toContain('Página no encontrada');
  });
});
