const express = require('express');
const router = express.Router();

const {
  registrarMateriaGenerica,
  listarMateriasGenericas,
  modificarMateriaGenerica,
  buscarMateriaPorNombre
} = require('./materiaGenericaController');

const {
  verifyToken,
  requireRole
} = require('../../../../middlewares/auth');

router.post(
    '/registrar-materia',
    verifyToken,
    requireRole('Administrador'),
    registrarMateriaGenerica
);

router.get(
    '/listar-materias',
    verifyToken,
    requireRole('Administrador'),
    listarMateriasGenericas
);

router.get(
    '/:nombre',
    verifyToken,
    requireRole('Administrador'),
    buscarMateriaPorNombre
);

router.put(
    '/:materiaId',
    verifyToken,
    requireRole('Administrador'),
    modificarMateriaGenerica
);

module.exports = router;