const db = require('../config/db');

module.exports = {
  async crear({ nombre, correo, hash }) {
    const [r] = await db.execute('INSERT INTO usuarios (nombre, correo, contrasena_hash) VALUES (?, ?, ?)', [nombre, correo, hash]);
    return { id: r.insertId, nombre, correo };
  },
  async buscarPorCorreo(correo) {
    const [rows] = await db.execute('SELECT id, nombre, correo, contrasena_hash FROM usuarios WHERE correo = ?', [correo]);
    return rows[0] || null;
  },
};
