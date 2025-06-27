const express = require('express');
const router = express.Router();
const {
  registrarPlanEstudio,
  listarPlanesEstudio,
  modificarPlanEstudio,
  cambiarEstadoPlanEstudio
} = require('./planEstudioController');

const {
    verifyToken,
    requireRole
} = require('../../../middlewares/auth');

router.post(
    '/:carreraId/registrar-plan-estudio',
    verifyToken,
    requireRole('Administrador'),
    registrarPlanEstudio);

router.get(
    '/listar-planes-estudio',
    verifyToken,
    requireRole('Administrador'),
    listarPlanesEstudio);

router.put(
    '/:planEstudioId/modificar',
    verifyToken,
    requireRole('Administrador'),
    modificarPlanEstudio);

router.patch(
    '/:planEstudioId/cambiar-estado',
    verifyToken,
    requireRole('Administrador'),
    cambiarEstadoPlanEstudio);

module.exports = router;
