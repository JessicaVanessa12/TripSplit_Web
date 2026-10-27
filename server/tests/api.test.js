process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

const A = { nombre: 'Ana', correo: 'ana@test.com', contrasena: 'clave1234' };
const B = { nombre: 'Beto', correo: 'beto@test.com', contrasena: 'clave1234' };
const C = { nombre: 'Cami', correo: 'cami@test.com', contrasena: 'clave1234' };
const viaje = { nombre: 'Kioto', destino: 'Japón', fecha_inicio: '2026-10-12', fecha_fin: '2026-10-24', presupuesto_total: '3200.00' };
const auth = (t) => ({ Authorization: `Bearer ${t}` });
const registrar = async (u) => (await request(app).post('/api/auth/registro').send(u)).body.token;

let tA, tB, tC, viajeId;

beforeAll(async () => {
  await db.query('SET FOREIGN_KEY_CHECKS=0');
  for (const t of ['participantes_viaje', 'viajes', 'usuarios']) await db.query(`TRUNCATE TABLE ${t}`);
  await db.query('SET FOREIGN_KEY_CHECKS=1');
  [tA, tB, tC] = [await registrar(A), await registrar(B), await registrar(C)];
});
afterAll(() => db.end());

describe('Autenticación (HU-01, HU-02)', () => {
  test('CP-S01 correo repetido -> 409', async () => {
    expect((await request(app).post('/api/auth/registro').send(A)).status).toBe(409);
  });
  test('CP-S02 contraseña débil / correo inválido -> 400', async () => {
    expect((await request(app).post('/api/auth/registro').send({ ...A, correo: 'x@y.com', contrasena: 'abc' })).status).toBe(400);
    expect((await request(app).post('/api/auth/registro').send({ ...A, correo: 'malo' })).status).toBe(400);
  });
  test('login correcto -> 200 y sin contrasena_hash (CP-S12)', async () => {
    const r = await request(app).post('/api/auth/login').send({ correo: A.correo, contrasena: A.contrasena });
    expect(r.status).toBe(200);
    expect(JSON.stringify(r.body)).not.toMatch(/hash/);
  });
  test('CP-S03 contraseña incorrecta -> 401 genérico', async () => {
    const r = await request(app).post('/api/auth/login').send({ correo: A.correo, contrasena: 'incorrecta1' });
    expect(r.status).toBe(401);
  });
  test('CP-S04 sin sesión / token falso -> 401', async () => {
    expect((await request(app).get('/api/viajes')).status).toBe(401);
    expect((await request(app).get('/api/viajes').set(auth('falso'))).status).toBe(401);
  });
  test('CP-S08 intento de inyección SQL se trata como texto', async () => {
    const r = await request(app).post('/api/auth/login').send({ correo: "' OR 1=1 --", contrasena: "' OR 1=1 --" });
    expect(r.status).toBe(400);
  });
});

describe('Viajes (HU-03, HU-04)', () => {
  test('crea viaje y el creador es organizador -> 201', async () => {
    const r = await request(app).post('/api/viajes').set(auth(tA)).send(viaje);
    expect(r.status).toBe(201);
    viajeId = r.body.id;
    const d = await request(app).get(`/api/viajes/${viajeId}`).set(auth(tA));
    expect(d.body.rol).toBe('organizador');
  });
  test('fecha fin anterior o presupuesto negativo -> 400', async () => {
    expect((await request(app).post('/api/viajes').set(auth(tA)).send({ ...viaje, fecha_fin: '2026-10-01' })).status).toBe(400);
    expect((await request(app).post('/api/viajes').set(auth(tA)).send({ ...viaje, presupuesto_total: '-5' })).status).toBe(400);
  });
  test('lista solo viajes propios', async () => {
    expect((await request(app).get('/api/viajes').set(auth(tA))).body).toHaveLength(1);
    expect((await request(app).get('/api/viajes').set(auth(tB))).body).toHaveLength(0);
  });
  test('CP-S05 viaje ajeno -> 403; inexistente -> 404; id inválido -> 400', async () => {
    expect((await request(app).get(`/api/viajes/${viajeId}`).set(auth(tB))).status).toBe(403);
    expect((await request(app).get('/api/viajes/99999').set(auth(tA))).status).toBe(404);
    expect((await request(app).get('/api/viajes/abc').set(auth(tA))).status).toBe(400);
  });
});

describe('Participantes (HU-05)', () => {
  const url = () => `/api/viajes/${viajeId}/participantes`;
  test('organizador agrega -> 201 y la persona ve el viaje', async () => {
    expect((await request(app).post(url()).set(auth(tA)).send({ correo: B.correo })).status).toBe(201);
    expect((await request(app).get('/api/viajes').set(auth(tB))).body).toHaveLength(1);
  });
  test('duplicado -> 409; no registrado -> 404', async () => {
    expect((await request(app).post(url()).set(auth(tA)).send({ correo: B.correo })).status).toBe(409);
    expect((await request(app).post(url()).set(auth(tA)).send({ correo: 'nadie@test.com' })).status).toBe(404);
  });
  test('CP-S07 participante no organizador -> 403', async () => {
    expect((await request(app).post(url()).set(auth(tB)).send({ correo: C.correo })).status).toBe(403);
  });
  test('organizador retira -> 204; no puede retirarse a sí mismo -> 404', async () => {
    const idB = (await request(app).get(`/api/viajes/${viajeId}`).set(auth(tA))).body.participantes.find((p) => p.correo === B.correo).id;
    expect((await request(app).delete(`${url()}/${idB}`).set(auth(tB))).status).toBe(403);
    expect((await request(app).delete(`${url()}/${idB}`).set(auth(tA))).status).toBe(204);
    const idA = (await request(app).get(`/api/viajes/${viajeId}`).set(auth(tA))).body.participantes[0].id;
    expect((await request(app).delete(`${url()}/${idA}`).set(auth(tA))).status).toBe(404);
  });
  test('ruta inexistente -> 404 y JSON inválido -> 400', async () => {
    expect((await request(app).get('/api/nada')).status).toBe(404);
    expect((await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{mal')).status).toBe(400);
  });
});
