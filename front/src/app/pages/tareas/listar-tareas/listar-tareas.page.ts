import { Component, resource, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Tarea } from '../../../model/tarea';
import { listaTareas } from '../../../model/listaTareas';
import { TareasService } from '../../../services/tareas.service';
import { Router } from '@angular/router';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-listar-tareas',
  styleUrl: './listar-tareas.page.css',
  templateUrl: './listar-tareas.page.html',
})
export class ListarTareasPage {
  private router = inject(Router);
  public tareasService = inject(TareasService);

  public tareaResource = resource(
    {
      defaultValue: [],
      params: () => {
        return {};
      },
      loader: async () => {
        return this.tareasService.obtenerTareas();
      },
    }
  );
  
  public finalizarTarea(tarea: Tarea) {
    console.log('Finalizar tarea:', tarea);
  }


  public eliminarTarea(tarea: Tarea) {
    console.log('Eliminar tarea (ejemplo sin persistencia):', tarea);
  }
}
