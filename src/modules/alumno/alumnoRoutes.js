const express = require("express");
const router = express.Router();
const { 
    registrarInscripcionMateria, 
    verificarEstadoInscripcionMaterias 
} = require("./alumnoController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.post("/inscripcion-materia/:idMateriaPlanCicloLectivo", verifyToken, requireRole("Alumno"), registrarInscripcionMateria);
router.get("/verificar-estado-inscripciones/:planId", verifyToken, requireRole("Alumno"), verificarEstadoInscripcionMaterias);

module.exports = router;