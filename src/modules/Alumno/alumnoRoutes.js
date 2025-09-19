const express = require("express");
const router = express.Router();
const {
  getCarrerasInscripto,
  getMateriasPorCarrera,
} = require("./alumnoController");
const { verifyToken } = require("../../middlewares/auth");

// Carreras en las que está inscripto el alumno autenticado
router.get("/carreras", verifyToken, getCarrerasInscripto);

// Materias de una carrera específica del alumno autenticado
router.get("/carreras/:idCarrera/materias", verifyToken, getMateriasPorCarrera);

module.exports = router;
