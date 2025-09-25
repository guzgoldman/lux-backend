const express = require("express");
const router = express.Router();
const { perfil, mostrarDatosPersonales, actualizarDatosPersonales, actualizarPassword, listarAlumnos, listarCarreras, buscarAlumnos, obtenerIdPersona } = require("./userController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/perfil", verifyToken, perfil);
router.get("/perfil/:id", verifyToken, requireRole("Administrador"), perfil);

router.get("/listar-alumnos", verifyToken, requireRole("Administrador"), listarAlumnos);
router.get("/listar-carreras", verifyToken, requireRole("Administrador"), listarCarreras);
router.get("/buscar-alumnos", verifyToken, requireRole("Administrador"), buscarAlumnos);

router.get("/:id/datos-personales", verifyToken, mostrarDatosPersonales);
router.put("/:id/actualizar-datos-personales", verifyToken, actualizarDatosPersonales);
router.put("/:id/actualizar-password", verifyToken, actualizarPassword);

router.get("/obtener-id-persona", verifyToken, obtenerIdPersona);

module.exports = router;