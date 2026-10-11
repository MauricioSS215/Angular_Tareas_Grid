import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import Fastify from "fastify";
import fp from "fastify-plugin";
import pg from "pg";
import appPlugin, { options } from "../../src/app.ts";
import { TareasRepository } from "../../src/repositories/tareas-repository.ts";
import { UsuariosRepository } from "../../src/repositories/usuarios-repository.ts";
import type { CrearUsuarioDTO, PayloadDTO } from "../../src/schemas/usuarios-schema.ts";

process.env.FASTIFY_AUTOLOAD_TYPESCRIPT = "1";

// Se ejecuta explícitamente con npm run test:db. Nunca reinicializa la base pública.
// Cada ejecución crea un esquema único con el SQL del profesor y lo elimina al terminar.
test("API y repositorios contra PostgreSQL, en esquema aislado", async t => {
  const schema = "parcial_test_" + randomUUID().replaceAll("-", "");
  assert.match(schema, /^parcial_test_[a-f0-9]{32}$/);
  const connectionString = process.env.TEST_DATABASE_URL;
  const admin = new pg.Pool({ ...(connectionString ? { connectionString } : {}), connectionTimeoutMillis: 5000 });
  const pool = new pg.Pool({
    ...(connectionString ? { connectionString } : {}),
    options: "-c search_path=" + schema + ",public",
    connectionTimeoutMillis: 5000,
  });
  const app = Fastify({ ...options, logger: false });
  let created = false;
  try {
    await admin.query('CREATE SCHEMA "' + schema + '"');
    created = true;
    const fixture = (await readFile(new URL("../../db/Parcial2026Tareas.sql", import.meta.url), "utf8"))
      .replace(/^CREATE EXTENSION IF NOT EXISTS pgcrypto;\s*/m, "");
    // pgcrypto debe existir como indica el SQL del profesor.
    await pool.query(fixture);
    const namespace = await pool.query("SELECT n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.oid=(SELECT tableoid FROM tareas LIMIT 1)");
    assert.equal(namespace.rows[0].nspname, schema);
    await app.register(fp(appPlugin), { database: pool, jwtSecret: "secreto-integracion-postgresql" });
    await app.ready();
    const headers = new Map<string, { authorization: string }>();
    async function login(username: string, password = "Contraseña1") {
      const res = await app.inject({ method: "POST", url: "/auth/login", payload: { username, password } });
      assert.equal(res.statusCode, 200, res.payload);
      headers.set(username, { authorization: "Bearer " + res.json().token });
    }
    const request = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, username: string, payload?: object) =>
      app.inject({ method, url, headers: headers.get(username), ...(payload !== undefined ? { payload } : {}) });
    await login("superadmin"); await login("admin"); await login("user");
    const adminIdentidad: PayloadDTO = { id_usuario: 2, username: "admin", grupos: ["admin", "user"] };
    const superIdentidad: PayloadDTO = { id_usuario: 1, username: "superadmin", grupos: ["superadmin"] };
    const userIdentidad: PayloadDTO = { id_usuario: 3, username: "user", grupos: ["user"] };
    const tareasRepo = new TareasRepository(pool);
    const usuariosRepo = new UsuariosRepository(pool);
    let idUser = 0, idAdmin = 0, idSuper = 0;

    await t.test("login real, password_hash excluido y datos iniciales del profesor", async () => {
      const lista = await request("GET", "/tareas", "user");
      assert.equal(lista.statusCode, 200, lista.payload);
      assert.equal(lista.json().length, 12);
      for (const tarea of lista.json()) {
        assert.ok(Number.isFinite(Date.parse(tarea.creada)));
        assert.equal(tarea.estado, tarea.terminada ? "Cerrada" : "Abierta");
      }
      const identidad = await request("GET", "/auth", "admin");
      assert.deepEqual(identidad.json(), adminIdentidad);
      const perfil = await request("GET", "/usuarios/2", "admin");
      assert.equal(perfil.json().fecha_nacimiento, "1985-03-15");
      assert.ok(!perfil.payload.includes("password"));
      assert.equal((await app.inject({ method: "POST", url: "/auth/login", payload: { username: "user", password: "mal" } })).statusCode, 401);
    });

    await t.test("crear tareas reales con defaults y creador autenticado", async () => {
      for (const [grupo, creador] of [["user", "admin"], ["admin", "admin"], ["superadmin", "superadmin"]] as const) {
        const res = await request("POST", "/tareas", creador, { grupo, titulo: "Tarea de integración " + grupo });
        assert.equal(res.statusCode, 201, res.payload);
        const tarea = res.json();
        assert.equal(tarea.id_creador, creador === "admin" ? 2 : 1);
        assert.equal(tarea.prioridad, "1:media");
        assert.equal(tarea.descripcion, null);
        assert.equal(tarea.estado, "Abierta");
        if (grupo === "user") idUser = tarea.id_tarea;
        if (grupo === "admin") idAdmin = tarea.id_tarea;
        if (grupo === "superadmin") idSuper = tarea.id_tarea;
      }
      assert.equal((await request("POST", "/tareas", "user", { grupo: "user", titulo: "Prohibida" })).statusCode, 403);
      assert.equal((await request("POST", "/tareas", "admin", { grupo: "user", titulo: "Falsificada", id_creador: 1 })).statusCode, 400);
    });

    await t.test("editar permite creador y superadmin, preserva campos omitidos", async () => {
      const creador = await request("PATCH", "/tareas/" + idUser, "admin", { titulo: "Título corregido" });
      assert.equal(creador.statusCode, 200, creador.payload);
      assert.equal(creador.json().grupo, "user");
      const superadmin = await request("PATCH", "/tareas/" + idUser, "superadmin", { descripcion: "Detalle", prioridad: "2:alta" });
      assert.equal(superadmin.statusCode, 200, superadmin.payload);
      assert.equal(superadmin.json().titulo, "Título corregido");
      assert.equal(superadmin.json().id_creador, 2);
      assert.equal((await request("PATCH", "/tareas/" + idUser, "user", { titulo: "No permitido" })).statusCode, 403);
      assert.equal((await request("PATCH", "/tareas/" + idUser, "admin", { terminada: new Date().toISOString() })).statusCode, 400);
      assert.equal((await request("PATCH", "/tareas/" + idUser, "admin", { descripcion: null })).json().descripcion, null);
    });

    await t.test("repositorio impide edición y eliminación ajenas incluso sin la ruta", async () => {
      await assert.rejects(tareasRepo.actualizar(idUser, { titulo: "No permitido" }, userIdentidad), { statusCode: 403 });
      await assert.rejects(tareasRepo.eliminar(idUser, 1), { statusCode: 403 });
      assert.equal((await tareasRepo.obtenerPorId(idUser)).id_creador, 2);
    });

    await t.test("finalización exige grupo exacto y PostgreSQL genera el estado", async () => {
      assert.equal((await request("PATCH", "/tareas/" + idUser + "/finalizacion", "superadmin", {})).statusCode, 403);
      assert.equal((await request("PATCH", "/tareas/" + idAdmin + "/finalizacion", "user", {})).statusCode, 403);
      assert.equal((await request("PATCH", "/tareas/" + idSuper + "/finalizacion", "admin", {})).statusCode, 403);
      await assert.rejects(tareasRepo.finalizar(idAdmin, userIdentidad), { statusCode: 403 });
      const fecha = "2026-10-10T12:00:00Z";
      const cerrada = await request("PATCH", "/tareas/" + idUser + "/finalizacion", "user", { terminada: fecha });
      assert.equal(cerrada.statusCode, 200, cerrada.payload);
      assert.equal(cerrada.json().estado, "Cerrada");
      assert.equal(cerrada.json().terminada, "2026-10-10T12:00:00.000Z");
      const db = await pool.query("SELECT terminada, estado FROM tareas WHERE id_tarea=$1", [idUser]);
      assert.equal(db.rows[0].estado, "Cerrada");
      assert.equal((await request("PATCH", "/tareas/" + idUser + "/finalizacion", "user", {})).statusCode, 409);
      assert.equal((await request("PATCH", "/tareas/" + idAdmin + "/finalizacion", "admin", {})).statusCode, 200);
      assert.equal((await request("PATCH", "/tareas/" + idSuper + "/finalizacion", "superadmin", {})).statusCode, 200);
    });

    await t.test("dos cierres concurrentes producen un éxito y un conflicto", async () => {
      const nueva = await tareasRepo.crear(2, { grupo: "user", titulo: "Cierre concurrente" });
      const results = await Promise.allSettled([
        tareasRepo.finalizar(nueva.id_tarea, userIdentidad),
        tareasRepo.finalizar(nueva.id_tarea, adminIdentidad),
      ]);
      assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
      const failure = results.find(r => r.status === "rejected");
      assert.equal(failure?.status === "rejected" ? failure.reason.statusCode : null, 409);
    });

    await t.test("usuarios: alta transaccional, credenciales, duplicados y validaciones", async () => {
      assert.equal((await request("DELETE", "/usuarios/2", "superadmin")).statusCode, 409);
      assert.equal((await tareasRepo.obtenerPorId(idUser)).id_creador, 2);
      const dto: CrearUsuarioDTO = { username: "prueba_admin", nombres: "Prueba", apellidos: "Admin", fecha_nacimiento: "2000-01-01", grupos: ["admin"], password: "Prueba123" };
      const creada = await request("POST", "/usuarios", "superadmin", dto);
      assert.equal(creada.statusCode, 201, creada.payload);
      assert.equal(creada.json().nombre_completo, "Prueba Admin");
      assert.ok(!creada.payload.includes("password"));
      await login("prueba_admin", "Prueba123");
      assert.equal((await request("PATCH", "/tareas/" + idUser, "prueba_admin", { titulo: "Ajena" })).statusCode, 403);
      assert.equal((await request("DELETE", "/tareas/" + idUser, "prueba_admin")).statusCode, 403);
      assert.equal((await request("POST", "/usuarios", "superadmin", dto)).statusCode, 409);
      assert.equal((await request("PATCH", "/usuarios/" + creada.json().id_usuario, "superadmin", { grupos: [] })).statusCode, 400);
      assert.equal((await request("POST", "/usuarios", "superadmin", { ...dto, username: "fecha", fecha_nacimiento: "2000-02-30" })).statusCode, 400);
      // Forzar un fallo en el segundo INSERT para comprobar el rollback de ambos registros.
      await pool.query(`CREATE FUNCTION rechazar_credencial_prueba() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF (SELECT username FROM usuarios WHERE id_usuario=NEW.id_usuario)='rollback' THEN
            RAISE EXCEPTION 'Fallo de prueba' USING ERRCODE='23514';
          END IF;
          RETURN NEW;
        END $$;
        CREATE TRIGGER fallo_prueba BEFORE INSERT ON credenciales
        FOR EACH ROW EXECUTE FUNCTION rechazar_credencial_prueba();`);
      await assert.rejects(usuariosRepo.crear({ ...dto, username: "rollback" }), { code: "23514" });
      const rollback = await pool.query("SELECT count(*)::integer AS cantidad FROM usuarios WHERE username='rollback'");
      assert.equal(rollback.rows[0].cantidad, 0);
      assert.equal((await request("DELETE", "/usuarios/" + creada.json().id_usuario, "superadmin")).statusCode, 204);
      assert.equal((await request("GET", "/tareas", "prueba_admin")).statusCode, 401);
    });

    await t.test("revocación de grupos y cuentas desactivadas invalidan permisos del token", async () => {
      const actualizada = await request("PATCH", "/usuarios/2", "superadmin", { grupos: ["user"] });
      assert.equal(actualizada.statusCode, 200, actualizada.payload);
      assert.equal((await request("POST", "/tareas", "admin", { titulo: "No autorizado", grupo: "user" })).statusCode, 403);
      // Ser autor sigue alcanzando para editar, aunque ya no sea admin.
      assert.equal((await request("PATCH", "/tareas/" + idUser, "admin", { titulo: "Sigue siendo propia" })).statusCode, 200);
      await request("PATCH", "/usuarios/3", "superadmin", { activo: false });
      assert.equal((await request("GET", "/tareas", "user")).statusCode, 401);
      assert.equal((await app.inject({ method: "POST", url: "/auth/login", payload: { username: "user", password: "Contraseña1" } })).statusCode, 401);
    });

    await t.test("eliminación exclusiva del autor, 204 vacío y 404 posterior", async () => {
      assert.equal((await request("DELETE", "/tareas/" + idUser, "superadmin")).statusCode, 403);
      const eliminada = await request("DELETE", "/tareas/" + idUser, "admin");
      assert.equal(eliminada.statusCode, 204, eliminada.payload);
      assert.equal(eliminada.payload, "");
      assert.equal((await request("GET", "/tareas/" + idUser, "admin")).statusCode, 404);
      for (const fn of [
        () => tareasRepo.obtenerPorId(99999),
        () => tareasRepo.actualizar(99999, { titulo: "X" }, superIdentidad),
        () => tareasRepo.finalizar(99999, superIdentidad),
        () => tareasRepo.eliminar(99999, 1),
      ]) await assert.rejects(fn(), { statusCode: 404 });
    });
  } finally {
    await app.close();
    await pool.end();
    if (created) await admin.query('DROP SCHEMA "' + schema + '" CASCADE');
    await admin.end();
  }
});
