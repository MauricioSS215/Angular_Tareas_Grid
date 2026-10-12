import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tarea } from '../../model/tarea';
import { TareaForm } from './tarea.form';

@Component({
  selector: 'app-tarea-card',
  imports: [DatePipe, TareaForm],
  templateUrl: './tarea.card.html',
  styleUrl: './tarea.card.css',
})
export class TareaCard {
  public tarea = input.required<Tarea>();
  public editable = input(false);

  public editarTarea = output<number>();
  public eliminarTarea = output<number>();
  public guardarTarea = output<Tarea>();
}
