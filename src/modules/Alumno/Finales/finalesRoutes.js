const express = require("express");
const router = express.Router();
const { getFinalesPorCarrera } = require("./finalesController");
const { verifyToken } = require("../../../middlewares/auth");
const finalesRoutes = require("./src/modules/Alumno/Finales/finalesRoutes");

// Finales del alumno autenticado para una carrera específica
router.get("/carreras/:idCarrera/finales", verifyToken, getFinalesPorCarrera);

app.use("/admin/alumno", finalesRoutes);

module.exports = router;