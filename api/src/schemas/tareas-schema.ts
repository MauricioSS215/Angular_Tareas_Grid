import { Type, type Static } from "@fastify/type-provider-typebox";
import { GrupoSchema } from "./usuarios-schema.ts";

export const PrioridadSchema = Type.Union([
  Type.Literal("0:baja"), Type.Literal("1:media"), Type.Literal("2:alta"),
]);
const TituloSchema = Type.String({ minLength: 1, maxLength: 100, pattern: "\\S" });
const DescripcionSchema = Type.Union([Type.String(), Type.Null()]);

export const TareaSchema = Type.Object({
  id_tarea: Type.Integer({ minimum: 1 }),
  id_creador: Type.Integer({ minimum: 1 }),
  grupo: GrupoSchema,
  titulo: Type.String(),
  descripcion: DescripcionSchema,
  prioridad: PrioridadSchema,
  creada: Type.String({ format: "date-time" }),
  terminada: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  estado: Type.Union([Type.Literal("Abierta"), Type.Literal("Cerrada")]),
}, { additionalProperties: false });

export const TareaParamsSchema = Type.Object({
  id_tarea: Type.Integer({ minimum: 1, maximum: 2147483647 }),
}, { additionalProperties: false });

export const CrearTareaBodySchema = Type.Object({
  grupo: GrupoSchema,
  titulo: TituloSchema,
  descripcion: Type.Optional(DescripcionSchema),
  prioridad: Type.Optional(PrioridadSchema),
}, {
  additionalProperties: false,
  examples: [{ grupo: "user", titulo: "Preparar el frontend", prioridad: "1:media" }],
});
export const ActualizarTareaBodySchema = Type.Partial(Type.Object({
  grupo: GrupoSchema,
  titulo: TituloSchema,
  descripcion: DescripcionSchema,
  prioridad: PrioridadSchema,
}), { additionalProperties: false, minProperties: 1 });

// La fecha es opcional. Si se omite, PostgreSQL utiliza CURRENT_TIMESTAMP.
export const FinalizarTareaBodySchema = Type.Object({
  terminada: Type.Optional(Type.String({ format: "date-time" })),
}, { additionalProperties: false, examples: [{}] });

export type Tarea = Static<typeof TareaSchema>;
export type TareaParams = Static<typeof TareaParamsSchema>;
export type CrearTareaDTO = Static<typeof CrearTareaBodySchema>;
export type ActualizarTareaDTO = Static<typeof ActualizarTareaBodySchema>;
