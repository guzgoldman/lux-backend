const express = require('express');
const router = express.Router();

const {
    registrarMateriaPlan,
    listarMateriasPlan,
    modificarMateriaPlan
} = require('./materiaPlanController');

const {
    verifyToken,
    requireRole
} = require('../../../../middlewares/auth');

router.post(
    '/:planEstudioId/materias',
     verifyToken, 
     requireRole('Administrador'), 
     registrarMateriaPlan
);

router.get(
    '/:planEstudioId/materias',
    verifyToken,
    requireRole('Administrador'),
    listarMateriasPlan
);
router.put(
    '/materias/:materiaPlanId',
    verifyToken,
    requireRole('Administrador'),
    modificarMateriaPlan
);

module.exports = router;
