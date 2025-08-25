const express = require('express');
const router = express.Router();

const { detalleClase } = require('./claseController');
const { verifyToken, requireRole } = require('../../../middlewares/auth');

router.get('/:claseId/detalle', verifyToken, requireRole('Administrador', 'Profesor'), detalleClase);

module.exports = router;