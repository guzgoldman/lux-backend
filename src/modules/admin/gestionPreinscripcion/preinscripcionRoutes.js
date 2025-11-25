const express = require('express');
const router  = express.Router();

const {
  listarPreinscripcion,
  aceptar,
  ocultar,
  generarFichaInscripcion
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

router.get(
  '/:personaId/ficha',
  verifyToken,
  requireRole('Administrador'),
  generarFichaInscripcion
);

module.exports = router;
