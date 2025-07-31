const express = require('express');
const router = express.Router();

const { detalleClase, registrarClase } = require('./claseController');
const { verifyToken, requireRole } = require('../../../middlewares/auth');

router.get('/:claseId/detalle', verifyToken, requireRole('Administrador'), detalleClase);
router.post('/registrar-clase', verifyToken, requireRole('Administrador'), registrarClase);

module.exports = router;