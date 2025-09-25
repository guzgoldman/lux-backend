const express = require("express");
const router = express.Router();
const {
  getCarrerasInscripto,
  getMateriasPorCarrera,
  registrarInscripcionMateria,
  verificarEstadoInscripcionMaterias,
  obtenerFinalesPorCarrera,
} = require("./alumnoController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/carreras", verifyToken, requireRole("Alumno"), getCarrerasInscripto);
router.get("/carreras/:idCarrera/finales", verifyToken, requireRole("Alumno"), obtenerFinalesPorCarrera);
router.get("/carreras/:idCarrera/materias", verifyToken, requireRole("Alumno"), getMateriasPorCarrera);

router.post(
  "/inscripcion-materia/:idMateriaPlanCicloLectivo",
  verifyToken,
  requireRole("Alumno"),
  registrarInscripcionMateria
);
router.get(
  "/verificar-estado-inscripciones/:planId",
  verifyToken,
  requireRole("Alumno"),
  verificarEstadoInscripcionMaterias
);

module.exports = router;
