import { Type } from "@fastify/type-provider-typebox";

export const ErrorSchema = Type.Object({
  statusCode: Type.Integer(),
  error: Type.String(),
  message: Type.String(),
  code: Type.Optional(Type.String()),
});
export const RespuestasError = {
  400: ErrorSchema, 401: ErrorSchema, 403: ErrorSchema,
  404: ErrorSchema, 409: ErrorSchema, 500: ErrorSchema,
};
export const SeguridadBearer = [{ bearerAuth: [] as string[] }];
export const SinContenidoSchema = Type.Null();
