import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { Tarea } from '../../model/tarea';

@Component({
  imports: [FormField, JsonPipe],
  selector: 'app-tarea-form',
  templateUrl: './tarea.form.html',
  styleUrl: './tarea.form.css',
})
export class TareaForm {
  public tarea = input.required<Tarea>();
  public tareaModel = linkedSignal(() => ({
    ...this.tarea(),
    descripcion: this.tarea().descripcion ?? '',
  }));
  public tareaForm = form(this.tareaModel);
  public guardarTarea = output<Tarea>();

  public submitForm(event: Event) {
    event.preventDefault();
    this.guardarTarea.emit(this.tareaForm().value());
  }
}
