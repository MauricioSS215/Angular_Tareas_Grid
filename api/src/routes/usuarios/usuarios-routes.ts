import { Type, type FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { UsuarioSchema, UsuarioParamsSchema, CrearUsuarioSchema, ActualizarUsuarioSchema } from "../../schemas/usuarios-schema.ts";
import { RespuestasError, SeguridadBearer, SinContenidoSchema } from "../../schemas/shared.ts";

const usuariosRoutes: FastifyPluginAsyncTypebox = async fastify => {
  //fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", {
    //preHandler: [fastify.isAdmin],
    schema: {
      tags: ["usuarios"], summary: "Listar usuarios (admin o superadmin)",
      security: SeguridadBearer, response: { 200: Type.Array(UsuarioSchema), ...RespuestasError },
    },
  }, async () => fastify.usuariosRepo.obtenerTodos());

  fastify.get("/:id_usuario", {
    //preHandler: [fastify.puedeConsultarUsuario],
    schema: {
      tags: ["usuarios"], summary: "Consultar perfil propio o, como administrador, otro perfil",
      security: SeguridadBearer, params: UsuarioParamsSchema,
      response: { 200: UsuarioSchema, ...RespuestasError },
    },
  }, async request => fastify.usuariosRepo.obtenerPorId(request.params.id_usuario));

  fastify.post("/", {
    //preHandler: [fastify.isSuperAdmin],
    schema: {
      tags: ["usuarios"], summary: "Crear usuario y credenciales (superadmin)",
      security: SeguridadBearer, body: CrearUsuarioSchema,
      response: { 201: UsuarioSchema, ...RespuestasError },
    },
  }, async (request, reply) => {
    const usuario = await fastify.usuariosRepo.crear(request.body);
    return reply.code(201).header("Location", `/usuarios/${usuario.id_usuario}`).send(usuario);
  });

  fastify.patch("/:id_usuario", {
    //preHandler: [fastify.puedeEditarUsuario],
    schema: {
      tags: ["usuarios"], summary: "Editar perfil",
      description: "Cada usuario puede editar sus datos personales. Solo superadmin puede editar otros perfiles o cambiar grupos y activo.",
      security: SeguridadBearer, params: UsuarioParamsSchema, body: ActualizarUsuarioSchema,
      response: { 200: UsuarioSchema, ...RespuestasError },
    },
  }, async request => fastify.usuariosRepo.actualizar(request.params.id_usuario, request.body));

  fastify.delete("/:id_usuario", {
    //preHandler: [fastify.isSuperAdmin],
    schema: {
      tags: ["usuarios"], summary: "Eliminar usuario (superadmin)",
      description: "Solo superadmin. Si el usuario tiene tareas propias, devuelve 409 para evitar borrarlas indirectamente. Sus credenciales se eliminan en cascada.",
      security: SeguridadBearer, params: UsuarioParamsSchema,
      response: { 204: SinContenidoSchema, ...RespuestasError },
    },
  }, async (request, reply) => {
    await fastify.usuariosRepo.eliminar(request.params.id_usuario);
    return reply.code(204).send(null);
  });
};
export default usuariosRoutes;
