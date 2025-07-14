const express = require("express");
const router = express.Router();

const { listarProfesores, registrarProfesor } = require("./profesorController");

const { verifyToken, requireRole } = require("../../../middlewares/auth");

router.get(
  "/listar-profesores",
  verifyToken,
  requireRole("Administrador"),
  listarProfesores
);
router.post(
  "/registrar-profesor",
  verifyToken,
  requireRole("Administrador"),
  registrarProfesor
);

module.exports = router;
