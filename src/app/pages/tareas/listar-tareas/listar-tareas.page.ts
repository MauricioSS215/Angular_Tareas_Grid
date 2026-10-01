import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Tarea } from '../../../model/tarea';
import { listaTareas } from '../../../model/listaTareas';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-listar-tareas',
  styleUrl: './listar-tareas.page.css',
  templateUrl: './listar-tareas.page.html',
})
export class ListarTareasPage {
  public tareas: Tarea[] = listaTareas;

  public finalizarTarea(tarea: Tarea) {
    // En la API, "estado" se calculará a partir de "terminada".
    console.log('Finalizar tarea (ejemplo sin persistencia):', {
      id_tarea: tarea.id_tarea,
      terminada: new Date().toISOString(),
    });
  }

  public eliminarTarea(tarea: Tarea) {
    console.log('Eliminar tarea (ejemplo sin persistencia):', tarea);
  }
}
