const express = require('express');
const router = express.Router();
const { registrarAsistencia } = require('./asistenciaController');
const { verifyToken, requireRole } = require('../../../middlewares/auth');

router.post('/registrar-asistencia', verifyToken, requireRole('Administrador'), registrarAsistencia);

module.exports = router;