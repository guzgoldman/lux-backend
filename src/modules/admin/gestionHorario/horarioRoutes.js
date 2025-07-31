const express = require('express');
const router = express.Router();
const { registrarHorario } = require('./horarioController');
const { verifyToken, requireRole } = require('../../../middlewares/auth');

router.post('/registrar-horario', verifyToken, requireRole('Administrador'), registrarHorario);

module.exports = router;