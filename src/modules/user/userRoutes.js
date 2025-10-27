const express = require("express");
const router = express.Router();
const { 
  perfil, 
  mostrarDatosPersonales, 
  actualizarDatosPersonales, 
  actualizarPassword, 
  listarAlumnos, 
  listarCarreras, 
  buscarAlumnos, 
  obtenerIdPersona,
  solicitarCambioDato,
  verificarCambioDato,
  cancelarCambioDato,
  obtenerVerificacionesPendientes
} = require("./userController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/perfil", verifyToken, perfil);
router.get("/perfil/:id", verifyToken, requireRole("Administrador"), perfil);

router.get("/listar-alumnos", verifyToken, requireRole("Administrador"), listarAlumnos);
router.get("/listar-carreras", verifyToken, requireRole("Administrador"), listarCarreras);
router.get("/buscar-alumnos", verifyToken, requireRole("Administrador"), buscarAlumnos);

router.get("/:id/datos-personales", verifyToken, mostrarDatosPersonales);
router.put("/:id/actualizar-datos-personales", verifyToken, actualizarDatosPersonales);
router.put("/:id/actualizar-password", verifyToken, actualizarPassword);

// Nuevas rutas para verificación de cambios
router.post("/:id/solicitar-cambio-dato", verifyToken, solicitarCambioDato);
router.post("/:id/verificar-cambio-dato", verifyToken, verificarCambioDato);
router.post("/:id/cancelar-cambio-dato", verifyToken, cancelarCambioDato);
router.get("/:id/verificaciones-pendientes", verifyToken, obtenerVerificacionesPendientes);

router.get("/obtener-id-persona", verifyToken, obtenerIdPersona);

module.exports = router;