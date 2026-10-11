import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { LoginSchema, PayloadSchema, TokenSchema } from "../../schemas/usuarios-schema.ts";
import { RespuestasError, SeguridadBearer } from "../../schemas/shared.ts";

const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post("/login", {
    schema: {
      tags: ["auth"], summary: "Iniciar sesión",
      body: LoginSchema,
      response: { 200: TokenSchema, ...RespuestasError },
    },
  }, async (request) => {
    const identidad = await fastify.usuariosRepo.verificarCredenciales(request.body.username, request.body.password);
    return { token: fastify.jwt.sign(identidad) };
  });

  fastify.get("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["auth"], summary: "Obtener identidad y grupos actuales",
      security: SeguridadBearer,
      response: { 200: PayloadSchema, ...RespuestasError },
    },
  }, async request => request.user);
};
export default authRoutes;
