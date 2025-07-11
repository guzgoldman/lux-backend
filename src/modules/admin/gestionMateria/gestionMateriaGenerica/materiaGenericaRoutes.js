const express = require('express');
const router = express.Router();

const {
  registrarMateria,
  listarMaterias,
  editarMateria,
} = require('./materiaGenericaController');

const {
  verifyToken,
  requireRole
} = require('../../../../middlewares/auth');

router.post(
    '/registrar-materia',
    verifyToken,
    requireRole('Administrador'),
    registrarMateria
);

router.get(
    '/listar-materias',
    verifyToken,
    requireRole('Administrador'),
    listarMaterias
);

router.put(
    '/:id',
    verifyToken,
    requireRole('Administrador'),
    editarMateria
);

module.exports = router;