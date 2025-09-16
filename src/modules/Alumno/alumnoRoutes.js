const express = require("express");
const router = express.Router();
const {
  perfil,
  getCarrerasInscripto,
  getMateriasPorCarrera,
} = require("./userController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/perfil", verifyToken, perfil);
router.get("/perfil/:id", verifyToken, requireRole("Administrador"), perfil);

router.get("/:id/datos-personales", verifyToken, mostrarDatosPersonales);
router.put(
  "/:id/actualizar-datos-personales",
  verifyToken,
  actualizarDatosPersonales
);
router.put("/:id/actualizar-password", verifyToken, actualizarPassword);

router.get("/:idAlumno/carreras", verifyToken, getCarrerasInscripto);
router.get(
  "/:idAlumno/carreras/:idCarrera/materias",
  verifyToken,
  getMateriasPorCarrera
);

module.exports = router;

