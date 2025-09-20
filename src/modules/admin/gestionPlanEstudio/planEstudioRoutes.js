const express = require("express");
const router = express.Router();
const {
  registrarPlanEstudio,
  listarPlanesEstudio,
  modificarPlanEstudio,
  cambiarEstadoPlanEstudio,
  obtenerPlanEstudioAlumno,
} = require("./planEstudioController");

const { verifyToken, requireRole } = require("../../../middlewares/auth");

router.post(
  "/:carreraId/registrar-plan",
  verifyToken,
  requireRole("Administrador"),
  registrarPlanEstudio
);

router.get(
  "/listar-planes",
  verifyToken,
  requireRole("Administrador"),
  listarPlanesEstudio
);

router.put(
  "/:planEstudioId/modificar",
  verifyToken,
  requireRole("Administrador"),
  modificarPlanEstudio
);

router.patch(
  "/:planEstudioId/cambiar-estado",
  verifyToken,
  requireRole("Administrador"),
  cambiarEstadoPlanEstudio
);

router.get(
  "/alumno/obtener-plan-asignado",
  verifyToken,
  requireRole("Alumno"),
  obtenerPlanEstudioAlumno
);

module.exports = router;
