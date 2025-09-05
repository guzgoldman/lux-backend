const router = require("express").Router();
const {
  createPreinscripcion,
  getEstadoPreinscripcion,
  toggleEstadoPreinscripcion,
} = require("./preinscripcionController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.post("/", createPreinscripcion);
router.get(
  "/estado",
  verifyToken,
  requireRole("Administrador"),
  getEstadoPreinscripcion
);
router.post(
  "/cambiar-estado",
  verifyToken,
  requireRole("Administrador"),
  toggleEstadoPreinscripcion
);

module.exports = router;
