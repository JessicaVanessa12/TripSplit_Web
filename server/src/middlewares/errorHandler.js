const notFound = (req, res) => res.status(404).json({ error: 'Ruta no encontrada' });

// Mensaje genérico: no se filtran detalles técnicos (500)
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (process.env.NODE_ENV !== 'test') console.error(err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
