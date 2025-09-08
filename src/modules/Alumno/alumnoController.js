const {
  Evaluacion,
  CalificacionCuatrimestre,
  InscripcionMateria,
  AlumnoCarrera,
  AlumnoTipo,
  Asistencia,
  HorarioMateria,
  Materia,
  MateriaPlan,
  MateriaPlanCicloLectivo,
  Usuario,
  Carrera,
  PlanEstudio
} = require("../../models");

exports.obtenerMateriasInscripto = async (req, res, next) => {
  try {
    const idAlumno = req.params.id || req.user.id;

    const usuario = await Usuario.findByPk(idAlumno, {
      attributes: ["id", "username"],
      include: [
        {
          model: AlumnoCarrera,
          as: "carreras",
          attributes: ["fecha_inscripcion", "activo", "id_tipo_alumno"],
          include: [
            {
              model: Carrera,
              as: "carrera",
              attributes: ["id", "nombre"],
              include: [
                {
                  model: PlanEstudio,
                  as: "planesEstudio",
                  attributes: ["id", "resolucion", "vigente"],
                  where: { vigente: 1 },
                  include: [
                    {
                      model: MateriaPlan,
                      as: "materiaPlans",
                      attributes: ["id"],
                      include: [
                        {
                          model: Materia,
                          as: "materia",
                          attributes: ["id", "nombre"],
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Error al obtener materias inscripto:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};
