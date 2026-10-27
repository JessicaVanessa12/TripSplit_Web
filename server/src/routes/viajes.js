const router = require('express').Router();
const c = require('../controllers/viajesController');
const { requireAuth, requireTripMember, requireOrganizer } = require('../middlewares/auth');
const { validate, validateIds } = require('../middlewares/validate');

router.use(requireAuth);
router.get('/', c.listar);
router.post('/', validate('viaje'), c.crear);
router.get('/:id', validateIds, requireTripMember, c.detalle);
router.post('/:id/participantes', validateIds, requireTripMember, requireOrganizer, validate('participante'), c.agregarParticipante);
router.delete('/:id/participantes/:usuarioId', validateIds, requireTripMember, requireOrganizer, c.retirarParticipante);
module.exports = router;
