import { Service } from '@angular/core';
import { Tarea } from '../model/tarea';
import { listaTareas } from '../model/listaTareas';

@Service()
export class TareasService {
    public tareas: Tarea [] = listaTareas;

    public obtenerTareas(): Tarea[] {
        return this.tareas;
    }
}