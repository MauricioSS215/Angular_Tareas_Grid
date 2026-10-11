import { Tarea } from './tarea';

export const listaTareas: Tarea[] = [
  {
    id_tarea: 1,
    id_creador: 1,
    grupo: 'user',
    titulo: 'Lavar la cocina',
    descripcion: 'Lavar todo, platos, vasos, cubiertos, de la cocina..',
    prioridad: '2:alta',
    creada: '2026-09-23T15:00:00Z',
    terminada: null,
    estado: 'Abierta',
  },
  {
    id_tarea: 2,
    id_creador: 1,
    grupo: 'admin',
    titulo: 'Terminar las tareas de Desa y Redes',
    descripcion: 'Aprovechar la semana UCU para terminar cuanto antes las tareas de Desa y Redes para tener algo de descanso',
    prioridad: '1:media',
    creada: '2026-09-23T15:00:00Z',
    terminada: '2026-09-24T16:00:00Z',
    estado: 'Cerrada',
  },
];
