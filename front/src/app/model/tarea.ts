export type Grupo = 'user' | 'admin' | 'superadmin';
export type Prioridad = '0:baja' | '1:media' | '2:alta';

export type Tarea = {
  id_tarea: number;
  id_creador: number;
  grupo: Grupo;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  creada: string;
  terminada: string | null;
  estado: 'Abierta' | 'Cerrada';
};
