import fp from "fastify-plugin";
import type { FastifyRequest, preHandlerAsyncHookHandler } from "fastify";
import { ForbiddenError } from "../errors/response.errors.ts";
import type { TareaParams } from "../schemas/tareas-schema.ts";
import type { ActualizarUsuarioDTO, UsuarioParams } from "../schemas/usuarios-schema.ts";

// Estos decoradores se ejecutan en preHandler: JWT y schemas ya fueron validados.
export default fp(async fastify => {
  fastify.decorate("isAdmin", async (request: FastifyRequest) => {
    if (!request.user.grupos.some(grupo => grupo === "admin" || grupo === "superadmin")) {
      throw new ForbiddenError("Se requiere el grupo admin o superadmin.");
    }
  });

  fastify.decorate("isSuperAdmin", async (request: FastifyRequest) => {
    if (!request.user.grupos.includes("superadmin")) {
      throw new ForbiddenError("Se requiere el grupo superadmin.");
    }
  });

  fastify.decorate("puedeEditarTarea", async (request: FastifyRequest) => {
    const { id_tarea } = request.params as TareaParams;
    const tarea = await fastify.tareasRepo.obtenerPorId(id_tarea);
    if (tarea.id_creador !== request.user.id_usuario && !request.user.grupos.includes("superadmin")) {
      throw new ForbiddenError("Solo el creador o un superadmin puede editar la tarea.");
    }
  });

  fastify.decorate("puedeFinalizarTarea", async (request: FastifyRequest) => {
    const { id_tarea } = request.params as TareaParams;
    const tarea = await fastify.tareasRepo.obtenerPorId(id_tarea);
    if (!request.user.grupos.includes(tarea.grupo)) {
      throw new ForbiddenError("No pertenece al grupo destinatario de esta tarea.");
    }
  });

  fastify.decorate("esCreadorTarea", async (request: FastifyRequest) => {
    const { id_tarea } = request.params as TareaParams;
    const tarea = await fastify.tareasRepo.obtenerPorId(id_tarea);
    if (tarea.id_creador !== request.user.id_usuario) {
      throw new ForbiddenError("Solo el creador puede eliminar la tarea.");
    }
  });

  fastify.decorate("puedeConsultarUsuario", async (request: FastifyRequest) => {
    const { id_usuario } = request.params as UsuarioParams;
    if (request.user.id_usuario !== id_usuario &&
      !request.user.grupos.some(grupo => grupo === "admin" || grupo === "superadmin")) {
      throw new ForbiddenError("Solo puede consultar su propio perfil.");
    }
  });

  fastify.decorate("puedeEditarUsuario", async (request: FastifyRequest) => {
    const { id_usuario } = request.params as UsuarioParams;
    const dto = request.body as ActualizarUsuarioDTO;
    const superadmin = request.user.grupos.includes("superadmin");
    if (!superadmin && (id_usuario !== request.user.id_usuario ||
      dto.grupos !== undefined || dto.activo !== undefined)) {
      throw new ForbiddenError("No puede modificar otros perfiles, grupos o el estado de la cuenta.");
    }
  });
}, { name: "authorization", dependencies: ["jwt-authentication"] });

declare module "fastify" {
  interface FastifyInstance {
    isAdmin: preHandlerAsyncHookHandler;
    isSuperAdmin: preHandlerAsyncHookHandler;
    puedeEditarTarea: preHandlerAsyncHookHandler;
    puedeFinalizarTarea: preHandlerAsyncHookHandler;
    esCreadorTarea: preHandlerAsyncHookHandler;
    puedeConsultarUsuario: preHandlerAsyncHookHandler;
    puedeEditarUsuario: preHandlerAsyncHookHandler;
  }
}
