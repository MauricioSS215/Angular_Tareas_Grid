import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tarea } from '../../../model/tarea';
import { TareaForm } from '../../../components/tarea/tarea.form';

@Component({
  imports: [TareaForm, RouterLink],
  selector: 'app-crear-tareas',
  styleUrl: './crear-tareas.page.css',
  templateUrl: './crear-tareas.page.html',
})
export class CrearTareasPage {
  public onGuardarTarea(tarea: Tarea) {
    console.log('CrearTareasPage recibió:', tarea);
  }
}
