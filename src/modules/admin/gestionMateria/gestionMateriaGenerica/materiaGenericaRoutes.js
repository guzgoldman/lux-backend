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
    '/materias',
    verifyToken,
    requireRole('Administrador'),
    registrarMateriaGenerica
);

router.get(
    '/materias',
    verifyToken,
    requireRole('Administrador'),
    listarMateriasGenericas
);

router.get(
    '/materias/:nombre',
    verifyToken,
    requireRole('Administrador'),
    buscarMateriaPorNombre
);

router.put(
    '/materias/:materiaId',
    verifyToken,
    requireRole('Administrador'),
    modificarMateriaGenerica
);
