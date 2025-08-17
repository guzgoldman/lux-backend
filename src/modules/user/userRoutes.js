const express = require("express");
const router = express.Router();
const { perfil, mostrarDatosPersonales, actualizarDatosPersonales, actualizarPassword} = require("./userController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/perfil", verifyToken, perfil);

router.get("/perfil/:id", verifyToken, requireRole("Administrador"), perfil);

router.get("/:id/datos-personales", verifyToken, mostrarDatosPersonales);
router.put("/:id/actualizar-datos-personales", verifyToken, actualizarDatosPersonales);
router.put("/:id/actualizar-password", verifyToken, actualizarPassword);

module.exports = router;
