import Fastify from "fastify";
import fp from "fastify-plugin";
import appPlugin, { options } from "../src/app.ts";
import type { TestContext } from "node:test";
import type { Usuario } from "../src/schemas/usuarios-schema.ts";
import type { Tarea } from "../src/schemas/tareas-schema.ts";
import type { UsuariosRepo } from "../src/repositories/usuarios-repository.ts";
import type { TareasRepo } from "../src/repositories/tareas-repository.ts";
import { ConflictError, NotFoundError, UnAuthenticatedError } from "../src/errors/response.errors.ts";

process.env.FASTIFY_AUTOLOAD_TYPESCRIPT = "1";

// Doble de persistencia para probar HTTP/permisos sin depender de una base local.
// Las consultas SQL se verifican aparte en test/integration/database.test.ts.
export async function build(t: TestContext) {
  const users = new Map<number, Usuario>();
  for (const [id, username, grupos, activo] of [
    [1, "superadmin", ["superadmin"], true],
    [2, "admin", ["admin", "user"], true],
    [3, "user", ["user"], true],
    [4, "otroadmin", ["admin"], true],
    [5, "multigrupo", ["superadmin", "user"], true],
    [6, "inactivo", ["user"], false],
  ] as const) {
    users.set(id, { id_usuario: id, username, grupos: [...grupos], activo,
      nombres: "Nombre", apellidos: "Apellido", nombre_completo: "Nombre Apellido", fecha_nacimiento: "1995-01-01" });
  }
  const tareas = new Map<number, Tarea>();
  for (const [id, creador, grupo, cerrada] of [
    [10, 2, "user", false], [11, 2, "admin", false],
    [12, 1, "superadmin", false], [13, 2, "user", true],
  ] as const) {
    tareas.set(id, {
      id_tarea: id, id_creador: creador, grupo, titulo: "Tarea de ejemplo",
      descripcion: null, prioridad: "1:media", creada: "2026-10-10T12:00:00.000Z",
      terminada: cerrada ? "2026-10-10T13:00:00.000Z" : null, estado: cerrada ? "Cerrada" : "Abierta",
    });
  }
  let nextId = 100;
  const usuariosRepo: UsuariosRepo = {
    async obtenerTodos() { return [...users.values()]; },
    async obtenerPorId(id) {
      const user = users.get(id);
      if (!user) throw new NotFoundError("Usuario no encontrado.");
      return user;
    },
    async verificarCredenciales(username, password) {
      const user = [...users.values()].find(u => u.username === username && u.activo);
      if (!user || password !== "Contraseña1") throw new UnAuthenticatedError("Usuario o contraseña incorrectos.");
      return { id_usuario: user.id_usuario, username: user.username, grupos: user.grupos };
    },
    async crear(dto) {
      const user: Usuario = {
        id_usuario: nextId++, username: dto.username, nombres: dto.nombres, apellidos: dto.apellidos,
        fecha_nacimiento: dto.fecha_nacimiento, nombre_completo: dto.nombres + " " + dto.apellidos,
        grupos: dto.grupos ?? ["user"], activo: true,
      };
      users.set(user.id_usuario, user);
      return user;
    },
    async actualizar(id, dto) {
      const user = await usuariosRepo.obtenerPorId(id);
      Object.assign(user, dto);
      user.nombre_completo = user.nombres + " " + user.apellidos;
      return user;
    },
    async eliminar(id) { await usuariosRepo.obtenerPorId(id); users.delete(id); },
  };
  const tareasRepo: TareasRepo = {
    async obtenerTodas() { return [...tareas.values()]; },
    async obtenerPorId(id) {
      const tarea = tareas.get(id);
      if (!tarea) throw new NotFoundError("Tarea no encontrada.");
      return tarea;
    },
    async crear(id, dto) {
      const tarea: Tarea = {
        id_tarea: nextId++, id_creador: id, ...dto, descripcion: dto.descripcion ?? null,
        prioridad: dto.prioridad ?? "1:media", creada: new Date().toISOString(), terminada: null, estado: "Abierta",
      };
      tareas.set(tarea.id_tarea, tarea);
      return tarea;
    },
    async actualizar(id, dto) { const tarea = await tareasRepo.obtenerPorId(id); Object.assign(tarea, dto); return tarea; },
    async finalizar(id, _user, fecha) {
      const tarea = await tareasRepo.obtenerPorId(id);
      if (tarea.terminada !== null) throw new ConflictError("La tarea ya está cerrada.");
      tarea.terminada = fecha ?? new Date().toISOString();
      tarea.estado = "Cerrada";
      return tarea;
    },
    async eliminar(id) { await tareasRepo.obtenerPorId(id); tareas.delete(id); },
  };
  const app = Fastify({ ...options, logger: false });
  await app.register(fp(appPlugin), {
    repositories: { usuarios: usuariosRepo, tareas: tareasRepo },
    jwtSecret: "secreto-exclusivo-para-pruebas",
  });
  t.after(async () => { await app.close(); });
  await app.ready();
  const request = (method: "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS", url: string, id?: number, payload?: object) => {
    const user = id !== undefined ? users.get(id) : undefined;
    const headers = user ? { authorization: "Bearer " + app.jwt.sign({
      id_usuario: user.id_usuario, username: user.username, grupos: user.grupos,
    }) } : {};
    return app.inject({ method, url, headers, ...(payload !== undefined ? { payload } : {}) });
  };
  return { app, request, users, tareas, usuariosRepo, tareasRepo };
}
