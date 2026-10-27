const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const firmar = (u) => jwt.sign({ id: u.id, nombre: u.nombre }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '2h' });
const DUPLICADO = { error: 'No se pudo crear la cuenta: el correo ya está registrado' };

exports.registro = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena } = req.datos;
    if (await Usuario.buscarPorCorreo(correo)) return res.status(409).json(DUPLICADO);
    const usuario = await Usuario.crear({ nombre, correo, hash: await bcrypt.hash(contrasena, 10) });
    res.status(201).json({ usuario, token: firmar(usuario) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json(DUPLICADO);
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.datos;
    const u = await Usuario.buscarPorCorreo(correo);
    if (!u || !(await bcrypt.compare(contrasena, u.contrasena_hash)))
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    res.json({ usuario: { id: u.id, nombre: u.nombre, correo: u.correo }, token: firmar(u) });
  } catch (e) { next(e); }
};
