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
    '/registrar-materia', 
    verifyToken, 
    requireRole('Administrador'), 
    registrarMateriaPlanCicloLectivo
);

router.get(
    '/listar-materias', 
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