import { Type, type FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

const root: FastifyPluginAsyncTypebox = async fastify => {
  fastify.get("/", {
    schema: {
      summary: "Información de la API",
      response: { 200: Type.Object({ api: Type.String(), docs: Type.String() }) },
    },
  }, async () => ({ api: "Parcial 1 API REST 2026", docs: "/docs" }));
};
export default root;
