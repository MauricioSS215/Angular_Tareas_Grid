import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "./helper.ts";

test("login, identidad actual y token sin credenciales", async t => {
  const { app } = await build(t);
  const login = await app.inject({ method: "POST", url: "/auth/login", payload: { username: "admin", password: "Contraseña1" } });
  assert.equal(login.statusCode, 200);
  const payload = app.jwt.decode<Record<string, unknown>>(login.json().token)!;
  assert.deepEqual(Object.keys(payload).sort(), ["exp", "grupos", "iat", "id_usuario", "username"]);
  const perfil = await app.inject({ url: "/auth", headers: { authorization: "Bearer " + login.json().token } });
  assert.deepEqual(perfil.json(), { id_usuario: 2, username: "admin", grupos: ["admin", "user"] });
  for (const username of ["admin", "inactivo", "inexistente"]) {
    const response = await app.inject({ method: "POST", url: "/auth/login", payload: { username, password: "incorrecta" } });
    assert.equal(response.statusCode, 401);
  }
});

test("todas las operaciones de tareas requieren token", async t => {
  const { request } = await build(t);
  for (const [method, url, body] of [
    ["GET", "/tareas", undefined], ["GET", "/tareas/10", undefined],
    ["POST", "/tareas", { grupo: "user", titulo: "Nueva" }],
    ["PATCH", "/tareas/10", { titulo: "Otro" }],
    ["PATCH", "/tareas/10/finalizacion", {}], ["DELETE", "/tareas/10", undefined],
  ] as const) {
    assert.equal((await request(method, url, undefined, body)).statusCode, 401, method + " " + url);
  }
});

test("onRequest autentica antes de validar y preHandler autoriza después de validar", async t => {
  const { request, tareasRepo } = await build(t);
  const consulta = t.mock.method(tareasRepo, "obtenerPorId");
  assert.equal((await request("POST", "/tareas", undefined, {})).statusCode, 401);
  assert.equal((await request("POST", "/tareas", 3, {})).statusCode, 400);
  assert.equal((await request("POST", "/tareas", 3, { grupo: "user", titulo: "Nueva" })).statusCode, 403);
  assert.equal((await request("POST", "/usuarios", 2, {})).statusCode, 400);
  assert.equal((await request("PATCH", "/tareas/abc", 3, { titulo: "Nueva" })).statusCode, 400);
  assert.equal((await request("PATCH", "/tareas/10", 3, {})).statusCode, 400);
  assert.equal(consulta.mock.callCount(), 0, "los datos inválidos no llegan a la consulta del permiso");
});

test("preHandler impide ejecutar las operaciones sin permiso", async t => {
  const { request, tareasRepo, usuariosRepo } = await build(t);
  const editar = t.mock.method(tareasRepo, "actualizar");
  const finalizar = t.mock.method(tareasRepo, "finalizar");
  const eliminar = t.mock.method(tareasRepo, "eliminar");
  const editarUsuario = t.mock.method(usuariosRepo, "actualizar");
  assert.equal((await request("PATCH", "/tareas/10", 3, { titulo: "Nueva" })).statusCode, 403);
  assert.equal((await request("PATCH", "/tareas/11/finalizacion", 3, {})).statusCode, 403);
  assert.equal((await request("DELETE", "/tareas/10", 1)).statusCode, 403);
  assert.equal((await request("PATCH", "/usuarios/3", 3, { grupos: ["superadmin"] })).statusCode, 403);
  for (const operacion of [editar, finalizar, eliminar, editarUsuario]) {
    assert.equal(operacion.mock.callCount(), 0);
  }
});

test("tokens inválidos, vencidos y de cuentas inexistentes o desactivadas", async t => {
  const { app, request } = await build(t);
  for (const token of ["invalido", app.jwt.sign({ id_usuario: 999, username: "nadie", grupos: ["user"] }),
    app.jwt.sign({ id_usuario: 3, username: "user", grupos: ["user"] }, { expiresIn: -1 })]) {
    const res = await app.inject({ url: "/tareas", headers: { authorization: "Bearer " + token } });
    assert.equal(res.statusCode, 401);
  }
  assert.equal((await request("GET", "/tareas", 6)).statusCode, 401);
});

test("todos los perfiles autenticados ven tareas globales y ajenas", async t => {
  const { request } = await build(t);
  for (const id of [1, 2, 3, 4, 5]) {
    const lista = await request("GET", "/tareas", id);
    assert.equal(lista.statusCode, 200);
    assert.equal(lista.json().length, 4);
    assert.equal((await request("GET", "/tareas/12", id)).statusCode, 200);
  }
});

