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
const gestionEvaluacionRoutes = require("../modules/admin/gestionEvaluacion/evaluacionRoutes");
const gestionTemaRoutes = require("../modules/admin/gestionTema/temaRoutes");
const gestionHorarioRoutes = require("../modules/admin/gestionHorario/horarioRoutes");
const gestionAsistenciaRoutes = require("../modules/admin/gestionAsistencia/asistenciaRoutes");
const errorHandler = require("../middlewares/errorHandler");
const gestionCarreraRoutes = require("../modules/admin/gestionCarrera/carreraRoutes");

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://192.168.56.1:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

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
app.use("/api/admin/evaluacion", gestionEvaluacionRoutes);
app.use("/api/admin/tema", gestionTemaRoutes);
app.use("/api/admin/horario", gestionHorarioRoutes);
app.use("/api/admin/asistencia", gestionAsistenciaRoutes);

app.use(errorHandler);

module.exports = app;
