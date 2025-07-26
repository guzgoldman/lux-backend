const express = require("express");
const router = express.Router();
const {
  registrarCarrera,
  listarCarreras,
  modificarCarrera,
} = require("./carreraController");
const { verifyToken, requireRole } = require("../../../middlewares/auth");

router.post(
  "/registrar-carrera",
  verifyToken,
  requireRole("Administrador"),
  registrarCarrera
);

router.get(
  "/listar-carreras",
  verifyToken,
  requireRole("Administrador"),
  listarCarreras
);

router.put(
  "/:carreraId",
  verifyToken,
  requireRole("Administrador"),
  modificarCarrera
);

module.exports = router;
