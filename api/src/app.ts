import * as path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import type { Pool } from "pg";
import { myPool } from "./db/database.ts";
import { UsuariosRepository, type UsuariosRepo } from "./repositories/usuarios-repository.ts";
import { TareasRepository, type TareasRepo } from "./repositories/tareas-repository.ts";
import { transformarErrorPostgres, type PostgresError } from "./errors/response.errors.ts";
import { configurarValidacion } from "./schemas/validator.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type AppOptions = {
  database?: Pool;
  repositories?: { usuarios: UsuariosRepo; tareas: TareasRepo };
  jwtSecret?: string;
  corsOrigins?: string[];
};

// Rechazar campos desconocidos; no descartarlos silenciosamente.
export const options: FastifyServerOptions = {
  ajv: { customOptions: { removeAdditional: false } },
};

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts) => {
  configurarValidacion(fastify);
  const pool = opts.database ?? myPool;
  fastify.decorate("usuariosRepo", opts.repositories?.usuarios ?? new UsuariosRepository(pool));
  fastify.decorate("tareasRepo", opts.repositories?.tareas ?? new TareasRepository(pool));
  if (!opts.database && !opts.repositories) {
    fastify.addHook("onClose", async () => { await pool.end(); });
  }

  fastify.setErrorHandler((error, request, reply) => {
    let err = error as PostgresError;
    if (err.code && /^[0-9A-Z]{5}$/.test(err.code)) {
      err = transformarErrorPostgres(err) as PostgresError;
    }
    const statusCode = err.validation ? 400 : (err.statusCode ?? 500);
    const titles: Record<number, string> = {
      400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
      404: "Not Found", 409: "Conflict", 500: "Internal Server Error",
    };
    if (statusCode >= 500) request.log.error({ err: error }, "Error al procesar la petición");
    return reply.code(statusCode).send({
      statusCode,
      error: titles[statusCode] ?? "Error",
      message: statusCode >= 500 ? "No se pudo completar la operación."
        : err.validation ? "Los parámetros o el cuerpo de la petición no son válidos." : err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  });

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: opts,
    forceESM: true,
  });
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    forceESM: true,
  });
};

declare module "fastify" {
  interface FastifyInstance {
    usuariosRepo: UsuariosRepo;
    tareasRepo: TareasRepo;
  }
}
export default app;
export { app };
