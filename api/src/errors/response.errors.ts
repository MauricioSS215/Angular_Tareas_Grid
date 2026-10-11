import createError from "@fastify/error";

export const BadRequestError = createError("BADREQUEST", "Solicitud incorrecta. %s", 400);
export const UnAuthenticatedError = createError("UNAUTHENTICATED", "%s", 401);
export const ForbiddenError = createError("FORBIDDEN", "%s", 403);
export const NotFoundError = createError("NOTFOUND", "%s", 404);
export const ConflictError = createError("CONFLICT", "%s", 409);
export const InternalError = createError("INTERNAL", "No se pudo completar la operación.", 500);

export interface PostgresError extends Error {
  code?: string;
  statusCode?: number;
  validation?: unknown;
}

// Adaptación del traductor proporcionado por el profesor.
export function transformarErrorPostgres(error: PostgresError): Error & { statusCode: number } {
  switch (error.code) {
    case "23502":
    case "23514":
    case "22001":
    case "22007":
    case "22008":
    case "22P02":
      return new BadRequestError("Los datos no cumplen las restricciones de la base de datos.");
    case "23503":
      return new ConflictError("La operación afecta registros vinculados o un usuario inexistente.");
    case "23505":
      return new ConflictError("Ya existe un registro con esos datos únicos.");
    default:
      return new InternalError();
  }
}
