const Viaje = require('../models/viaje');
const Usuario = require('../models/usuario');

exports.crear = async (req, res, next) => {
  try { res.status(201).json(await Viaje.crear(req.datos, req.usuario.id)); } catch (e) { next(e); }
};
exports.listar = async (req, res, next) => {
  try { res.json(await Viaje.listarDeUsuario(req.usuario.id)); } catch (e) { next(e); }
};
exports.detalle = async (req, res, next) => {
  try {
    const v = await Viaje.buscarPorId(req.params.id);
    res.json({ ...v, rol: req.rol, participantes: await Viaje.participantes(v.id) });
  } catch (e) { next(e); }
};
exports.agregarParticipante = async (req, res, next) => {
  try {
    const u = await Usuario.buscarPorCorreo(req.datos.correo);
    if (!u) return res.status(404).json({ error: 'No hay un usuario registrado con ese correo' });
    if (await Viaje.membresia(req.params.id, u.id)) return res.status(409).json({ error: 'La persona ya participa en el viaje' });
    await Viaje.agregarParticipante(req.params.id, u.id);
    res.status(201).json({ id: u.id, nombre: u.nombre, correo: u.correo, rol: 'participante' });
  } catch (e) { next(e); }
};
exports.retirarParticipante = async (req, res, next) => {
  try {
    if (!(await Viaje.retirarParticipante(req.params.id, req.params.usuarioId)))
      return res.status(404).json({ error: 'Participante no encontrado (el organizador no se puede retirar)' });
    res.status(204).end();
  } catch (e) { next(e); }
};
