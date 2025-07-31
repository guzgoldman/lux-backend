const express = require("express");
const router = express.Router();

const {
  registrarCorrelativa,
  listarCorrelativas,
  modificarCorrelativa,
  eliminarCorrelativa,
} = require("./correlativaController");

const { verifyToken, requireRole } = require("../../../../middlewares/auth");

router.post(
  "/registrar-correlativa",
  verifyToken,
  requireRole("Administrador"),
  registrarCorrelativa
);

router.get(
  "/listar-correlativas",
  verifyToken,
  requireRole("Administrador"),
  listarCorrelativas
);

router.put(
  "/correlativa/:id",
  verifyToken,
  requireRole("Administrador"),
  modificarCorrelativa
);

router.delete(
  "/correlativa/:id",
  verifyToken,
  requireRole("Administrador"),
  eliminarCorrelativa
);

module.exports = router;
