const express = require("express");
const router = express.Router();
const equivalenciasController = require("./equivalenciasController");
const { verifyToken, requireRole } = require("../../../middlewares/auth");

// ==================== RUTAS PARA ALUMNOS ====================
// POST /api/equivalencias - Registrar nueva solicitud de equivalencia
router.post(
  "/alumno/solicitar",
  verifyToken,
  requireRole("Alumno"),
  equivalenciasController.registrarSolicitud
);

// GET /api/equivalencias - Obtener todas las solicitudes del alumno
router.get(
  "/",
  verifyToken,
  requireRole("Alumno"),
  equivalenciasController.obtenerSolicitudesAlumno
);

// GET /api/equivalencias/:id - Obtener una solicitud específica
router.get(
  "/:id",
  verifyToken,
  requireRole("Alumno"),
  equivalenciasController.obtenerSolicitudPorId
);

// ==================== RUTAS PARA ADMINISTRADORES ====================
// GET /api/equivalencias/admin/alumnos - Obtener todos los alumnos con solicitudes
router.get(
  "/admin/alumnos",
  verifyToken,
  requireRole("Administrador"),
  equivalenciasController.obtenerAlumnosConSolicitudes
);

// PUT /api/equivalencias/admin/:id/aprobar - Aprobar solicitud
router.put(
  "/admin/:id/aprobar",
  verifyToken,
  requireRole("Administrador"),
  equivalenciasController.aprobarSolicitud
);

// PUT /api/equivalencias/admin/:id/rechazar - Rechazar solicitud
router.put(
  "/admin/:id/rechazar",
  verifyToken,
  requireRole("Administrador"),
  equivalenciasController.rechazarSolicitud
);

// PUT /api/equivalencias/admin/:id/editar - Editar solicitud pendiente
router.put(
  "/admin/:id/editar",
  verifyToken,
  requireRole("Administrador"),
  equivalenciasController.editarSolicitud
);

module.exports = router;
