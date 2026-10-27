process.env.NODE_ENV = 'test';
const jwt = require('jsonwebtoken');
const { app, db, auth, resetDb, registrar, request } = require('./helpers');

const U = (n) => ({ nombre: n, correo: `${n.toLowerCase()}@test.com`, contrasena: 'clave1234' });
const viaje = { nombre: 'Playa', destino: 'Cancún', fecha_inicio: '2026-12-01', fecha_fin: '2026-12-05', presupuesto_total: '1000' };
let tA, tB;

beforeAll(async () => { await resetDb(); tA = await registrar(U('Ana')); tB = await registrar(U('Beto')); });
afterAll(() => db.end());

describe('Seguridad (HU-01 a HU-05)', () => {
  test('cabeceras de seguridad de helmet presentes', async () => {
    const r = await request(app).get('/api/viajes');
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-powered-by']).toBeUndefined();
  });
  test('token expirado -> 401', async () => {
    const t = jwt.sign({ id: 1, nombre: 'x' }, process.env.JWT_SECRET, { expiresIn: -5 });
    expect((await request(app).get('/api/viajes').set(auth(t))).status).toBe(401);
  });
  test('etiquetas HTML se eliminan al guardar un viaje (anti-XSS)', async () => {
    const r = await request(app).post('/api/viajes').set(auth(tA)).send({ ...viaje, nombre: '<script>alert(1)</script>Playa' });
    expect(r.status).toBe(201);
    expect(r.body.nombre).not.toMatch(/<|>/);
  });
  test('inyección SQL en nombre de viaje se guarda como texto', async () => {
    const r = await request(app).post('/api/viajes').set(auth(tA)).send({ ...viaje, destino: "x'); DROP TABLE usuarios;--" });
    expect(r.status).toBe(201);
    expect((await request(app).post('/api/auth/login').send(U('Ana'))).status).toBe(200);
  });
  test('inyección SQL en correo de participante -> 400', async () => {
    const id = (await request(app).get('/api/viajes').set(auth(tA))).body[0].id;
    const r = await request(app).post(`/api/viajes/${id}/participantes`).set(auth(tA)).send({ correo: "a' OR '1'='1" });
    expect(r.status).toBe(400);
  });
  test('ninguna respuesta expone contrasena_hash', async () => {
    const id = (await request(app).get('/api/viajes').set(auth(tA))).body[0].id;
    const bodies = [
      (await request(app).get(`/api/viajes/${id}`).set(auth(tA))).body,
      (await request(app).post('/api/auth/registro').send(U('Cami'))).body,
      (await request(app).post('/api/auth/login').send(U('Ana'))).body,
    ];
    bodies.forEach((b) => expect(JSON.stringify(b)).not.toMatch(/hash|contrasena/i));
  });
  test('la contraseña se guarda con hash bcrypt', async () => {
    const [[row]] = await db.query("SELECT contrasena_hash h FROM usuarios WHERE correo='ana@test.com'");
    expect(row.h).toMatch(/^\$2[aby]\$/);
    expect(row.h).not.toContain('clave1234');
  });
  test('el correo se normaliza: no se duplica con mayúsculas', async () => {
    const r = await request(app).post('/api/auth/registro').send({ ...U('Ana'), correo: 'ANA@TEST.COM' });
    expect(r.status).toBe(409);
  });
  test('un usuario ajeno no puede agregar ni retirar participantes -> 403', async () => {
    const id = (await request(app).get('/api/viajes').set(auth(tA))).body[0].id;
    expect((await request(app).post(`/api/viajes/${id}/participantes`).set(auth(tB)).send({ correo: 'ana@test.com' })).status).toBe(403);
    expect((await request(app).delete(`/api/viajes/${id}/participantes/1`).set(auth(tB))).status).toBe(403);
  });
  test('cuerpo demasiado grande -> 413', async () => {
    const r = await request(app).post('/api/auth/login').send({ correo: 'a@b.com', contrasena: 'x'.repeat(20000) });
    expect(r.status).toBe(413);
  });
});

describe('Errores internos', () => {
  test('fallo de base de datos -> 500 genérico', async () => {
    const spy = jest.spyOn(db, 'execute').mockRejectedValueOnce(new Error('ER_SECRET detalle interno'));
    const r = await request(app).get('/api/viajes').set(auth(tA));
    spy.mockRestore();
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toMatch(/ER_SECRET/);
  });
});
