import createError from "@fastify/error";

export const PeticionInvalidaError = createError(
  "UCU_0001",
  "Petición inválida: %s",
  400,
  Error,
);

export const NoAutorizadoError = createError(
  "UCU_0002",
  "No autorizado: %s",
  401,
  Error,
);

export const ProhibidoError = createError(
  "UCU_0003",
  "El usuario %s no tiene permiso para acceder al recurso del usuario %s",
  403,
  Error,
);

export const UsuarioNoEncontradoError = createError(
  "UCU_0004",
  "No se encontró el usuario: %s",
  404,
  Error,
);

export const UsuarioDuplicadoError = createError(
  "UCU_0005",
  "El usuario '%s' ya existe",
  409,
  Error,
);

export const SoloAdministradorError = createError(
  "UCU_0006",
  "El usuario %s no posee permisos de administrador",
  403,
  Error,
);

export const ModificacionAdminNoPermitidaError = createError(
  "UCU_0007",
  "El usuario %s no puede modificar sus permisos de administrador",
  403,
  Error
);
