const express = require('express');
const router = express.Router();

const {
    registrarCorrelativa,
    listarCorrelativas,
    modificarCorrelativa,
    eliminarCorrelativa
} = require('./correlativaController');

const {
    verifyToken,
    requireRole
} = require('../../../middlewares/auth');

router.post(
    '/correlativas',
    verifyToken,
    requireRole('Administrador'),
    registrarCorrelativa
);

router.get(
    '/correlativas',
    verifyToken,
    requireRole('Administrador'),
    listarCorrelativas
);

router.put(
    '/correlativas/:id',
    verifyToken,
    requireRole('Administrador'),
    modificarCorrelativa
);

router.delete(
    '/correlativas/:id',
    verifyToken,
    requireRole('Administrador'),
    eliminarCorrelativa
);

module.exports = router;