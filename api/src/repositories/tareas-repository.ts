import type { Pool } from "pg";
import { myPool } from "../db/database.ts";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/response.errors.ts";
import type {
  ActualizarTareaDTO,
  CrearTareaDTO,
  Tarea,
} from "../schemas/tareas-schema.ts";
import type { PayloadDTO } from "../schemas/usuarios-schema.ts";

type TareaDB = Omit<Tarea, "creada" | "terminada"> & {
  creada: Date;
  terminada: Date | null;
};
const columnas =
  "id_tarea, id_creador, grupo, titulo, descripcion, prioridad, creada, terminada, estado";
const convertirTarea = (row: TareaDB): Tarea => ({
  ...row,
  creada: row.creada.toISOString(),
  terminada: row.terminada?.toISOString() ?? null,
});

// Se completan las seis operaciones del esqueleto entregado por el profesor.
export class TareasRepository {
  private readonly pool: Pool;
  constructor(pool: Pool = myPool) {
    this.pool = pool;
  }

  async obtenerTodas(): Promise<Tarea[]> {
    const result = await this.pool.query<TareaDB>(
      `SELECT ${columnas} FROM tareas ORDER BY creada DESC, id_tarea DESC`,
    );
    return result.rows.map(convertirTarea);
  }

  async obtenerPorId(idTarea: number): Promise<Tarea> {
    const result = await this.pool.query<TareaDB>(
      `SELECT ${columnas} FROM tareas WHERE id_tarea = $1`,
      [idTarea],
    );
    if (!result.rows[0]) throw new NotFoundError("Tarea no encontrada.");
    return convertirTarea(result.rows[0]);
  }

  async crear(idCreador: number, dto: CrearTareaDTO): Promise<Tarea> {
    const result = await this.pool.query<TareaDB>(
      `
      INSERT INTO tareas (id_creador, grupo, titulo, descripcion, prioridad)
      VALUES ($1, $2, $3, $4, COALESCE($5, '1:media')) RETURNING ${columnas}
    `,
      [
        idCreador,
        dto.grupo,
        dto.titulo,
        dto.descripcion ?? null,
        dto.prioridad,
      ],
    );
    return convertirTarea(result.rows[0]!);
  }

  async actualizar(idTarea: number, dto: ActualizarTareaDTO): Promise<Tarea> {
    const campos: string[] = [];
    const valores: unknown[] = [];

    for (const campo of [
      "titulo",
      "descripcion",
      "grupo",
      "prioridad",
    ] as const) {
      if (dto[campo] !== undefined) {
        valores.push(dto[campo]);
        campos.push(`${campo} = $${valores.length}`);
      }
    }

    if (campos.length === 0) {
      return this.obtenerPorId(idTarea);
    }

    const indiceId = valores.push(idTarea);

    const result = await this.pool.query<TareaDB>(
      `
    UPDATE tareas
    SET ${campos.join(", ")}
    WHERE id_tarea = $${indiceId}
    RETURNING ${columnas}
  `,
      valores,
    );

    if (!result.rows[0]) {
      throw new NotFoundError("Tarea no encontrada.");
    }

    return convertirTarea(result.rows[0]);
  }

  async finalizar(
    idTarea: number,
    usuario: PayloadDTO,
    fecha?: string,
  ): Promise<Tarea> {
    // También se verifica el grupo en SQL por si cambió entre la consulta y el cierre.
    const result = await this.pool.query<TareaDB>(
      `
      UPDATE tareas SET terminada = COALESCE($2::timestamptz, CURRENT_TIMESTAMP)
      WHERE id_tarea = $1 AND grupo = ANY($3::text[]) AND terminada IS NULL
      RETURNING ${columnas}
    `,
      [idTarea, fecha, usuario.grupos],
    );
    if (!result.rows[0]) {
      const tarea = await this.obtenerPorId(idTarea);
      if (!usuario.grupos.includes(tarea.grupo))
        throw new ForbiddenError(
          "No pertenece al grupo destinatario de esta tarea.",
        );
      throw new ConflictError("La tarea ya está cerrada.");
    }
    return convertirTarea(result.rows[0]);
  }

  async eliminar(idTarea: number, idCreador: number): Promise<void> {
    const result = await this.pool.query(
      `
      DELETE FROM tareas WHERE id_tarea = $1 AND id_creador = $2 RETURNING id_tarea
    `,
      [idTarea, idCreador],
    );
    if (!result.rowCount) {
      await this.obtenerPorId(idTarea);
      throw new ForbiddenError("Solo el creador puede eliminar la tarea.");
    }
  }
}
export type TareasRepo = Pick<
  TareasRepository,
  | "obtenerTodas"
  | "obtenerPorId"
  | "crear"
  | "actualizar"
  | "finalizar"
  | "eliminar"
>;
