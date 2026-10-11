import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearTareasPage } from './crear-tareas.page';
import { provideRouter } from '@angular/router';

describe('CrearTareasPage', () => {
  let component: CrearTareasPage;
  let fixture: ComponentFixture<CrearTareasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTareasPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearTareasPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
