// /modules/adminPreinscripcion/adminPreinscripcionRoutes.js
const express = require('express');
const router  = express.Router();

const {
  listarPendientes,
  aceptar
} = require('./adminPreinscripcionController');

const {
  verifyToken,
  requireRole
} = require('../../middlewares/auth');

router.get(
  '/',
  verifyToken,
  requireRole('Administrador'),
  listarPendientes
);

router.post(
  '/:personaId/aceptar',
  verifyToken,
  requireRole('Administrador'),
  aceptar
);

module.exports = router;
