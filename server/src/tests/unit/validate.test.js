const { validate, validateIds } = require('../../src/middlewares/validate');

const run = (mw, req) => {
  const res = { statusCode: null, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  const next = jest.fn();
  mw(req, res, next);
  return { res, next };
};
const viajeOk = { nombre: 'Kioto', destino: 'Japón', fecha_inicio: '2026-10-12', fecha_fin: '2026-10-24', presupuesto_total: '3200.50' };

describe('validate("registro")', () => {
  test('acepta datos válidos y normaliza el correo', () => {
    const req = { body: { nombre: ' Ana ', correo: 'ANA@Test.com', contrasena: 'clave1234' } };
    const { next } = run(validate('registro'), req);
    expect(next).toHaveBeenCalled();
    expect(req.datos).toEqual({ nombre: 'Ana', correo: 'ana@test.com', contrasena: 'clave1234' });
  });
  test.each([
    ['sin nombre', { nombre: '', correo: 'a@b.com', contrasena: 'clave1234' }],
    ['correo inválido', { nombre: 'A', correo: 'xx', contrasena: 'clave1234' }],
    ['contraseña corta', { nombre: 'A', correo: 'a@b.com', contrasena: 'a1' }],
    ['contraseña sin números', { nombre: 'A', correo: 'a@b.com', contrasena: 'sololetras' }],
    ['contraseña sin letras', { nombre: 'A', correo: 'a@b.com', contrasena: '12345678' }],
    ['contraseña no string', { nombre: 'A', correo: 'a@b.com', contrasena: 12345678 }],
    ['nombre muy largo', { nombre: 'x'.repeat(101), correo: 'a@b.com', contrasena: 'clave1234' }],
  ])('rechaza %s con 400', (_, body) => {
    const { res, next } = run(validate('registro'), { body });
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });
  test('elimina etiquetas HTML del nombre', () => {
    const req = { body: { nombre: '<b>Ana</b><script>x</script>', correo: 'a@b.com', contrasena: 'clave1234' } };
    run(validate('registro'), req);
    expect(req.datos.nombre).not.toMatch(/</);
  });
  test('tolera body ausente', () => {
    expect(run(validate('registro'), {}).res.statusCode).toBe(400);
  });
});

describe('validate("login") y validate("participante")', () => {
  test('login válido / inválido', () => {
    expect(run(validate('login'), { body: { correo: 'a@b.com', contrasena: 'x' } }).next).toHaveBeenCalled();
    expect(run(validate('login'), { body: { correo: 'a@b.com' } }).res.statusCode).toBe(400);
  });
  test('participante válido / inválido', () => {
    expect(run(validate('participante'), { body: { correo: 'a@b.com' } }).next).toHaveBeenCalled();
    expect(run(validate('participante'), { body: { correo: 'no' } }).res.statusCode).toBe(400);
  });
});

describe('validate("viaje")', () => {
  test('acepta un viaje válido', () => {
    const req = { body: viajeOk };
    expect(run(validate('viaje'), req).next).toHaveBeenCalled();
    expect(req.datos.presupuesto_total).toBe(3200.5);
  });
  test('acepta presupuesto 0', () => {
    expect(run(validate('viaje'), { body: { ...viajeOk, presupuesto_total: 0 } }).next).toHaveBeenCalled();
  });
  test.each([
    ['fin antes de inicio', { fecha_fin: '2026-10-01' }],
    ['fecha con formato inválido', { fecha_inicio: '12/10/2026' }],
    ['fecha imposible', { fecha_inicio: '2026-13-45' }],
    ['presupuesto negativo', { presupuesto_total: '-1' }],
    ['presupuesto con 3 decimales', { presupuesto_total: '10.123' }],
    ['presupuesto texto', { presupuesto_total: 'abc' }],
    ['presupuesto enorme', { presupuesto_total: '999999999' }],
    ['sin destino', { destino: ' ' }],
    ['nombre muy largo', { nombre: 'x'.repeat(121) }],
  ])('rechaza %s', (_, cambio) => {
    expect(run(validate('viaje'), { body: { ...viajeOk, ...cambio } }).res.statusCode).toBe(400);
  });
});

describe('validateIds', () => {
  test.each(['1', '42', '2147483647'])('acepta %s', (id) => {
    expect(run(validateIds, { params: { id } }).next).toHaveBeenCalled();
  });
  test.each(['0', '-1', 'abc', '1.5', '1; DROP TABLE', '12345678901'])('rechaza %s', (id) => {
    expect(run(validateIds, { params: { id } }).res.statusCode).toBe(400);
  });
});
