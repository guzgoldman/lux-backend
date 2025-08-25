const express = require("express");
const router = express.Router();

const {
  registrarMateriaPlanCicloLectivo,
  listarMateriasPlanCicloLectivo,
  modificarMateriaPlanCicloLectivo,
  detalleMateriaPlanCicloLectivo,
  asignarProfesor,
  crearClase,
  listarClasesPorMateria,
  asignarHorarioMateria,
  registrarClaseInformacion,
} = require("./materiaPlanCicloLectivoController");

const { verifyToken, requireRole } = require("../../../../middlewares/auth");

router.post(
  "/registrar-materia",
  verifyToken,
  requireRole("Administrador"),
  registrarMateriaPlanCicloLectivo
);

router.get(
  "/listar-materias",
  verifyToken,
  requireRole("Administrador"),
  listarMateriasPlanCicloLectivo
);

router.put(
  "/modificar-materia/:id",
  verifyToken,
  requireRole("Administrador"),
  modificarMateriaPlanCicloLectivo
);

router.get(
  "/:id/detalle",
  verifyToken,
  requireRole("Administrador", "Profesor"),
  detalleMateriaPlanCicloLectivo
);

router.post(
  "/:materiaId/asignar-profesor",
  verifyToken,
  requireRole("Administrador"),
  asignarProfesor
);

router.post(
  "/crear-clase",
  verifyToken,
  requireRole("Administrador", "Profesor"),
  crearClase
);

router.get(
  "/:materiaId/listar-clases",
  verifyToken,
  requireRole("Administrador", "Profesor"),
  listarClasesPorMateria
);

router.post(
  "/asignar-horario",
  verifyToken,
  requireRole("Administrador"),
  asignarHorarioMateria
);

router.post(
  "/registrar-informacion-clase",
  verifyToken,
  requireRole("Administrador", "Profesor"),
  registrarClaseInformacion
);

module.exports = router;
