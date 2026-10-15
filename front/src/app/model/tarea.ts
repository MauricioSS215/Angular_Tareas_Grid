import { Grupo } from './usuario';
export type Prioridad = '0:baja' | '1:media' | '2:alta';

export type Tarea = {
  id_tarea: number;
  id_creador: number;
  grupo: Grupo;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  creada: string;
  terminada: string | null;
  estado: 'Abierta' | 'Cerrada';
};

export type ActualizarTareaDTO = {
  titulo?: string;
  descripcion?: string | null;
  grupo?: Grupo;
  prioridad?: Prioridad;
};

export type CrearTareaDTO = {
  titulo: string;
  grupo: Grupo;
  descripcion?: string | null;
  prioridad?: Prioridad;
};