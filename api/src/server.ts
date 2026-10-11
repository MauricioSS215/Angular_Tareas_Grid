import Fastify from "fastify";
import app, { options } from "./app.ts";

// Permite al autoload cargar los .ts en desarrollo con Node.js 24.
process.env.FASTIFY_AUTOLOAD_TYPESCRIPT = "1";
const server = Fastify({
  ...options,
  logger: {
    level: process.env.FASTIFY_LOG_LEVEL ?? "info",
    redact: ["req.headers.authorization", "password", "password_hash"],
  },
});
try {
  await server.register(app);
  const port = Number(process.env.FASTIFY_PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("FASTIFY_PORT debe ser un puerto válido.");
  await server.listen({ port, host: process.env.FASTIFY_HOST ?? "127.0.0.1" });
} catch (error) {
  server.log.error(error);
  await server.close();
  process.exitCode = 1;
}
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void server.close().then(() => { process.exitCode = 0; });
  });
}
