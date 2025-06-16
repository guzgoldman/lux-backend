const express = require('express');
const router = express.Router();

const { listar } = require('./userController');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.get('/', verifyToken, requireRole('Administrador'), listar);

module.exports = router;
