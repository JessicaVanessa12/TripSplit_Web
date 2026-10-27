const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { validate } = require('../middlewares/validate');

const limite = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intenta más tarde' },
});

router.post('/registro', limite, validate('registro'), c.registro);
router.post('/login', limite, validate('login'), c.login);
module.exports = router;
