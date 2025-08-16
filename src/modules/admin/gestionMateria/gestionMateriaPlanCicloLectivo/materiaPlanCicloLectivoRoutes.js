const express = require("express");
const router = express.Router();

const {
  registrarMateriaPlanCicloLectivo,
  listarMateriasPlanCicloLectivo,
  modificarMateriaPlanCicloLectivo,
  detalleMateriaPlanCicloLectivo,
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
  requireRole("Administrador"),
  detalleMateriaPlanCicloLectivo
);

module.exports = router;
