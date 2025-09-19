const {
  Usuario,
  Persona,
  Direccion,
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
const bcrypt = require("bcrypt");

//Obtener las carreras en las que se inscribió el alumno
exports.getCarrerasInscripto = async (req, res) => {
  try {
    const idAlumnoBuscado = req.user.id;
    const alumno = await Usuario.findByPk(idAlumnoBuscado , {
      attributes: ["id_persona"]
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
      return res
        .status(404)
        .json({ message: "El alumno no está inscripto en ninguna carrera." });
    }

    res.status(200).json(carreras);
  } catch (error) {
    console.error("Error al obtener las carreras del alumno: ", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

//Obtener las materias de un alumno para una carrera especifica
exports.getMateriasPorCarrera = async (req, res) => {
  try {
    const { idCarrera } = req.params;
    const idAlumnoBuscado = req.user.id;

    const alumno = await Usuario.findByPk(idAlumnoBuscado, {
      attributes: ["id_persona"],
    });

    const idAlumno = alumno?.id_persona;

    const inscripcion = await AlumnoCarrera.findOne({
      where: {
        id_persona: idAlumno,
        id_carrera: idCarrera,
      },
    });

    if (!inscripcion) {
      return res
        .status(404)
        .json({ message: "El alumno no está inscripto en esta carrera." });
    }

    const planesEstudio = await PlanEstudio.findAll({
      where: { id_carrera: idCarrera },
      attributes: ["id"],
    });

    if (!planesEstudio || planesEstudio.length === 0) {
      return res.status(404).json({
        message: "No se encontró un plan de estudio para esta carrera.",
      });
    }

    const planEstudioIds = planesEstudio.map((plan) => plan.id);

    const materiasInscriptas = await InscripcionMateria.findAll({
        where: {
          id_usuario_alumno: idAlumnoBuscado,
        },
        include: [
          {
            model: MateriaPlanCicloLectivo,
            as: "ciclo",
            include: [
              {
                model: Materia,
                as: "materia",
                attributes: ["id", "nombre"],
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


    const resumenMateriasAlumno = materiasInscriptas.map((item) => ({
      id: item.ciclo.materia.id,
      nombre: item.ciclo.materia.nombre,
      estado: item.estado,
      nota: item.nota_final,
      profesor: item.ciclo.profesores
        ? item.ciclo.profesores
            .map((p) => `${p.profesor.persona.nombre} ${p.profesor.persona.apellido}`)
            .join(", ")
        : "Sin profesor asignado",
    }));
    
    return res.status(200).json(resumenMateriasAlumno);
  } catch (error) {
    console.error("Error al obtener las materias del alumno: ", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
