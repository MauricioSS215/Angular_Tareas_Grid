import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";
import {
  TareaSchema,
  TareaParamsSchema,
  CrearTareaBodySchema,
  ActualizarTareaBodySchema,
  FinalizarTareaBodySchema,
} from "../../schemas/tareas-schema.ts";
import {
  RespuestasError,
  SeguridadBearer,
  SinContenidoSchema,
} from "../../schemas/shared.ts";

const tareasRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  //fastify.addHook("onRequest", fastify.authenticate);

  fastify.get(
    "/",
    {
      schema: {
        tags: ["tareas"],
        summary: "Consultar todas las tareas",
        description:
          "Cualquier usuario autenticado puede consultar la lista global.",
        security: SeguridadBearer,
        response: { 200: Type.Array(TareaSchema), ...RespuestasError },
      },
    },
    async () => fastify.tareasRepo.obtenerTodas(),
  );

  fastify.get(
    "/:id_tarea",
    {
      schema: {
        tags: ["tareas"],
        summary: "Consultar una tarea",
        security: SeguridadBearer,
        params: TareaParamsSchema,
        response: { 200: TareaSchema, ...RespuestasError },
      },
    },
    async (request) => fastify.tareasRepo.obtenerPorId(request.params.id_tarea),
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.isAdmin],
      schema: {
        tags: ["tareas"],
        summary: "Crear una tarea",
        description:
          "Solo admin o superadmin. El creador se toma de la identidad autenticada.",
        security: SeguridadBearer,
        body: CrearTareaBodySchema,
        response: { 201: TareaSchema, ...RespuestasError },
      },
    },
    async (request, reply) => {
      const tarea = await fastify.tareasRepo.crear(
        request.user.id_usuario,
        request.body,
      );
      return reply
        .code(201)
        .header("Location", `/tareas/${tarea.id_tarea}`)
        .send(tarea);
    },
  );

  fastify.patch(
    "/:id_tarea",
    {
      schema: {
        tags: ["tareas"],
        summary: "Editar una tarea",
        params: TareaParamsSchema,
        body: ActualizarTareaBodySchema,
        response: { 200: TareaSchema, ...RespuestasError },
      },
    },
    async (request) =>
      fastify.tareasRepo.actualizar(request.params.id_tarea, request.body),
  );

  fastify.patch(
    "/:id_tarea/finalizacion",
    {
      preHandler: [fastify.puedeFinalizarTarea],
      schema: {
        tags: ["tareas"],
        summary: "Finalizar una tarea",
        description:
          "Requiere pertenecer al grupo destinatario. Enviar {} para usar la hora actual, o una fecha terminada. Una tarea cerrada devuelve 409.",
        security: SeguridadBearer,
        params: TareaParamsSchema,
        body: FinalizarTareaBodySchema,
        response: { 200: TareaSchema, ...RespuestasError },
      },
    },
    async (request) =>
      fastify.tareasRepo.finalizar(
        request.params.id_tarea,
        request.user,
        request.body.terminada,
      ),
  );

  fastify.delete(
    "/:id_tarea",
    {
      preHandler: [fastify.esCreadorTarea],
      schema: {
        tags: ["tareas"],
        summary: "Eliminar una tarea propia",
        description:
          "Exclusivamente el creador. Superadmin no puede borrar tareas ajenas.",
        security: SeguridadBearer,
        params: TareaParamsSchema,
        response: { 204: SinContenidoSchema, ...RespuestasError },
      },
    },
    async (request, reply) => {
      await fastify.tareasRepo.eliminar(
        request.params.id_tarea,
        request.user.id_usuario,
      );
      return reply.code(204).send(null);
    },
  );
};
export default tareasRoutes;
