// src/models/index.js
const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

/* ---------- Imports de todos los modelos ---------- */
const personaModel                         = require('./persona');
const direccionModel                       = require('./direccion');
const historialDireccionModel              = require('./historial_direccion');
const usuarioModel                         = require('./usuario');
const rolModel                             = require('./rol');
const rolUsuarioModel                      = require('./rol_usuario');
const alumnoTipoModel                      = require('./alumno_tipo');
const preinscripcionModel                  = require('./preinscripcion');

const carreraModel                         = require('./carrera');
const planEstudioModel                     = require('./plan_estudio');
const materiaModel                         = require('./materia');
const materiaPlanModel                     = require('./materia_plan');
const materiaPlanCicloLectivoModel         = require('./materia_plan_ciclo_lectivo');
const correlativaModel                     = require('./correlativa');

const examenFinalModel                     = require('./examen_final');
const historialExamenFinalModel            = require('./historial_examen_final');
const profesorMateriaModel                 = require('./profesor_materia');

const alumnoCarreraModel                   = require('./alumno_carrera');
const inscripcionMateriaModel              = require('./inscripcion_materia');
const historialInscripcionMateriaModel     = require('./historial_inscripcion_materia');
const inscripcionExamenFinalModel          = require('./inscripcion_examen_final');
const historialInscripcionExamenFinalModel = require('./historial_inscripcion_examen_final');

const claseModel                           = require('./clase');
const claseProfesorModel                   = require('./clase_profesor');
const temaModel                            = require('./tema');
const claseTemaModel                       = require('./clase_tema');

const evaluacionTipoModel                  = require('./evaluacion_tipo');
const evaluacionModel                      = require('./evaluacion');

const asistenciaModel                      = require('./asistencia');
const historialAsistenciaModel             = require('./historial_asistencia');

const certificadoModel                     = require('./certificado');
const alertaModel                          = require('./alerta');

const asistenciaExamenFinalModel           = require('./asistencia_examen_final');
const historialAsistenciaExamenFinalModel  = require('./historial_asistencia_examen_final');

const horarioMateriaModel                  = require('./horario_materia');

/* ---------- Instanciación ---------- */
const Persona                         = personaModel(sequelize, DataTypes);
const Direccion                       = direccionModel(sequelize, DataTypes);
const HistorialDireccion              = historialDireccionModel(sequelize, DataTypes);
const Usuario                         = usuarioModel(sequelize, DataTypes);
const Rol                             = rolModel(sequelize, DataTypes);
const RolUsuario                      = rolUsuarioModel(sequelize, DataTypes);
const AlumnoTipo                      = alumnoTipoModel(sequelize, DataTypes);
const Preinscripcion                  = preinscripcionModel(sequelize, DataTypes);

const Carrera                         = carreraModel(sequelize, DataTypes);
const PlanEstudio                     = planEstudioModel(sequelize, DataTypes);
const Materia                         = materiaModel(sequelize, DataTypes);
const MateriaPlan                     = materiaPlanModel(sequelize, DataTypes);
const MateriaPlanCicloLectivo         = materiaPlanCicloLectivoModel(sequelize, DataTypes);
const Correlativa                     = correlativaModel(sequelize, DataTypes);

const ExamenFinal                     = examenFinalModel(sequelize, DataTypes);
const HistorialExamenFinal            = historialExamenFinalModel(sequelize, DataTypes);
const ProfesorMateria                 = profesorMateriaModel(sequelize, DataTypes);

const AlumnoCarrera                   = alumnoCarreraModel(sequelize, DataTypes);
const InscripcionMateria              = inscripcionMateriaModel(sequelize, DataTypes);
const HistorialInscripcionMateria     = historialInscripcionMateriaModel(sequelize, DataTypes);
const InscripcionExamenFinal          = inscripcionExamenFinalModel(sequelize, DataTypes);
const HistorialInscripcionExamenFinal = historialInscripcionExamenFinalModel(sequelize, DataTypes);

const Clase                           = claseModel(sequelize, DataTypes);
const ClaseProfesor                   = claseProfesorModel(sequelize, DataTypes);
const Tema                            = temaModel(sequelize, DataTypes);
const ClaseTema                       = claseTemaModel(sequelize, DataTypes);

const EvaluacionTipo                  = evaluacionTipoModel(sequelize, DataTypes);
const Evaluacion                      = evaluacionModel(sequelize, DataTypes);

const Asistencia                      = asistenciaModel(sequelize, DataTypes);
const HistorialAsistencia             = historialAsistenciaModel(sequelize, DataTypes);

const Certificado                     = certificadoModel(sequelize, DataTypes);
const Alerta                          = alertaModel(sequelize, DataTypes);

const AsistenciaExamenFinal           = asistenciaExamenFinalModel(sequelize, DataTypes);
const HistorialAsistenciaExamenFinal  = historialAsistenciaExamenFinalModel(sequelize, DataTypes);

