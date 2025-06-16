const express = require('express');
const router  = express.Router();
const auth    = require('./authController');
const { verifyToken } = require('../../middlewares/auth');

router.post('/login',       auth.login);
router.post('/seleccionar-rol', auth.seleccionarRol);
router.get('/me', verifyToken, auth.me);
router.post('/logout', auth.logout);

module.exports = router;
