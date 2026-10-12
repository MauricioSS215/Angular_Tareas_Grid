import { Tarea } from '../../../model/tarea';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TareasService } from '../../../services/tareas.service';
import { TareaCard } from '../../../components/tarea/tarea.card';
@Component({
  imports: [TareaCard, RouterLink],
  selector: 'app-crear-tareas',
  styleUrl: './crear-tareas.page.css',
  templateUrl: './crear-tareas.page.html',
})

export class CrearTareasPage {

  public tareaVacia: Tarea = {
  id_tarea: 0,
  id_creador: 1,
  grupo: 'user',
  titulo: '',
  descripcion: '',
  prioridad: '1:media',
  creada: '',
  terminada: null,
  estado: 'Abierta',
};
  private tareasService = inject(TareasService);
  private router = inject(Router);

  public async onGuardarTarea(tarea: Tarea) {
    await this.tareasService.add(tarea);
    await this.router.navigate(['/tareas']);
  }
}