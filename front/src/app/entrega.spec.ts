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
import { TareasService } from './services/tareas.service';

describe('Entrega: navegación y comunicación entre componentes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('abre crear usuario y recibe el objeto escrito en el formulario', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/usuarios/crear', CrearUsuariosPage);
    await harness.fixture.whenStable();
    const received = vi.spyOn(page, 'onGuardarUsuario');
    const root = harness.routeNativeElement!;
    for (const [id, value] of [
      ['nombres', 'Ana'],
      ['apellidos', 'Pérez'],
      ['username', 'ana'],
      ['fecha_nacimiento', '2000-01-15'],
    ]) {
      const field = root.querySelector<HTMLInputElement>('#' + id)!;
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(received).toHaveBeenCalledWith({
      id_usuario: 0,
      username: 'ana',
      nombres: 'Ana',
      apellidos: 'Pérez',
      fecha_nacimiento: '2000-01-15',
      nombre_completo: '',
      grupos: ['user'],
      activo: true,
    });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain('Ana');
    expect((await TestBed.inject(UsuarioService).getAll()).at(-1)?.id_usuario).toBe(2);
  });

  it('abre crear tarea y recibe los datos del formulario, incluidos los select', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/tareas/crear', CrearTareasPage);
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
      id_tarea: 0,
      id_creador: 1,
      titulo: 'Preparar entrega',
      descripcion: 'Revisar las rutas',
      grupo: 'admin',
      prioridad: '2:alta',
      creada: '',
      terminada: null,
      estado: 'Abierta',
    });
    await harness.fixture.whenStable();
    const tareas = await TestBed.inject(TareasService).getAll();
    const guardada = tareas.find((tarea) => tarea.titulo === 'Preparar entrega');
    expect(tareas.length).toBe(listaTareas.length + 1);
    expect(guardada).toMatchObject({
      id_tarea: 3,
      id_creador: 1,
      titulo: 'Preparar entrega',
      descripcion: 'Revisar las rutas',
      grupo: 'admin',
      prioridad: '2:alta',
      terminada: null,
      estado: 'Abierta',
    });
    expect(Number.isFinite(Date.parse(guardada!.creada))).toBe(true);
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('Tareas');
    const tarjeta = Array.from(harness.routeNativeElement!.querySelectorAll('article')).find(
      (article) => article.textContent?.includes('Preparar entrega'),
    );
    expect(tarjeta?.textContent).toContain('Revisar las rutas');
    expect(tarjeta?.textContent).toContain('admin');
    expect(tarjeta?.textContent).toContain('2:alta');
  });

  it('carga el usuario por ID y envía una copia editada a la página', async () => {
    const original = { ...listaUsuarios[0] };
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/usuarios/1', EditarUsuariosPage);
    await harness.fixture.whenStable();
    const received = vi.spyOn(page, 'onGuardarUsuario');
    const form = harness.routeDebugElement!.query(By.directive(UsuarioForm))
      .componentInstance as UsuarioForm;
    expect(form.usuarioModel()).toEqual(listaUsuarios[0]);
    form.usuarioModel.update((value) => ({ ...value, nombres: 'Editado' }));
    form.submitForm(new Event('submit'));
    expect(received).toHaveBeenCalledWith({
      ...listaUsuarios[0],
      nombres: 'Editado',
    });
    expect(listaUsuarios[0]).toEqual(original);
    await harness.fixture.whenStable();
    expect((await TestBed.inject(UsuarioService).getById(1))?.nombres).toBe('Editado');
    expect(harness.routeNativeElement!.textContent).toContain('Editado');
  });

  it('actualiza el formulario al navegar entre IDs de tarea y conserva los datos originales', async () => {
    const original = { ...listaTareas[1] };
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas/1', EditarTareasPage);
    const page = await harness.navigateByUrl('/tareas/2', EditarTareasPage);
    await harness.fixture.whenStable();
    const received = vi.spyOn(page, 'onGuardarTarea');
    const form = harness.routeDebugElement!.query(By.directive(TareaForm))
      .componentInstance as TareaForm;
    expect(form.tareaModel()).toEqual(listaTareas[1]);
    form.tareaModel.update((value) => ({ ...value, titulo: 'Editada' }));
    form.submitForm(new Event('submit'));
    expect(received).toHaveBeenCalledWith({ ...listaTareas[1], titulo: 'Editada' });
    expect(listaTareas[1]).toEqual(original);
    await harness.fixture.whenStable();
    expect(await TestBed.inject(TareasService).getById(2)).toEqual({
      ...original,
      titulo: 'Editada',
    });
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('Tareas');
    const titulos = Array.from(harness.routeNativeElement!.querySelectorAll('article h3')).map(
      (titulo) => titulo.textContent,
    );
    expect(titulos).toContain('Editada');
    expect(titulos).not.toContain(original.titulo);
    await harness.navigateByUrl('/tareas/2', EditarTareasPage);
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.querySelector<HTMLInputElement>('#titulo')!.value).toBe(
      'Editada',
    );
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
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')!.textContent).toContain(
      'El usuario tiene tareas asociadas',
    );
    expect(await TestBed.inject(UsuarioService).getById(1)).toBeDefined();
    const tareasService = TestBed.inject(TareasService);
    expect((await tareasService.getAll()).length).toBe(listaTareas.length);
    for (const tarea of await tareasService.getAll()) {
      await tareasService.remove(tarea.id_tarea);
    }
    harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('tbody button')[1].click();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')).toBeNull();
    expect(await TestBed.inject(UsuarioService).getAll()).toEqual([]);
    expect(harness.routeNativeElement!.textContent).toContain('No se encontraron usuarios');
  });

  it('permite editar y eliminar desde las tarjetas de tareas', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/tareas', ListarTareasPage);
    await harness.fixture.whenStable();

    let botones = harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('article button');

    // Editar abre la página de la primera tarea.
    botones[0].click();
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('Editar tarea');

    expect(harness.routeNativeElement!.textContent).toContain('ID: ' + listaTareas[0].id_tarea);

    // Volvemos al listado y eliminamos esa tarea.
    await harness.navigateByUrl('/tareas', ListarTareasPage);
    await harness.fixture.whenStable();

    botones = harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('article button');

    botones[1].click();
    await harness.fixture.whenStable();

    const servicio = TestBed.inject(TareasService);
    const tarea = await servicio.getById(listaTareas[0].id_tarea);

    expect(tarea).toBeUndefined();
    expect(harness.routeNativeElement!.textContent).not.toContain(listaTareas[0].titulo);
  });

  it('no guarda tareas cuando no quedan usuarios', async () => {
    const tareas = TestBed.inject(TareasService);
    for (const tarea of await tareas.getAll()) await tareas.remove(tarea.id_tarea);
    await TestBed.inject(UsuarioService).remove(1);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas/crear', CrearTareasPage);
    harness
      .routeNativeElement!.querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable();
    expect(await tareas.getAll()).toEqual([]);
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')!.textContent).toContain(
      'Creá un usuario antes de agregar tareas',
    );
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('Crear tarea');
  });

  it('crea tareas con un usuario existente después de eliminar al creador inicial', async () => {
    const tareas = TestBed.inject(TareasService);
    const usuarios = TestBed.inject(UsuarioService);
    await usuarios.add({
      username: 'otro',
      nombres: listaUsuarios[0].nombres,
      apellidos: listaUsuarios[0].apellidos,
      fecha_nacimiento: listaUsuarios[0].fecha_nacimiento,
      grupos: listaUsuarios[0].grupos,
      password: 'Prueba123',
    });
    for (const tarea of await tareas.getAll()) await tareas.remove(tarea.id_tarea);
    await usuarios.remove(1);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas/crear', CrearTareasPage);
    const titulo = harness.routeNativeElement!.querySelector<HTMLInputElement>('#titulo')!;
    titulo.value = 'Tarea del nuevo creador';
    titulo.dispatchEvent(new Event('input', { bubbles: true }));
    harness
      .routeNativeElement!.querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable();
    const guardadas = await tareas.getAll();
    expect(guardadas).toHaveLength(1);
    expect(guardadas[0].id_creador).toBe(2);
    expect(await usuarios.getById(guardadas[0].id_creador)).toBeDefined();
    expect(harness.routeNativeElement!.textContent).toContain('Tarea del nuevo creador');
    expect(harness.routeNativeElement!.textContent).toContain('Creador: 2');
  });

  it('redirige rutas desconocidas de tareas y muestra NotFound fuera de tareas', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas/ruta/desconocida', ListarTareasPage);
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('Tareas');
    await harness.navigateByUrl('/no-existe', NotFoundPage);
    expect(harness.routeNativeElement!.textContent).toContain('Página no encontrada');
  });
});
