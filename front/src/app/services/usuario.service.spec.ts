import { TestBed } from '@angular/core/testing';
import { UsuarioService } from './usuario.service';
import { TareasService } from './tareas.service';

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioService);
  });

  it('impide borrar un creador incluso si sus tareas están cerradas', async () => {
    const tareas = TestBed.inject(TareasService);
    await tareas.remove(1);
    await expect(service.remove(1)).rejects.toThrow('El usuario tiene tareas asociadas');
    expect(await service.getById(1)).toBeDefined();
    expect(await tareas.getById(2)).toBeDefined();
    await tareas.remove(2);
    await service.remove(1);
    expect(await service.getById(1)).toBeUndefined();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