test("solo admin y superadmin crean, con creador del token y prioridad por defecto", async t => {
  const { request } = await build(t);
  for (const [id, expected] of [[1, 201], [2, 201], [3, 403], [4, 201], [5, 201]]) {
    const res = await request("POST", "/tareas", id, { grupo: "user", titulo: "Nueva tarea" });
    assert.equal(res.statusCode, expected);
    if (expected === 201) {
      const tarea = res.json();
      assert.equal(tarea.id_creador, id);
      assert.equal(tarea.prioridad, "1:media");
      assert.equal(tarea.descripcion, null);
      assert.equal(tarea.estado, "Abierta");
      assert.equal(res.headers.location, "/tareas/" + tarea.id_tarea);
    }
  }
});

test("solo creador o superadmin editan datos generales", async t => {
  const { request } = await build(t);
  for (const [id, expected] of [[2, 200], [1, 200], [3, 403], [4, 403], [5, 200]]) {
    const res = await request("PATCH", "/tareas/10", id, { titulo: "Editada", descripcion: null, prioridad: "2:alta" });
    assert.equal(res.statusCode, expected);
    if (expected === 200) assert.equal(res.json().id_creador, 2);
  }
});

test("un creador conserva permiso para editar y borrar aunque pierda admin", async t => {
  const { request, users } = await build(t);
  users.get(2)!.grupos = ["user"];
  assert.equal((await request("PATCH", "/tareas/10", 2, { titulo: "Propia" })).statusCode, 200);
  assert.equal((await request("DELETE", "/tareas/10", 2)).statusCode, 204);
});

for (const [grupo, tareaId, permitidos] of [
  ["user", 10, [2, 3, 5]], ["admin", 11, [2, 4]], ["superadmin", 12, [1, 5]],
] as const) {
  for (const id of [1, 2, 3, 4, 5]) {
    test("finalización: grupo " + grupo + ", usuario " + id, async t => {
      const { request } = await build(t);
      const res = await request("PATCH", "/tareas/" + tareaId + "/finalizacion", id, {});
      const allowed = (permitidos as readonly number[]).includes(id);
      assert.equal(res.statusCode, allowed ? 200 : 403);
      if (allowed) {
        assert.equal(res.json().estado, "Cerrada");
        assert.ok(Number.isFinite(Date.parse(res.json().terminada)));
      }
    });
  }
}

test("fecha explícita y segundo cierre devuelven estado correcto y 409", async t => {
  const { request } = await build(t);
  const fecha = "2026-10-10T14:30:00Z";
  const res = await request("PATCH", "/tareas/10/finalizacion", 3, { terminada: fecha });
  assert.equal(res.statusCode, 200);
  assert.equal(Date.parse(res.json().terminada), Date.parse(fecha));
  assert.equal((await request("PATCH", "/tareas/10/finalizacion", 3, {})).statusCode, 409);
});

test("solo el creador borra; un superadmin ajeno recibe 403", async t => {
  const { request } = await build(t);
  for (const id of [1, 3, 4, 5]) assert.equal((await request("DELETE", "/tareas/10", id)).statusCode, 403);
  const deleted = await request("DELETE", "/tareas/10", 2);
  assert.equal(deleted.statusCode, 204);
  assert.equal(deleted.payload, "");
  assert.equal((await request("GET", "/tareas/10", 3)).statusCode, 404);
});

test("schemas rechazan grupos/prioridades inválidos, títulos vacíos y campos reservados", async t => {
  const { request } = await build(t);
  for (const body of [
    {}, { grupo: "otro", titulo: "Nueva" }, { grupo: "user", titulo: "" },
    { grupo: "user", titulo: "   " }, { grupo: "user", titulo: "x".repeat(101) },
    { grupo: "user", titulo: "Nueva", prioridad: "alta" },
    { grupo: "user", titulo: "Nueva", id_creador: 1 },
    { grupo: "user", titulo: "Nueva", estado: "Cerrada" },
    { grupo: "user", titulo: 123 },
  ]) assert.equal((await request("POST", "/tareas", 2, body)).statusCode, 400);
  assert.equal((await request("PATCH", "/tareas/10", 2, { descripcion: null })).json().descripcion, null);
  assert.equal((await request("PATCH", "/tareas/10", 2, { descripcion: "" })).json().descripcion, "");
  assert.equal((await request("POST", "/tareas", 2, { grupo: "user", titulo: "x".repeat(100) })).statusCode, 201);
  for (const body of [{}, { terminada: "2026-10-10T14:30:00Z" }, { estado: "Cerrada" }, { id_creador: 1 }]) {
    assert.equal((await request("PATCH", "/tareas/10", 2, body)).statusCode, 400);
  }
  for (const body of [{ terminada: null }, { terminada: "ayer" }, { grupo: "admin" }]) {
    assert.equal((await request("PATCH", "/tareas/10/finalizacion", 3, body)).statusCode, 400);
  }
});

