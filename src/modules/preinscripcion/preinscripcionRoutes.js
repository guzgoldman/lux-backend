// src/modules/preinscripcion/preinscripcion.routes.js
const router = require('express').Router();
const { createPreinscripcion } = require('./preinscripcionController');

router.post('/', createPreinscripcion);

module.exports = router;
