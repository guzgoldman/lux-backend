const express = require('express');
const router = express.Router();
const equivalenciasController = require('./equivalenciasController');
const { 
  validarRegistroSolicitud, 
  validarIdSolicitud,
  validarAprobacionSolicitud,
  validarRechazoSolicitud
} = require('./equivalenciasValidation');
const { auth } = require('../../../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(auth);

// ==================== RUTAS PARA ALUMNOS ====================
// POST /api/equivalencias - Registrar nueva solicitud de equivalencia
router.post('/', validarRegistroSolicitud, equivalenciasController.registrarSolicitud);

// GET /api/equivalencias - Obtener todas las solicitudes del alumno
router.get('/', equivalenciasController.obtenerSolicitudesAlumno);

// GET /api/equivalencias/:id - Obtener una solicitud específica
router.get('/:id', validarIdSolicitud, equivalenciasController.obtenerSolicitudPorId);

// ==================== RUTAS PARA ADMINISTRADORES ====================
// GET /api/equivalencias/admin/alumnos - Obtener todos los alumnos con solicitudes
router.get('/admin/alumnos', equivalenciasController.obtenerAlumnosConSolicitudes);

// PUT /api/equivalencias/admin/:id/aprobar - Aprobar solicitud
router.put('/admin/:id/aprobar', 
  validarIdSolicitud, 
  validarAprobacionSolicitud, 
  equivalenciasController.aprobarSolicitud
);

// PUT /api/equivalencias/admin/:id/rechazar - Rechazar solicitud
router.put('/admin/:id/rechazar', 
  validarIdSolicitud, 
  validarRechazoSolicitud, 
  equivalenciasController.rechazarSolicitud
);

// PUT /api/equivalencias/admin/:id/editar - Editar solicitud pendiente
router.put('/admin/:id/editar', validarIdSolicitud, equivalenciasController.editarSolicitud);

module.exports = router;