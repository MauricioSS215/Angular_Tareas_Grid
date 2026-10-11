import cors from "@fastify/cors";
import fp from "fastify-plugin";
import type { AppOptions } from "../app.ts";

export default fp<AppOptions>(async (fastify, opts) => {
  const origins = opts.corsOrigins ??
    (process.env.CORS_ORIGINS ?? "http://localhost:4200,http://127.0.0.1:4200")
      .split(",").map(origin => origin.trim()).filter(Boolean);
  await fastify.register(cors, {
    origin: origins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Location"],
  });
});
