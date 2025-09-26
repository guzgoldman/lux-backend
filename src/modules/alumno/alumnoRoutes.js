const express = require("express");
const router = express.Router();
const {
  getCarrerasInscripto,
  getMateriasPorCarrera,
  registrarInscripcionMateria,
  verificarEstadoInscripcionMaterias,
  listarExamenesPorPlan,
  verificarEstadoInscripcionFinales,
} = require("./alumnoController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/carreras", verifyToken, requireRole("Alumno"), getCarrerasInscripto);
router.get("/planes-estudio/:idPlan/finales", verifyToken, requireRole("Alumno"), listarExamenesPorPlan);
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
router.get(
  "/planes-estudio/:idPlan/finales/estado",
  verifyToken,
  requireRole("Alumno"),
  verificarEstadoInscripcionFinales
);

module.exports = router;
