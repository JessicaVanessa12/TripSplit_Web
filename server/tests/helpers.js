const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

const auth = (t) => ({ Authorization: `Bearer ${t}` });
async function resetDb() {
  await db.query('SET FOREIGN_KEY_CHECKS=0');
  for (const t of ['participantes_viaje', 'viajes', 'usuarios']) await db.query(`TRUNCATE TABLE ${t}`);
  await db.query('SET FOREIGN_KEY_CHECKS=1');
}
const registrar = async (u) => (await request(app).post('/api/auth/registro').send(u)).body.token;
module.exports = { app, db, auth, resetDb, registrar, request };
