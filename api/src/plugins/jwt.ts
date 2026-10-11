import jwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyRequest, FastifyReply } from "fastify";
import type { AppOptions } from "../app.ts";
import type { PayloadDTO } from "../schemas/usuarios-schema.ts";
import { UnAuthenticatedError } from "../errors/response.errors.ts";

export default fp<AppOptions>(async (fastify, opts) => {
  const secret = opts.jwtSecret ?? process.env.FASTIFY_SECRET;
  if (!secret) throw new Error("Falta FASTIFY_SECRET en .env.");
  await fastify.register(jwt, { secret, sign: { expiresIn: "8h" } });

  fastify.decorate("authenticate", async (request: FastifyRequest) => {
    await request.jwtVerify();
    if (!Number.isInteger(request.user.id_usuario) || request.user.id_usuario < 1) {
      throw new UnAuthenticatedError("El token no contiene una identidad válida.");
    }
    // Usar permisos actuales de la base, no grupos potencialmente desactualizados del token.
    let usuario;
    try {
      usuario = await fastify.usuariosRepo.obtenerPorId(request.user.id_usuario);
    } catch (error) {
      if ((error as { code?: string }).code === "NOTFOUND") {
        throw new UnAuthenticatedError("La cuenta ya no existe.");
      }
      throw error;
    }
    if (!usuario.activo) throw new UnAuthenticatedError("La cuenta está desactivada.");
    request.user = { id_usuario: usuario.id_usuario, username: usuario.username, grupos: usuario.grupos };
  });
}, { name: "jwt-authentication" });

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: PayloadDTO;
    payload: PayloadDTO;
  }
}
