const {
  Clase,
  ClaseProfesor,
  ClaseTema,
  Asistencia,
  Usuario,
  Persona,
  Tema,
  MateriaPlanCicloLectivo,
  InscripcionMateria,
  ProfesorMateria,
} = require("../../../models");

exports.detalleClase = async (req, res, next) => {
  const { claseId } = req.params;

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    // Obtener todos los alumnos inscriptos a la materia
    const inscripciones = await InscripcionMateria.findAll({
      where: {
        id_materia_plan_ciclo_lectivo: clase.id_materia_plan_ciclo_lectivo,
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          include: [{ model: Persona, as: "persona" }],
        },
      ],
    });

    // Obtener las asistencias registradas para esta clase
    const asistencias = await Asistencia.findAll({
      where: { id_clase: clase.id },
    });

    // Crear un mapa de asistencias por alumno
    const asistenciasMap = {};
    asistencias.forEach((a) => {
      asistenciasMap[a.id_usuario_alumno] = a.estado_asistencia;
    });

    const profesores = await ClaseProfesor.findAll({
      where: { id_clase: clase.id },
      include: [
        {
          model: Usuario,
          as: "Profesor",
          include: [
            { model: Persona, as: "persona" },
          ],
        },
      ],
    });

    const temas = await ClaseTema.findAll({
      where: { id_clase: clase.id },
      include: [{ model: Tema, as: "tema" }],
    });

    // Mapear todos los alumnos inscriptos con su estado de asistencia (si existe)
    const alumnos = inscripciones.map((inscripcion) => ({
      id_usuario: inscripcion.id_usuario_alumno,
      nombre: inscripcion.usuario?.persona?.nombre,
      apellido: inscripcion.usuario?.persona?.apellido,
      asistencia: asistenciasMap[inscripcion.id_usuario_alumno] || null,
    }));

    const detalle = {
      id: clase.id,
      fecha: clase.fecha,
      profesores: profesores.map((p) => ({
        nombre: p.Profesor?.persona?.nombre,
        apellido: p.Profesor?.persona?.apellido,
      })),
      alumnos,
      temas: temas.map((t) => t.tema?.descripcion).filter(Boolean),
    };

    res.json(detalle);
  } catch (err) {
    next(err);
  }
};
