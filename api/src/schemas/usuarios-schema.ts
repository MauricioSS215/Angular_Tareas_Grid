import { Type, type Static } from "@fastify/type-provider-typebox";

export const GrupoSchema = Type.Union([
  Type.Literal("user"),
  Type.Literal("admin"),
  Type.Literal("superadmin"),
]);
const GruposSchema = Type.Array(GrupoSchema, {
  minItems: 1,
  uniqueItems: true,
});
const NombreSchema = Type.String({ minLength: 1, pattern: "\\S" });

export const UsuarioSchema = Type.Object(
  {
    id_usuario: Type.Integer({ minimum: 1 }),
    username: Type.String({ minLength: 3, maxLength: 30 }),
    nombres: Type.String(),
    apellidos: Type.String(),
    fecha_nacimiento: Type.String({ format: "date" }),
    nombre_completo: Type.String(),
    grupos: GruposSchema,
    activo: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const UsuarioParamsSchema = Type.Object(
  {
    id_usuario: Type.Integer({ minimum: 1, maximum: 2147483647 }),
  },
  { additionalProperties: false },
);

export const CrearUsuarioSchema = Type.Object(
  {
    username: Type.String({ minLength: 3, maxLength: 30, pattern: "^\\S+$" }),
    nombres: NombreSchema,
    apellidos: NombreSchema,
    fecha_nacimiento: Type.String({ format: "date" }),
    grupos: Type.Optional(GruposSchema),
    password: Type.String({ minLength: 6, maxLength: 72 }),
  },
  { additionalProperties: false },
);

export const ActualizarUsuarioSchema = Type.Partial(
  Type.Object({
    nombres: NombreSchema,
    apellidos: NombreSchema,
    fecha_nacimiento: Type.String({ format: "date" }),
    grupos: GruposSchema,
    activo: Type.Boolean(),
  }),
  { additionalProperties: false, minProperties: 1 },
);

export const LoginSchema = Type.Object(
  {
    username: Type.String({ minLength: 1, maxLength: 30 }),
    password: Type.String({ minLength: 1 }),
  },
  {
    additionalProperties: false,
    examples: [{ username: "admin", password: "Contraseña1" }],
  },
);

// Nunca incluir password_hash ni datos personales en el token.
export const PayloadSchema = Type.Object(
  {
    id_usuario: UsuarioSchema.properties.id_usuario,
    username: UsuarioSchema.properties.username,
    grupos: GruposSchema,
  },
  { additionalProperties: false },
);
export const TokenSchema = Type.Object({ token: Type.String() });

export const UsuariosQuerySchema = Type.Object(
  {
    page: Type.Integer({ minimum: 1, default: 1 }),
    cantidad: Type.Integer({ minimum: 1, maximum: 100, default: 10 }),
  },
  { additionalProperties: false },
);

export const UsuariosPaginadosSchema = Type.Object(
  {
    usuarios: Type.Array(UsuarioSchema),
    total: Type.Integer({ minimum: 0 }),
    page: Type.Integer({ minimum: 1 }),
    cantidad: Type.Integer({ minimum: 1 }),
    totalPaginas: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

export type Grupo = Static<typeof GrupoSchema>;
export type Usuario = Static<typeof UsuarioSchema>;
export type UsuarioParams = Static<typeof UsuarioParamsSchema>;
export type CrearUsuarioDTO = Static<typeof CrearUsuarioSchema>;
export type ActualizarUsuarioDTO = Static<typeof ActualizarUsuarioSchema>;
export type PayloadDTO = Static<typeof PayloadSchema>;
