const router = require('express').Router();
const { getAll } = require('./userController');

// GET /api/users      <-- protegido
router.get('/', getAll);

module.exports = router;
