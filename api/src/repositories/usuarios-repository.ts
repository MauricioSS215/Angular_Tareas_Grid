import type { Pool } from "pg";
import { myPool } from "../db/database.ts";
import { ConflictError, NotFoundError, UnAuthenticatedError } from "../errors/response.errors.ts";
import type { ActualizarUsuarioDTO, CrearUsuarioDTO, PayloadDTO, Usuario } from "../schemas/usuarios-schema.ts";

// Adaptación del repositorio del profesor: fecha como texto y credenciales separadas.
const columnas = `id_usuario, username, nombres, apellidos,
  fecha_nacimiento::text AS fecha_nacimiento, nombre_completo, grupos, activo`;

export class UsuariosRepository {
  private readonly pool: Pool;
  constructor(pool: Pool = myPool) { this.pool = pool; }

  async obtenerTodos(): Promise<Usuario[]> {
    const result = await this.pool.query<Usuario>(`SELECT ${columnas} FROM usuarios ORDER BY id_usuario`);
    return result.rows;
  }

  async obtenerPorId(idUsuario: number): Promise<Usuario> {
    const result = await this.pool.query<Usuario>(`SELECT ${columnas} FROM usuarios WHERE id_usuario = $1`, [idUsuario]);
    if (!result.rows[0]) throw new NotFoundError("Usuario no encontrado.");
    return result.rows[0];
  }

  async verificarCredenciales(username: string, password: string): Promise<PayloadDTO> {
    const result = await this.pool.query<PayloadDTO>(`
      SELECT u.id_usuario, u.username, u.grupos
      FROM usuarios u JOIN credenciales c ON c.id_usuario = u.id_usuario
      WHERE u.username = $1 AND u.activo = TRUE
        AND c.password_hash = crypt($2, c.password_hash)
    `, [username, password]);
    if (!result.rows[0]) throw new UnAuthenticatedError("Usuario o contraseña incorrectos.");
    return result.rows[0];
  }

  async crear(dto: CrearUsuarioDTO): Promise<Usuario> {
    // BEGIN, INSERT y COMMIT deben usar la misma conexión del pool.
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query<Usuario>(`
        INSERT INTO usuarios (username, nombres, apellidos, fecha_nacimiento, grupos)
        VALUES ($1, $2, $3, $4, COALESCE($5::text[], ARRAY['user']::text[]))
        RETURNING ${columnas}
      `, [dto.username, dto.nombres, dto.apellidos, dto.fecha_nacimiento, dto.grupos]);
      const usuario = result.rows[0]!;
      await client.query(`
        INSERT INTO credenciales (id_usuario, password_hash)
        VALUES ($1, crypt($2, gen_salt('bf')))
      `, [usuario.id_usuario, dto.password]);
      await client.query("COMMIT");
      return usuario;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(idUsuario: number, dto: ActualizarUsuarioDTO): Promise<Usuario> {
    const campos: string[] = [];
    const valores: unknown[] = [];
    // Lista cerrada: los nombres de columnas nunca provienen del cliente.
    for (const campo of ["nombres", "apellidos", "fecha_nacimiento", "grupos", "activo"] as const) {
      if (dto[campo] !== undefined) {
        valores.push(dto[campo]);
        campos.push(`${campo} = $${valores.length}`);
      }
    }
    if (!campos.length) return this.obtenerPorId(idUsuario);
    valores.push(idUsuario);
    const result = await this.pool.query<Usuario>(`
      UPDATE usuarios SET ${campos.join(", ")}
      WHERE id_usuario = $${valores.length} RETURNING ${columnas}
    `, valores);
    if (!result.rows[0]) throw new NotFoundError("Usuario no encontrado.");
    return result.rows[0];
  }

  async eliminar(idUsuario: number): Promise<void> {
    // Evitar que ON DELETE CASCADE permita borrar indirectamente tareas ajenas.
    const result = await this.pool.query(`
      DELETE FROM usuarios WHERE id_usuario = $1
      AND NOT EXISTS (SELECT 1 FROM tareas WHERE id_creador = $1)
      RETURNING id_usuario
    `, [idUsuario]);
    if (!result.rowCount) {
      await this.obtenerPorId(idUsuario);
      throw new ConflictError("El usuario tiene tareas propias. Debe eliminarlas antes de borrar su cuenta.");
    }
  }
}
export type UsuariosRepo = Pick<UsuariosRepository,
  "obtenerTodos" | "obtenerPorId" | "verificarCredenciales" | "crear" | "actualizar" | "eliminar">;
