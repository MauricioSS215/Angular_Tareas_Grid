import { Tarea } from '../model/tarea';
import { listaTareas } from '../model/listaTareas';
import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Service()
export class TareasService {
  private baseUrl = environment.apiUrl + '/tareas';

  private _httpClient = inject(HttpClient);

  private tareas: Tarea[] = listaTareas.map((tarea) => ({ ...tarea }));

  public async getAll(): Promise<Tarea[]> {
    return await firstValueFrom(this._httpClient.get<Tarea[]>(this.baseUrl));
  }

  public async getById(id: number): Promise<Tarea> {
    return await firstValueFrom(this._httpClient.get<Tarea>(`${this.baseUrl}/${id}`));
  }

  public async add(tarea: Tarea): Promise<void> {
    const id_tarea = Math.max(0, ...this.tareas.map((item) => item.id_tarea)) + 1;

    this.tareas.push({
      ...tarea,
      id_tarea,
      creada: new Date().toISOString(),
      terminada: null,
      estado: 'Abierta',
    });
  }

  public async update(id_tarea: number, tarea: Tarea): Promise<void> {
    const indice = this.tareas.findIndex((item) => item.id_tarea === id_tarea);

    if (indice === -1) {
      throw new Error('Tarea no encontrada');
    }

    this.tareas[indice] = {
      ...this.tareas[indice],
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      grupo: tarea.grupo,
      prioridad: tarea.prioridad,
    };
  }

  public async remove(id_tarea: number): Promise<void> {
    this.tareas = this.tareas.filter((tarea) => tarea.id_tarea !== id_tarea);
  }
}
