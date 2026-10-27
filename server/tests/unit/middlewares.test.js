process.env.JWT_SECRET = 'secreto_unitario';
process.env.NODE_ENV = 'test';
const jwt = require('jsonwebtoken');
const { requireAuth, requireOrganizer } = require('../../src/middlewares/auth');
const { errorHandler, notFound } = require('../../src/middlewares/errorHandler');

const mkRes = () => ({ statusCode: null, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } });

describe('requireAuth', () => {
  test('sin cabecera -> 401', () => {
    const res = mkRes(); const next = jest.fn();
    requireAuth({ headers: {} }, res, next);
    expect(res.statusCode).toBe(401); expect(next).not.toHaveBeenCalled();
  });
  test('esquema distinto de Bearer -> 401', () => {
    const res = mkRes();
    requireAuth({ headers: { authorization: 'Basic abc' } }, res, jest.fn());
    expect(res.statusCode).toBe(401);
  });
  test('token firmado con otro secreto -> 401', () => {
    const t = jwt.sign({ id: 1 }, 'otro');
    const res = mkRes();
    requireAuth({ headers: { authorization: `Bearer ${t}` } }, res, jest.fn());
    expect(res.statusCode).toBe(401);
  });
  test('token expirado -> 401', () => {
    const t = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -10 });
    const res = mkRes();
    requireAuth({ headers: { authorization: `Bearer ${t}` } }, res, jest.fn());
    expect(res.statusCode).toBe(401);
  });
  test('token válido -> next y req.usuario', () => {
    const t = jwt.sign({ id: 7, nombre: 'Ana' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${t}` } }; const next = jest.fn();
    requireAuth(req, mkRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual({ id: 7, nombre: 'Ana' });
  });
});

describe('requireOrganizer', () => {
  test('participante -> 403', () => {
    const res = mkRes(); requireOrganizer({ rol: 'participante' }, res, jest.fn());
    expect(res.statusCode).toBe(403);
  });
  test('organizador -> next', () => {
    const next = jest.fn(); requireOrganizer({ rol: 'organizador' }, mkRes(), next);
    expect(next).toHaveBeenCalled();
  });
});

describe('errorHandler / notFound', () => {
  test('error desconocido -> 500 genérico, sin detalles', () => {
    const res = mkRes();
    errorHandler(new Error('SELECT * FROM secret'), {}, res, jest.fn());
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/SELECT/);
  });
  test('JSON malformado -> 400', () => {
    const res = mkRes(); errorHandler({ type: 'entity.parse.failed' }, {}, res, jest.fn());
    expect(res.statusCode).toBe(400);
  });
  test('cuerpo demasiado grande -> 413', () => {
    const res = mkRes(); errorHandler({ status: 413 }, {}, res, jest.fn());
    expect(res.statusCode).toBe(413);
  });
  test('notFound -> 404', () => {
    const res = mkRes(); notFound({}, res);
    expect(res.statusCode).toBe(404);
  });
});