const HorarioMateria                  = horarioMateriaModel(sequelize, DataTypes);

/* -------------------------------------------------------------------------- */
/*                          Definición de asociaciones                        */
/* -------------------------------------------------------------------------- */

/* ==== Usuario & Rol (N-a-N vía rol_usuario) ==== */
Usuario.belongsToMany(Rol, { through: RolUsuario, foreignKey: 'id_usuario', otherKey: 'id_rol',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Rol.belongsToMany(Usuario, { through: RolUsuario, foreignKey: 'id_rol', otherKey: 'id_usuario',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ---- Usuario / RolUsuario / Rol (asociaciones faltantes) ---- */
RolUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RolUsuario.belongsTo(Rol,     { foreignKey: 'id_rol',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Usuario.hasMany(RolUsuario,   { foreignKey: 'id_usuario',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Rol.hasMany(RolUsuario,       { foreignKey: 'id_rol',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ==== Persona / Usuario / AlumnoTipo ==== */
Usuario.belongsTo(Persona,      { foreignKey: 'id_persona' });

/* ---- Persona ↔ Usuario  ---- */
Persona.hasOne(Usuario,  { foreignKey: 'id_persona',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });   // 1 a 1   (lo habitual)

/* ==== Dirección & su historial ==== */
Direccion.belongsTo(Persona,    { foreignKey: 'id_persona',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Persona.hasMany(Direccion,      { foreignKey: 'id_persona' });

HistorialDireccion.belongsTo(Direccion, { foreignKey: 'id_direccion',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
HistorialDireccion.belongsTo(Usuario,   { foreignKey: 'realizado_por' });

/* ==== Carrera / PlanEstudio ==== */
PlanEstudio.belongsTo(Carrera, { foreignKey: 'id_carrera',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Carrera.hasMany(PlanEstudio,   { foreignKey: 'id_carrera' });

/* ==== Materia / MateriaPlan / MateriaPlanCicloLectivo ==== */
MateriaPlan.belongsTo(Materia,      { foreignKey: 'id_materia',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Materia.hasMany(MateriaPlan,        { foreignKey: 'id_materia' });

MateriaPlan.belongsTo(PlanEstudio,  { foreignKey: 'id_plan_estudio',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PlanEstudio.hasMany(MateriaPlan,    { foreignKey: 'id_plan_estudio' });

MateriaPlanCicloLectivo.belongsTo(MateriaPlan, { foreignKey: 'id_materia_plan',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
MateriaPlan.hasMany(MateriaPlanCicloLectivo,   { foreignKey: 'id_materia_plan' });

/* ==== Correlativas (N-a-N autodirigido) ==== */
MateriaPlan.belongsToMany(MateriaPlan, {
  through: Correlativa,
  as: 'Correlativas',              // qué materias necesita
  foreignKey: 'id_materia_plan',
  otherKey:  'id_materia_plan_correlativa',
  onDelete: 'CASCADE', onUpdate: 'CASCADE'
});

/* ==== ExamenFinal & su historial ==== */
ExamenFinal.belongsTo(MateriaPlanCicloLectivo, { foreignKey: 'id_materia_plan_ciclo_lectivo',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
MateriaPlanCicloLectivo.hasMany(ExamenFinal,   { foreignKey: 'id_materia_plan_ciclo_lectivo' });

ExamenFinal.belongsTo(Usuario, { as: 'Profesor', foreignKey: 'id_usuario_profesor',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

HistorialExamenFinal.belongsTo(ExamenFinal, { foreignKey: 'id_examen',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
HistorialExamenFinal.belongsTo(Usuario,     { foreignKey: 'realizado_por' });

/* ==== ProfesorMateria ==== */
ProfesorMateria.belongsTo(Usuario,               { foreignKey: 'id_usuario_profesor',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProfesorMateria.belongsTo(MateriaPlanCicloLectivo, { foreignKey: 'id_materia_plan_ciclo_lectivo',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ==== AlumnoCarrera ==== */
AlumnoCarrera.belongsTo(Persona, { foreignKey: 'id_persona',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
AlumnoCarrera.belongsTo(Carrera, { foreignKey: 'id_carrera',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
AlumnoCarrera.belongsTo(AlumnoTipo, { foreignKey: 'id_tipo_alumno',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ==== Inscripción a Materia & su historial ==== */
InscripcionMateria.belongsTo(Usuario,               { foreignKey: 'id_usuario_alumno',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
InscripcionMateria.belongsTo(MateriaPlanCicloLectivo,{ foreignKey: 'id_materia_plan_ciclo_lectivo',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

HistorialInscripcionMateria.belongsTo(Usuario,               { foreignKey: 'realizado_por' });
HistorialInscripcionMateria.belongsTo(InscripcionMateria, {
  foreignKey: ['id_usuario_alumno', 'id_materia_plan_ciclo_lectivo']  // clave compuesta
});

/* ==== Inscripción a Examen Final & su historial ==== */
InscripcionExamenFinal.belongsTo(Usuario,     { foreignKey: 'id_usuario_alumno',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
InscripcionExamenFinal.belongsTo(ExamenFinal,{ foreignKey: 'id_examen_final',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

HistorialInscripcionExamenFinal.belongsTo(Usuario, { foreignKey: 'realizado_por' });
HistorialInscripcionExamenFinal.belongsTo(InscripcionExamenFinal, {
  foreignKey: ['id_usuario_alumno', 'id_examen_final']
});

/* ==== Clases ==== */
Clase.belongsTo(MateriaPlanCicloLectivo, { foreignKey: 'id_materia_plan_ciclo_lectivo',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
MateriaPlanCicloLectivo.hasMany(Clase,  { foreignKey: 'id_materia_plan_ciclo_lectivo' });

/* ---- ClaseProfesor (N-a-N usuario profesor ↔ clase) ---- */
ClaseProfesor.belongsTo(Clase,   { foreignKey: 'id_clase',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ClaseProfesor.belongsTo(Usuario, { as: 'Profesor', foreignKey: 'id_usuario_profesor',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ---- ClaseTema ---- */
ClaseTema.belongsTo(Clase, { foreignKey: 'id_clase',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ClaseTema.belongsTo(Tema,  { foreignKey: 'id_tema',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ==== Evaluaciones ==== */
Evaluacion.belongsTo(InscripcionMateria, { foreignKey: 'id_inscripcion_materia',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Evaluacion.belongsTo(EvaluacionTipo,     { foreignKey: 'id_evaluacion_tipo' });

/* ==== Asistencias a clase & su historial ==== */
Asistencia.belongsTo(Clase,   { foreignKey: 'id_clase',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Asistencia.belongsTo(Usuario, { as: 'Alumno',   foreignKey: 'id_usuario_alumno',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Asistencia.belongsTo(Usuario, { as: 'Profesor', foreignKey: 'id_usuario_profesor_registro',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

HistorialAsistencia.belongsTo(Asistencia, { foreignKey: 'id_asistencia',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
HistorialAsistencia.belongsTo(Usuario,    { foreignKey: 'realizado_por' });

/* ==== Certificados ==== */
Certificado.belongsTo(Usuario, { foreignKey: 'id_usuario_alumno',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ==== Alertas ==== */
Alerta.belongsTo(Usuario, { as: 'Administrador', foreignKey: 'id_usuario_administrador',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

/* ==== Asistencia a examen final & su historial ==== */
AsistenciaExamenFinal.belongsTo(ExamenFinal, { foreignKey: 'id_examen_final',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
AsistenciaExamenFinal.belongsTo(Usuario, { as: 'Alumno', foreignKey: 'id_usuario_alumno',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
AsistenciaExamenFinal.belongsTo(Usuario, { as: 'ProfesorControl', foreignKey: 'id_usuario_profesor_control',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

HistorialAsistenciaExamenFinal.belongsTo(AsistenciaExamenFinal, { foreignKey: 'id_asistencia_examen_final',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
HistorialAsistenciaExamenFinal.belongsTo(Usuario, { foreignKey: 'realizado_por' });

/* ==== Horarios ==== */
HorarioMateria.belongsTo(MateriaPlanCicloLectivo, { foreignKey: 'id_materia_plan_ciclo_lectivo',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Preinscripcion.belongsTo(Persona, { foreignKey: 'id_persona',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Preinscripcion.belongsTo(Carrera, { foreignKey: 'id_carrera',
  onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Persona.hasMany(Preinscripcion, {
  foreignKey: 'id_persona',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

/* -------------------------------------------------------------------------- */
/*                            Exportación conjunta                            */
/* -------------------------------------------------------------------------- */
module.exports = {
  sequelize,                 // por si necesitás acceder desde otros módulos
  Persona, Direccion, HistorialDireccion,
  Usuario, Rol, RolUsuario, AlumnoTipo,
  Carrera, PlanEstudio, Materia, MateriaPlan, MateriaPlanCicloLectivo, Correlativa,
  ExamenFinal, HistorialExamenFinal, ProfesorMateria,
  AlumnoCarrera, InscripcionMateria, HistorialInscripcionMateria,
  InscripcionExamenFinal, HistorialInscripcionExamenFinal,
  Clase, ClaseProfesor, Tema, ClaseTema,
  EvaluacionTipo, Evaluacion,
  Asistencia, HistorialAsistencia,
  Certificado, Alerta,
  AsistenciaExamenFinal, HistorialAsistenciaExamenFinal,
  HorarioMateria, Preinscripcion
};
