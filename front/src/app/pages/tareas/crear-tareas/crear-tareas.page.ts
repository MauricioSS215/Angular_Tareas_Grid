import { Tarea } from '../../../model/tarea';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TareasService } from '../../../services/tareas.service';
import { TareaCard } from '../../../components/tarea/tarea.card';
import { UsuarioService } from '../../../services/usuario.service';
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
  private usuarioService = inject(UsuarioService);
  public errorGuardar = signal('');

  public async onGuardarTarea(tarea: Tarea) {
    this.errorGuardar.set('');
    const usuarios = await this.usuarioService.getAll();
    if (usuarios.length === 0) {
      this.errorGuardar.set('Creá un usuario antes de agregar tareas.');
      return;
    }
    // Sin login, el primer usuario disponible es el creador de ejemplo.
    await this.tareasService.add({ ...tarea, id_creador: usuarios[0].id_usuario });
    await this.router.navigate(['/tareas']);
  }
}