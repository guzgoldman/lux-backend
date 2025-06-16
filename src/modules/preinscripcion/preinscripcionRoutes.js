const router = require('express').Router();
const { createPreinscripcion } = require('./preinscripcionController');

router.post('/', createPreinscripcion);

module.exports = router;
