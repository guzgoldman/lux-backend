const {
  Usuario,
  Persona,
  InscripcionMateria,
  MateriaPlanCicloLectivo,
  Materia,
  HorarioMateria,
  Evaluacion,
  AlumnoCarrera,
  Carrera,
  PlanEstudio,
  ProfesorMateria,
  MateriaPlan,
} = require("../../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

// Obtener las carreras en las que se inscribió el alumno
exports.getCarrerasInscripto = async (req, res) => {
  try {
    const idAlumnoBuscado = req.user.id;
    const alumno = await Usuario.findByPk(idAlumnoBuscado, {
      attributes: ["id_persona"],
    });

    const idAlumno = alumno?.id_persona;
    const inscripciones = await AlumnoCarrera.findAll({
      where: { id_persona: idAlumno },
      include: [
        {
          model: Carrera,
          as: "carrera",
          attributes: ["id", "nombre"],
        },
      ],
    });

    // Extraer las carreras de las inscripciones
    const carreras = inscripciones.map((inscripcion) => inscripcion.carrera);

    if (!carreras.length) {
      return res.status(404).json({
        message: "El alumno no está inscripto en ninguna carrera.",
      });
    }

    res.status(200).json(carreras);
  } catch (error) {
    console.error("Error al obtener las carreras del alumno: ", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener las materias de un alumno para una carrera específica
exports.getMateriasPorCarrera = async (req, res) => {
  try {
    const { idCarrera } = req.params;
    const idAlumnoBuscado = req.user.id;

    // Obtener id_persona del usuario
    const alumno = await Usuario.findByPk(idAlumnoBuscado, {
      attributes: ["id_persona"],
    });
    const idAlumno = alumno?.id_persona;
    if (!idAlumno) {
      return res.status(404).json({ message: "Alumno no encontrado." });
    }

    // Verificar inscripción del alumno en la carrera
    const inscripcion = await AlumnoCarrera.findOne({
      where: {
        id_persona: idAlumno,
        id_carrera: idCarrera,
      },
    });
    if (!inscripcion) {
      return res.status(404).json({
        message: "El alumno no está inscripto en esta carrera.",
      });
    }

    // Traer todas las materias inscriptas o aprobadas del alumno para esa carrera
    const materiasInscriptas = await InscripcionMateria.findAll({
      where: {
        id_usuario_alumno: idAlumnoBuscado,
        estado: { [Op.in]: ["INSCRIPTO", "APROBADO"] },
      },
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          required: true,
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              required: true,
              include: [
                {
                  model: Materia,
                  as: "materia",
                  attributes: ["id", "nombre"],
                  required: true,
                },
              ],
            },
            {
              model: ProfesorMateria,
              as: "profesores",
              include: [
                {
                  model: Usuario,
                  as: "profesor",
                  include: [
                    {
                      model: Persona,
                      as: "persona",
                      attributes: ["nombre", "apellido"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Filtrar solo las materias que pertenecen a la carrera consultada
    const materiasFiltradas = materiasInscriptas.filter((item) =>
      item.ciclo?.materiaPlan?.id_plan_estudio // id_plan_estudio debe estar en MateriaPlan
    );

    // Mapear la respuesta
    const resumenMateriasAlumno = materiasFiltradas.map((item) => ({
      id: item.ciclo?.materiaPlan?.materia?.id ?? null,
      nombre: item.ciclo?.materiaPlan?.materia?.nombre ?? "",
      estado: item.estado,
      nota: item.nota_final,
      anio: item.ciclo?.anio ?? null,
      profesor: item.ciclo?.profesores?.length
        ? item.ciclo.profesores
            .map(
              (p) =>
                `${p.profesor?.persona?.nombre ?? ""} ${p.profesor?.persona?.apellido ?? ""}`
            )
            .join(", ")
        : "Sin profesor asignado",
    }));

    return res.status(200).json(resumenMateriasAlumno);
  } catch (error) {
    console.error("Error al obtener las materias del alumno: ", error);
    return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
  }
};
