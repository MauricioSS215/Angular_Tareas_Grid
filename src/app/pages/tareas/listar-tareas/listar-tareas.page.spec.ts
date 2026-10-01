import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarTareasPage } from './listar-tareas.page';
import { provideRouter } from '@angular/router';

describe('ListarTareasPage', () => {
  let component: ListarTareasPage;
  let fixture: ComponentFixture<ListarTareasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarTareasPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarTareasPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