test("parámetros inválidos son 400 y tareas inexistentes son 404", async t => {
  const { request } = await build(t);
  for (const id of ["abc", "0", "-1", "2147483648"]) {
    assert.equal((await request("GET", "/tareas/" + id, 3)).statusCode, 400);
  }
  for (const [method, url, body] of [
    ["GET", "/tareas/999", undefined], ["PATCH", "/tareas/999", { titulo: "Nueva" }],
    ["PATCH", "/tareas/999/finalizacion", {}], ["DELETE", "/tareas/999", undefined],
  ] as const) assert.equal((await request(method, url, 2, body)).statusCode, 404);
});

test("cambios de grupos y desactivación se aplican a tokens ya emitidos", async t => {
  const { app, users } = await build(t);
  const headers = { authorization: "Bearer " + app.jwt.sign({ id_usuario: 2, username: "admin", grupos: ["admin", "user"] }) };
  users.get(2)!.grupos = ["user"];
  assert.equal((await app.inject({ method: "POST", url: "/tareas", headers, payload: { grupo: "user", titulo: "Nueva" } })).statusCode, 403);
  users.get(2)!.activo = false;
  assert.equal((await app.inject({ url: "/tareas", headers })).statusCode, 401);
});

test("errores SQL se traducen y fallos internos no exponen detalles", async t => {
  const { request, tareasRepo } = await build(t);
  for (const [code, expected] of [["23505", 409], ["23503", 409], ["23514", 400], ["23502", 400], ["22001", 400], ["42703", 500]]) {
    tareasRepo.obtenerTodas = async () => { throw Object.assign(new Error("detalle secreto de SQL"), { code }); };
    const res = await request("GET", "/tareas", 3);
    assert.equal(res.statusCode, expected);
    assert.ok(!res.payload.includes("detalle secreto"));
    assert.equal(res.json().statusCode, expected);
  }
});

test("usuarios: perfil propio, administración y prevención de escalada de permisos", async t => {
  const { request } = await build(t);
  assert.equal((await request("GET", "/usuarios", 3)).statusCode, 403);
  assert.equal((await request("GET", "/usuarios", 2)).statusCode, 200);
  assert.equal((await request("GET", "/usuarios/3", 3)).statusCode, 200);
  assert.equal((await request("GET", "/usuarios/2", 3)).statusCode, 403);
  assert.equal((await request("PATCH", "/usuarios/3", 3, { nombres: "Nuevo" })).statusCode, 200);
  assert.equal((await request("PATCH", "/usuarios/3", 3, { grupos: ["superadmin"] })).statusCode, 403);
  assert.equal((await request("PATCH", "/usuarios/3", 3, { activo: false })).statusCode, 403);
  assert.equal((await request("PATCH", "/usuarios/3", 1, { grupos: ["user", "admin"] })).statusCode, 200);
  assert.equal((await request("PATCH", "/usuarios/3", 1, { grupos: [] })).statusCode, 400);
  const dto = { username: "nuevo", password: "Contraseña1", nombres: "Nombre", apellidos: "Apellido", fecha_nacimiento: "1995-01-01" };
  assert.equal((await request("POST", "/usuarios", 2, dto)).statusCode, 403);
  const nuevo = await request("POST", "/usuarios", 1, dto);
  assert.equal(nuevo.statusCode, 201);
  assert.ok(!nuevo.payload.includes("password"));
  assert.equal((await request("DELETE", "/usuarios/" + nuevo.json().id_usuario, 1)).statusCode, 204);
});

test("Swagger documenta todas las rutas y CORS admite Angular y sus verbos", async t => {
  const { app } = await build(t);
  const docs = await app.inject({ url: "/docs/json" });
  assert.equal(docs.statusCode, 200);
  const paths = docs.json().paths;
  for (const path of ["/auth/login", "/auth/", "/tareas/", "/tareas/{id_tarea}", "/tareas/{id_tarea}/finalizacion", "/usuarios/"]) {
    assert.ok(paths[path], path);
  }
  assert.equal((await app.inject({ url: "/docs" })).statusCode, 200);
  const preflight = await app.inject({
    method: "OPTIONS", url: "/tareas/10",
    headers: { origin: "http://localhost:4200", "access-control-request-method": "PATCH", "access-control-request-headers": "authorization,content-type" },
  });
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.headers["access-control-allow-origin"], "http://localhost:4200");
  assert.ok(String(preflight.headers["access-control-allow-methods"]).includes("PATCH"));
  const external = await app.inject({ method: "OPTIONS", url: "/tareas", headers: {
    origin: "https://desconocido.example", "access-control-request-method": "GET",
  } });
  assert.equal(external.headers["access-control-allow-origin"], undefined);
});

test("ruta raíz y ruta inexistente", async t => {
  const { app } = await build(t);
  assert.deepEqual((await app.inject({ url: "/" })).json(), { api: "Parcial 1 API REST 2026", docs: "/docs" });
  assert.equal((await app.inject({ url: "/inexistente" })).statusCode, 404);
});
