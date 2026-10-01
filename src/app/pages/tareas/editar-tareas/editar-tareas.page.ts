import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Tarea } from '../../../model/tarea';
import { listaTareas } from '../../../model/listaTareas';
import { TareaForm } from '../../../components/tarea/tarea.form';

@Component({
  imports: [TareaForm, RouterLink],
  selector: 'app-editar-tareas',
  templateUrl: './editar-tareas.page.html',
})
export class EditarTareasPage implements OnDestroy {
  private route = inject(ActivatedRoute);
  public tarea = signal<Tarea | undefined>(undefined);

  // Al abrir la página o cambiar el ID, buscamos el registro en la lista.
  private parametros = this.route.paramMap.subscribe((params) => {
    const id = Number(params.get('id_tarea'));
    const tareaEncontrada = listaTareas.find((item) => item.id_tarea === id);
    this.tarea.set(tareaEncontrada);
  });

  public onGuardarTarea(tarea: Tarea) {
    console.log('EditarTareasPage recibió:', tarea);
  }

  ngOnDestroy() {
    this.parametros.unsubscribe();
  }
}
