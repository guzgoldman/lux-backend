const express = require("express");
const router = express.Router();

const {
  obtenerConfiguracion,
  obtenerConfiguracionPublica,
  toggleInscripcionesMaterias,
  toggleInscripcionesFinales,
  togglePreinscripciones,
} = require("./configuracionController");

const { verifyToken, requireRole } = require("../../../middlewares/auth");

router.get(
  "/",
  verifyToken,
  requireRole("Administrador"),
  obtenerConfiguracion
);

router.get(
  "/publica",
  obtenerConfiguracionPublica
);

router.post(
  "/toggle-inscripciones-materias",
  verifyToken,
  requireRole("Administrador"),
  toggleInscripcionesMaterias
);

router.post(
  "/toggle-inscripciones-finales",
  verifyToken,
  requireRole("Administrador"),
  toggleInscripcionesFinales
);

router.post(
  "/toggle-preinscripciones",
  verifyToken,
  requireRole("Administrador"),
  togglePreinscripciones
);

module.exports = router;
