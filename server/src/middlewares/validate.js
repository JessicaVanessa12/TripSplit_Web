// Validación y saneamiento de entradas en el servidor (RNF-02)
const limpiar = (t) => String(t ?? '').replace(/<[^>]*>/g, '').trim();
const esFecha = (f) => /^\d{4}-\d{2}-\d{2}$/.test(f) && !Number.isNaN(Date.parse(f));
const esCorreo = (c) => c.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);

const esquemas = {
  registro(b) {
    const e = [];
    const nombre = limpiar(b.nombre);
    const correo = limpiar(b.correo).toLowerCase();
    const contrasena = typeof b.contrasena === 'string' ? b.contrasena : '';
    if (!nombre || nombre.length > 100) e.push('Nombre obligatorio (máx. 100 caracteres).');
    if (!esCorreo(correo)) e.push('Correo inválido.');
    if (contrasena.length < 8 || contrasena.length > 72 || !/[A-Za-z]/.test(contrasena) || !/\d/.test(contrasena))
      e.push('La contraseña debe tener 8 a 72 caracteres, con letras y números.');
    return { e, datos: { nombre, correo, contrasena } };
  },
  login(b) {
    const correo = limpiar(b.correo).toLowerCase();
    const contrasena = typeof b.contrasena === 'string' ? b.contrasena : '';
    const e = !esCorreo(correo) || !contrasena ? ['Correo y contraseña son obligatorios.'] : [];
    return { e, datos: { correo, contrasena } };
  },
  viaje(b) {
    const e = [];
    const nombre = limpiar(b.nombre);
    const destino = limpiar(b.destino);
    const presupuesto = Number(b.presupuesto_total);
    if (!nombre || nombre.length > 120) e.push('Nombre obligatorio (máx. 120 caracteres).');
    if (!destino || destino.length > 120) e.push('Destino obligatorio (máx. 120 caracteres).');
    if (!esFecha(b.fecha_inicio) || !esFecha(b.fecha_fin)) e.push('Fechas con formato AAAA-MM-DD.');
    else if (b.fecha_fin < b.fecha_inicio) e.push('La fecha de fin no puede ser anterior a la de inicio.');
    if (!Number.isFinite(presupuesto) || presupuesto > 99999999 || !/^\d+(\.\d{1,2})?$/.test(String(b.presupuesto_total)))
      e.push('Presupuesto numérico, mayor o igual a 0, con máximo 2 decimales.');
    return { e, datos: { nombre, destino, fecha_inicio: b.fecha_inicio, fecha_fin: b.fecha_fin, presupuesto_total: presupuesto } };
  },
  participante(b) {
    const correo = limpiar(b.correo).toLowerCase();
    return { e: esCorreo(correo) ? [] : ['Correo inválido.'], datos: { correo } };
  },
};

const validate = (nombre) => (req, res, next) => {
  const { e, datos } = esquemas[nombre](req.body || {});
  if (e.length) return res.status(400).json({ error: 'Datos inválidos', detalles: e });
  req.datos = datos;
  next();
};

// IDs de ruta: enteros positivos
const validateIds = (req, res, next) => {
  for (const v of Object.values(req.params)) {
    if (!/^[1-9]\d{0,9}$/.test(v)) return res.status(400).json({ error: 'Identificador inválido' });
  }
  next();
};

module.exports = { validate, validateIds };
