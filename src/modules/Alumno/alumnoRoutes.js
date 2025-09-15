const express = require("express");
const router = express.Router();
const {
  getCarrerasInscripto,
  getMateriasPorCarrera,
} = require("./alumnoController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/carreras", verifyToken, getCarrerasInscripto);

router.get("/carreras/:idCarrera/materias", verifyToken, getMateriasPorCarrera);

module.exports = router;
