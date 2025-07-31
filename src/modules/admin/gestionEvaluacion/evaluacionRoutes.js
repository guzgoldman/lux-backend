const express = require('express');
const router = express.Router();
const { registrarEvaluacion } = require('./evaluacionController');
const { verifyToken, requireRole } = require('../../../middlewares/auth');

router.post('/registrar-evaluacion', verifyToken, requireRole('Administrador'), registrarEvaluacion);

module.exports = router;