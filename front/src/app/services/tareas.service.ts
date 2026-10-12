import { Service } from '@angular/core';
import { Tarea } from '../model/tarea';
import { listaTareas } from '../model/listaTareas';

@Service()
export class TareasService {
  private tareas: Tarea[] = listaTareas.map(tarea => ({ ...tarea }));

  public async obtenerTareas(): Promise<Tarea[]> {
    return [...this.tareas];
  }

  public async getById(id_tarea: number): Promise<Tarea | undefined> {
    return this.tareas.find(tarea => tarea.id_tarea === id_tarea);
  }

  public async add(tarea: Tarea): Promise<void> {
    const id_tarea =
      Math.max(0, ...this.tareas.map(item => item.id_tarea)) + 1;

    this.tareas.push({
      ...tarea,
      id_tarea,
      creada: new Date().toISOString(),
      terminada: null,
      estado: 'Abierta',
    });
  }

  public async update(id_tarea: number, tarea: Tarea): Promise<void> {
    const indice = this.tareas.findIndex(
      item => item.id_tarea === id_tarea
    );

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
    this.tareas = this.tareas.filter(
      tarea => tarea.id_tarea !== id_tarea
    );
  }
}