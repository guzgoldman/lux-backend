const express = require('express');
const router = express.Router();
const { registrarTema } = require('./temaController');
const { verifyToken, requireRole } = require('../../../middlewares/auth');

router.post('/registrar-tema', verifyToken, requireRole('Administrador'), registrarTema);

module.exports = router;