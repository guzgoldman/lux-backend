const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("../modules/auth/authRoutes");
const userRoutes = require("../modules/user/userRoutes");
const preinscripcionRoutes = require("../modules/preinscripcion/preinscripcionRoutes");
const gestionPreinscripcionRoutes = require("../modules/admin/gestionPreinscripcion/preinscripcionRoutes");
const gestionMateriaGenericaRoutes = require("../modules/admin/gestionMateria/gestionMateriaGenerica/materiaGenericaRoutes");
const gestionMateriaPlanRoutes = require("../modules/admin/gestionMateria/gestionMateriaPlan/materiaPlanRoutes");
const gestionMateriaPlanCicloLectivoRoutes = require("../modules/admin/gestionMateria/gestionMateriaPlanCicloLectivo/materiaPlanCicloLectivoRoutes");
const gestionPlanEstudiosRoutes = require("../modules/admin/gestionPlanEstudio/planEstudioRoutes");
const gestionCorrelativasRoutes = require("../modules/admin/gestionMateria/gestionCorrelativa/correlativaRoutes");
const estadisticasRoutes = require("../modules/admin/estadisticas/estadisticasRoutes");
const gestionProfesorRoutes = require("../modules/admin/gestionProfesor/profesorRoutes");
const gestionClaseRoutes = require("../modules/admin/gestionClase/claseRoutes");
const gestionAsistenciaRoutes = require("../modules/admin/gestionAsistencia/asistenciaRoutes");
const gestionExamenFinalRoutes = require("../modules/admin/gestionExamenFinal/examenFinalRoutes");
const errorHandler = require("../middlewares/errorHandler");
const gestionCarreraRoutes = require("../modules/admin/gestionCarrera/carreraRoutes");
const alumnoRoutes = require("../modules/Alumno/alumnoRoutes")
const equivalenciasRoutes = require("../modules/admin/equivalencias/equivalenciasRoutes");
const pdfRoutes = require('../pdf/pdf.routes')
const alumnoRoutes = require("../modules/alumno/alumnoRoutes");
const equivalenciasRoutes = require("../modules/admin/equivalencias/equivalenciasRoutes");

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: ${process.env.CORS_ORIGIN},
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/pdf", pdfRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuario", userRoutes);
app.use("/api/preinscripcion", preinscripcionRoutes);
app.use("/api/admin/preinscripcion", gestionPreinscripcionRoutes);
app.use("/api/admin/carrera", gestionCarreraRoutes);
app.use("/api/admin/materia", gestionMateriaGenericaRoutes);
app.use("/api/admin/materia/materia-plan", gestionMateriaPlanRoutes);
app.use(
  "/api/admin/materia/materia-plan-ciclo",
  gestionMateriaPlanCicloLectivoRoutes
);
app.use("/api/admin/plan-estudio", gestionPlanEstudiosRoutes);
app.use("/api/admin/correlativa", gestionCorrelativasRoutes);
app.use("/api/admin/profesor", gestionProfesorRoutes);
app.use("/api/admin/estadisticas", estadisticasRoutes);
app.use("/api/admin/clase", gestionClaseRoutes);
app.use("/api/admin/asistencia", gestionAsistenciaRoutes);
app.use("/api/admin/examen-final", gestionExamenFinalRoutes);
app.use("/api/alumno", alumnoRoutes);
app.use("/api/equivalencia", equivalenciasRoutes);

app.use(errorHandler);

module.exports = app;
