import { Ajv, type AnySchema } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyInstance } from "fastify";

export function configurarValidacion(fastify: FastifyInstance): void {
  // Convertir IDs de URL a número, pero preservar exactamente los tipos del JSON.
  // La coerción por defecto convertía descripcion:null en "" en las uniones.
  const body = new Ajv({ coerceTypes: false, removeAdditional: false, strict: false });
  const parametros = new Ajv({ coerceTypes: "array", removeAdditional: false, strict: false });
  addFormats.default(body);
  addFormats.default(parametros);
  fastify.setValidatorCompiler(({ schema, httpPart }) =>
    (httpPart === "body" ? body : parametros).compile(schema as AnySchema));
}
