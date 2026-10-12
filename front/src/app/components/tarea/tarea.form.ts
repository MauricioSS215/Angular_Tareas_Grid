import { Component, Input, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { Tarea } from '../../model/tarea';

@Component({
  imports: [FormField, JsonPipe],
  selector: 'app-tarea-form',
  templateUrl: './tarea.form.html',
})
export class TareaForm {
  public tareaModel = signal<Tarea & { descripcion: string }>({
    id_tarea: 0,
    id_creador: 1,
    grupo: 'user',
    titulo: '',
    descripcion: '',
    prioridad: '0:baja',
    creada: '',
    terminada: null,
    estado: 'Abierta',
  });

  public tareaForm = form(this.tareaModel);
  public guardarTarea = output<Tarea>();

  // En edición, la página envía los datos que debe mostrar el formulario.
  @Input()
  set tareaInicial(tarea: Tarea) {
    this.tareaModel.set({
      ...tarea,
      descripcion: tarea.descripcion ?? '',
    });
  }

  public submitForm(event: Event) {
    event.preventDefault();
    this.guardarTarea.emit(this.tareaForm().value());
  }
}
