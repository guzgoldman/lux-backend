const { body, param, validationResult } = require('express-validator');

// Validación para registrar solicitud
exports.validarRegistroSolicitud = [
  body('origenInstitucion')
    .notEmpty()
    .withMessage('La institución de origen es obligatoria')
    .isLength({ max: 120 })
    .withMessage('La institución de origen no puede exceder 120 caracteres'),
  
  body('origenMateria')
    .notEmpty()
    .withMessage('La materia de origen es obligatoria')
    .isLength({ max: 120 })
    .withMessage('La materia de origen no puede exceder 120 caracteres'),
  
  body('origenCalificacion')
    .notEmpty()
    .withMessage('La calificación de origen es obligatoria')
    .isLength({ max: 20 })
    .withMessage('La calificación de origen no puede exceder 20 caracteres'),
  
  body('resolucion')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La resolución no puede exceder 50 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de solicitud
exports.validarIdSolicitud = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'ID inválido',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para aprobar solicitud
exports.validarAprobacionSolicitud = [
  body('idMateriaPlanCicloLectivo')
    .isInt({ min: 1 })
    .withMessage('El ID de materia plan ciclo lectivo debe ser un número entero positivo'),
  
  body('notaFinal')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('La nota final debe ser un número decimal válido')
    .custom((value) => {
      if (parseFloat(value) < 0 || parseFloat(value) > 10) {
        throw new Error('La nota final debe estar entre 0 y 10');
      }
      return true;
    }),

  body('origenInstitucion')
    .optional()
    .isLength({ max: 120 })
    .withMessage('La institución de origen no puede exceder 120 caracteres'),
  
  body('origenMateria')
    .optional()
    .isLength({ max: 120 })
    .withMessage('La materia de origen no puede exceder 120 caracteres'),
  
  body('origenCalificacion')
    .optional()
    .isLength({ max: 20 })
    .withMessage('La calificación de origen no puede exceder 20 caracteres'),
  
  body('resolucion')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La resolución no puede exceder 50 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para rechazar solicitud
exports.validarRechazoSolicitud = [
  body('motivoRechazo')
    .notEmpty()
    .withMessage('El motivo de rechazo es obligatorio')
    .isLength({ min: 10 })
    .withMessage('El motivo de rechazo debe tener al menos 10 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];