const crypto = require('crypto');
const db = require('../config/db');

const FECHAS = "DATE_FORMAT(fecha_inicio,'%Y-%m-%d') AS fecha_inicio, DATE_FORMAT(fecha_fin,'%Y-%m-%d') AS fecha_fin";

module.exports = {
  // Crea el viaje y registra al creador como organizador (transacción)
  async crear(d, organizadorId) {
    const cn = await db.getConnection();
    try {
      await cn.beginTransaction();
      const codigo = crypto.randomBytes(4).toString('hex').toUpperCase();
      const [r] = await cn.execute(
        `INSERT INTO viajes (nombre, destino, fecha_inicio, fecha_fin, presupuesto_total, organizador_id, codigo_invitacion)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [d.nombre, d.destino, d.fecha_inicio, d.fecha_fin, d.presupuesto_total, organizadorId, codigo]);
      await cn.execute("INSERT INTO participantes_viaje (viaje_id, usuario_id, rol) VALUES (?, ?, 'organizador')", [r.insertId, organizadorId]);
      await cn.commit();
      return { id: r.insertId, ...d, organizador_id: organizadorId, codigo_invitacion: codigo };
    } catch (e) { await cn.rollback(); throw e; } finally { cn.release(); }
  },
  async listarDeUsuario(usuarioId) {
    const [rows] = await db.execute(
      `SELECT v.id, v.nombre, v.destino, v.presupuesto_total, p.rol,
              DATE_FORMAT(v.fecha_inicio,'%Y-%m-%d') AS fecha_inicio, DATE_FORMAT(v.fecha_fin,'%Y-%m-%d') AS fecha_fin
       FROM viajes v JOIN participantes_viaje p ON p.viaje_id = v.id
       WHERE p.usuario_id = ? ORDER BY v.fecha_inicio`, [usuarioId]);
    return rows;
  },
  async buscarPorId(id) {
    const [rows] = await db.execute(
      `SELECT id, nombre, destino, presupuesto_total, organizador_id, codigo_invitacion, ${FECHAS} FROM viajes WHERE id = ?`, [id]);
    return rows[0] || null;
  },
  async membresia(viajeId, usuarioId) {
    const [rows] = await db.execute('SELECT rol FROM participantes_viaje WHERE viaje_id = ? AND usuario_id = ?', [viajeId, usuarioId]);
    return rows[0] || null;
  },
  async participantes(viajeId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.nombre, u.correo, p.rol FROM participantes_viaje p
       JOIN usuarios u ON u.id = p.usuario_id WHERE p.viaje_id = ? ORDER BY p.id`, [viajeId]);
    return rows;
  },
  async agregarParticipante(viajeId, usuarioId) {
    await db.execute("INSERT INTO participantes_viaje (viaje_id, usuario_id, rol) VALUES (?, ?, 'participante')", [viajeId, usuarioId]);
  },
  async retirarParticipante(viajeId, usuarioId) {
    const [r] = await db.execute("DELETE FROM participantes_viaje WHERE viaje_id = ? AND usuario_id = ? AND rol <> 'organizador'", [viajeId, usuarioId]);
    return r.affectedRows > 0;
  },
};
