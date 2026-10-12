import { Component, computed, inject, input, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Tarea } from '../../../model/tarea';
import { TareasService } from '../../../services/tareas.service';
import { TareaCard } from '../../../components/tarea/tarea.card';

@Component({
  imports: [TareaCard, RouterLink],
  selector: 'app-editar-tareas',
  templateUrl: './editar-tareas.page.html',
})
export class EditarTareasPage {
  public id_tarea = input.required<number, string>({
    transform: value => Number(value),
  });

  private tareasService = inject(TareasService);
  private router = inject(Router);

  public tareaResource = resource({
    params: () => {
      const id_tarea = this.id_tarea();
      if (!id_tarea) return undefined;
      return { id_tarea };
    },
    loader: ({ params }) => {
      return this.tareasService.getById(params.id_tarea);
    },
  });

  public tarea = computed(() => this.tareaResource.value());

  public async onGuardarTarea(tarea: Tarea) {
    await this.tareasService.update(this.id_tarea(), tarea);
    await this.router.navigate(['/tareas']);
  }
}