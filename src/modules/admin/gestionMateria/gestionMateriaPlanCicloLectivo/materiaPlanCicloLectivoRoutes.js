const express = require('express');
const router = express.Router();

const {
    registrarMateriaPlanCicloLectivo,
    listarMateriasPlanCicloLectivo,
    modificarMateriaPlanCicloLectivo,
    buscarMateriaPlanCicloLectivoPorId
} = require('./materiaPlanCicloLectivoController');

const {
    verifyToken,
    requireRole
} = require('../../../../middlewares/auth');

router.post(
    '/', 
    verifyToken, 
    requireRole('Administrador'), 
    registrarMateriaPlanCicloLectivo
);

router.get(
    '/', 
    verifyToken, 
    requireRole('Administrador'), 
    listarMateriasPlanCicloLectivo
);

router.put(
    '/:id', 
    verifyToken, 
    requireRole('Administrador'), 
    modificarMateriaPlanCicloLectivo
);

router.get(
    '/:id', 
    verifyToken, 
    requireRole('Administrador'), 
    buscarMateriaPlanCicloLectivoPorId
);

module.exports = router;