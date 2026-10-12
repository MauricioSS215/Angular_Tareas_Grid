import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioForm } from './usuario.form';

describe('UsuarioForm', () => {
  let component: UsuarioForm;
  let fixture: ComponentFixture<UsuarioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioForm],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('usuario', {
      id_usuario: 0,
      username: '',
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      nombre_completo: '',
      grupos: ['user'],
      activo: true,
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
