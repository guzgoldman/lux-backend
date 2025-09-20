const express = require('express');
const router = express.Router();
const { 
  registrarExamenFinal, 
  listarExamenesFinales, 
  detalleExamenFinal,
  obtenerAlumnosInscriptos,
  registrarAsistencia,
  obtenerCalificaciones,
  actualizarCalificacion,
  actualizarConfiguracion,
  bloquearCalificacion,
  obtenerProfesoresPorMateria
} = require('./examenFinalController');
const { requireRole, verifyToken } = require("../../../middlewares/auth");

// Rutas básicas
router.post('/registrar', verifyToken, requireRole("Administrador"), registrarExamenFinal);
router.get('/listar-examenes', verifyToken, listarExamenesFinales);
router.get('/:id/detalle', verifyToken, detalleExamenFinal);

// Rutas para gestión de alumnos y asistencia
router.get('/:id/alumnos', verifyToken, obtenerAlumnosInscriptos);
router.post('/:idExamen/asistencia', verifyToken, registrarAsistencia);

// Rutas para calificaciones
router.get('/:id/calificaciones', verifyToken, obtenerCalificaciones);
router.put('/calificaciones/:idInscripcion', verifyToken, actualizarCalificacion);
router.put('/calificaciones/:idInscripcion/bloquear', verifyToken, requireRole("Administrador"), bloquearCalificacion);

// Rutas para configuración (solo admin)
router.put('/:id/configuracion', verifyToken, requireRole("Administrador"), actualizarConfiguracion);

// Rutas para obtener profesores por materia
router.get('/profesores-materia/:idMateria', verifyToken, obtenerProfesoresPorMateria);

module.exports = router;