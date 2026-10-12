import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Parcial 1 API REST 2026 - Gestión de tareas",
        description: "Autenticación JWT y permisos por grupos y autoría. El estado de las tareas lo calcula PostgreSQL.",
        version: "1.0.0",
      },
      tags: [
        { name: "auth", description: "Inicio de sesión e identidad actual" },
        { name: "tareas", description: "Gestión global de tareas" },
        { name: "usuarios", description: "Perfil y administración de usuarios" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });
  await fastify.register(swaggerUi, { routePrefix: "/docs" });
});
