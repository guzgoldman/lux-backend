const express = require('express');
const router = express.Router();

const {
    registrarCarrera,
    listarCarreras,
    modificarCarrera
} = require('./carreraController');

const {
    verifyToken,
    requireRole
} = require('../../../middlewares/auth');

router.post(
    '/carreras',
    verifyToken,
    requireRole('Administrador'),
    registrarCarrera
);

router.get(
    '/carreras',
    verifyToken,
    requireRole('Administrador'),
    listarCarreras
);

router.put(
    '/carreras/:id',
    verifyToken,
    requireRole('Administrador'),
    modificarCarrera
);

module.exports = router;