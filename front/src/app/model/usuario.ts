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

export type CrearUsuarioDTO = {
  username: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  grupos?: Grupo[];
  password: string;
};

export type ActualizarUsuarioDTO = {
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  grupos?: Grupo[];
  activo?: boolean;
};

export type UsuarioFormulario = Usuario & {
  password: string;
};

export type UsuarioLogueado = {
  id_usuario: number;
  username: string;
  grupos: Grupo[];
};