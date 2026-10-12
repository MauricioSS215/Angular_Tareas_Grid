import { Component, resource, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TareaCard } from '../../../components/tarea/tarea.card';
import { TareasService } from '../../../services/tareas.service';

@Component({
  imports: [RouterLink, TareaCard],
  selector: 'app-listar-tareas',
  styleUrl: './listar-tareas.page.css',
  templateUrl: './listar-tareas.page.html',
})
export class ListarTareasPage {
  private router = inject(Router);
  private tareasService = inject(TareasService);

  public tareaResource = resource({
    defaultValue: [],
    params: () => ({}),
    loader: () => this.tareasService.obtenerTareas(),
  });

  public editarTarea(id_tarea: number) {
    this.router.navigate(['/tareas', id_tarea]);
  }

  public async eliminarTarea(id_tarea: number) {
    await this.tareasService.remove(id_tarea);
    this.tareaResource.reload();
  }
}