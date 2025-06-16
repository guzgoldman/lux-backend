const express = require('express');
const router  = express.Router();

const {
  listarPreinscripcion,
  aceptar,
  ocultar
} = require('./preinscripcionController');

const {
  verifyToken,
  requireRole
} = require('../../../middlewares/auth');

router.get(
  '/',
  verifyToken,
  requireRole('Administrador'),
  listarPreinscripcion
);

router.post(
  '/:personaId/aceptar',
  verifyToken,
  requireRole('Administrador'),
  aceptar
);

router.post(
  '/:personaId/ocultar',
  verifyToken,
  requireRole('Administrador'),
  ocultar
);

module.exports = router;
