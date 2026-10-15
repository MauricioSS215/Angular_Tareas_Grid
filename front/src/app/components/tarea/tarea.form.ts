import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, required, maxLength, pattern } from '@angular/forms/signals';
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

  public tareaForm = form(this.tareaModel, (path) => {
    required(path.titulo, {
      message: 'El título es obligatorio',
    });

    maxLength(path.titulo, 100, {
      message: 'El título no puede superar los 100 caracteres',
    });

    pattern(path.titulo, /\S/, {
      message: 'El título no puede contener solo espacios',
    });
  });

  public guardarTarea = output<Tarea>();

  public submitForm(event: Event) {
    event.preventDefault();

    if (this.tareaForm().invalid()) {
      return;
    }

    this.guardarTarea.emit(this.tareaForm().value());
  }
}
