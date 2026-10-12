export type Grupo = 'user' | 'admin' | 'superadmin';

export type Usuario = {
  id_usuario: number;
  username: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  grupos: Grupo[];
  activo: boolean;
};