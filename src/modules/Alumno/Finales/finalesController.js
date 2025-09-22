const {
  Usuario,
  AlumnoCarrera,
  InscripcionExamenFinal,
  ExamenFinal,
  HistorialExamenFinal,
  MateriaPlanCicloLectivo,
  MateriaPlan,
  Materia,
  Correlativa,
} = require("../../models");
const { Op } = require("sequelize");

// Obtener finales del alumno autenticado para una carrera
exports.getFinalesPorCarrera = async (req, res) => {
  try {
    const { idCarrera } = req.params;
    const idUsuario = req.user.id;

    // Obtener id_persona
    const alumno = await Usuario.findByPk(idUsuario, { attributes: ["id_persona"] });
    const idPersona = alumno?.id_persona;
    if (!idPersona) return res.status(404).json({ message: "Alumno no encontrado." });

    // Verificar inscripción en la carrera
    const inscripcion = await AlumnoCarrera.findOne({
      where: { id_persona: idPersona, id_carrera: idCarrera },
    });
    if (!inscripcion) return res.status(404).json({ message: "El alumno no está inscripto en esta carrera." });

    // 1. Finales aprobados (HistorialExamenFinal)
    const finalesAprobados = await HistorialExamenFinal.findAll({
      where: {
        id_usuario_alumno: idUsuario,
        nota: { [Op.gte]: 4 },
      },
      include: [
        {
          model: ExamenFinal,
          as: "examenfinal",
          include: [
            {
              model: MateriaPlanCicloLectivo,
              as: "ciclo",
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                  include: [
                    {
                      model: Materia,
                      as: "materia",
                      attributes: ["id", "nombre"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // 2. Finales inscriptos (InscripcionExamenFinal)
    const finalesInscriptos = await InscripcionExamenFinal.findAll({
      where: {
        id_usuario_alumno: idUsuario,
        estado: "INSCRIPTO",
      },
      include: [
        {
          model: ExamenFinal,
          as: "examenfinal",
          include: [
            {
              model: MateriaPlanCicloLectivo,
              as: "ciclo",
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                  include: [
                    {
                      model: Materia,
                      as: "materia",
                      attributes: ["id", "nombre"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // 3. Finales que puede rendir (por correlativas)
    // Traer todas las materias del plan de la carrera
    const materiasPlan = await MateriaPlan.findAll({
      where: { id_plan_estudio: inscripcion.id_plan_estudio },
      include: [
        {
          model: Materia,
          as: "materia",
          attributes: ["id", "nombre"],
        },
        {
          model: Correlativa,
          as: "correlativas",
        },
      ],
    });

    // IDs de materias aprobadas por final
    const idsMateriasAprobadas = finalesAprobados.map(
      (f) => f.examenfinal?.ciclo?.materiaPlan?.materia?.id
    );

    // Filtrar materias que puede rendir final (todas sus correlativas aprobadas)
    const finalesDisponibles = materiasPlan.filter((mp) => {
      if (!mp.correlativas || mp.correlativas.length === 0) return true;
      return mp.correlativas.every((corr) =>
        idsMateriasAprobadas.includes(corr.id_materia_correlativa)
      );
    });

    // Formatear respuesta
    return res.status(200).json({
      finalesAprobados: finalesAprobados.map((f) => ({
        id: f.examenfinal?.ciclo?.materiaPlan?.materia?.id,
        nombre: f.examenfinal?.ciclo?.materiaPlan?.materia?.nombre,
        nota: f.nota,
        fecha: f.fecha,
      })),
      finalesInscriptos: finalesInscriptos.map((f) => ({
        id: f.examenfinal?.ciclo?.materiaPlan?.materia?.id,
        nombre: f.examenfinal?.ciclo?.materiaPlan?.materia?.nombre,
        fecha: f.examenfinal?.fecha,
      })),
      finalesDisponibles: finalesDisponibles.map((mp) => ({
        id: mp.materia?.id,
        nombre: mp.materia?.nombre,
      })),
    });
  } catch (error) {
    console.error("Error al obtener los finales del alumno: ", error);
    return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
  }
};
