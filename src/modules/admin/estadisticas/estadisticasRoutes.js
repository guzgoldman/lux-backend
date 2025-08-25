const express = require("express");
const router = express.Router();
const { getEstadisticas } = require("./estadisticasController");
const { verifyToken, requireRole } = require("../../../middlewares/auth");

router.get(
  "/ver-estadisticas",
  verifyToken,
  requireRole("Administrador"),
  getEstadisticas
);

module.exports = router;
