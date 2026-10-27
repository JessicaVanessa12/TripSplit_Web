const jwt = require('jsonwebtoken');
const Viaje = require('../models/viaje');

function requireAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return res.status(401).json({ error: 'Autenticación requerida' });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: p.id, nombre: p.nombre };
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

// Verifica que el viaje exista y que el usuario participe (403 / 404)
async function requireTripMember(req, res, next) {
  try {
    const m = await Viaje.membresia(req.params.id, req.usuario.id);
    if (!m) {
      const existe = await Viaje.buscarPorId(req.params.id);
      return res.status(existe ? 403 : 404).json({ error: existe ? 'No participas en este viaje' : 'Viaje no encontrado' });
    }
    req.rol = m.rol;
    next();
  } catch (err) { next(err); }
}

function requireOrganizer(req, res, next) {
  if (req.rol !== 'organizador') return res.status(403).json({ error: 'Solo el organizador puede hacer esto' });
  next();
}

module.exports = { requireAuth, requireTripMember, requireOrganizer };
