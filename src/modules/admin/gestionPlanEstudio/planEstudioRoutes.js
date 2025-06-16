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
    '/:carreraId/planes-estudio',
    verifyToken,
    requireRole('Administrador'),
    registrarPlanEstudio);

router.get(
    '/planes-estudio',
    verifyToken,
    requireRole('Administrador'),
    listarPlanesEstudio);

router.put(
    '/planes-estudio/:planEstudioId',
    verifyToken,
    requireRole('Administrador'),
    modificarPlanEstudio);

router.patch(
    '/planes-estudio/:planEstudioId/estado',
    verifyToken,
    requireRole('Administrador'),
    cambiarEstadoPlanEstudio);

module.exports = router;
