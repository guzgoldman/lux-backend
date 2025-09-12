const express = require("express");
const router = express.Router();

const {
  registrarMateriaPlan,
  listarMateriasPlan,
  modificarMateriaPlan,
} = require("./materiaPlanController");

const { verifyToken, requireRole } = require("../../../../middlewares/auth");

router.post(
  "/:planEstudioId/registrar-materia",
  verifyToken,
  requireRole("Administrador"),
  registrarMateriaPlan
);

router.get(
  "/listar-materias",
  verifyToken,
  requireRole("Administrador", "Profesor"),
  listarMateriasPlan
);
router.put(
  "/:materiaPlanId",
  verifyToken,
  requireRole("Administrador"),
  modificarMateriaPlan
);

module.exports = router;
