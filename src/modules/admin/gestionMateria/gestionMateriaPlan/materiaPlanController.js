const { Materia, MateriaPlan, PlanEstudio } = require("../../../../models");

exports.registrarMateriaPlan = async (req, res, next) => {
  const { planEstudioId } = req.params;
  const { idMateria, horasCatedra, duracion, anioCarrera } = req.body;

  try {
    const nuevaMateriaPlan = await MateriaPlan.create({
      id_materia: idMateria,
      id_plan_estudio: planEstudioId,
      horas_catedra: horasCatedra,
      duracion: duracion,
      anio_carrera: anioCarrera,
    });

    res.status(201).json(nuevaMateriaPlan);
  } catch (err) {
    next(err);
  }
};

exports.listarMateriasPlan = async (req, res, next) => {
  try {
    const materiasPlan = await MateriaPlan.findAll({
      include: [
        {
          model: Materia,
          as: "materia",
        },
        {
          model: PlanEstudio,
          as: "planEstudio",
        },
      ],
    });
    res.status(200).json(materiasPlan);
  } catch (err) {
    next(err);
  }
};

exports.modificarMateriaPlan = async (req, res, next) => {
  const { materiaPlanId } = req.params;
  const { horasCatedra, duracion, anioCarrera } = req.body;

  try {
    const materiaPlan = await MateriaPlan.findByPk(materiaPlanId);
    if (!materiaPlan) {
      return res.status(404).json({ error: "Materia del plan no encontrada" });
    }

    materiaPlan.horas_catedra = horasCatedra || materiaPlan.horas_catedra;
    materiaPlan.duracion = duracion || materiaPlan.duracion;
    materiaPlan.anio_carrera = anioCarrera || materiaPlan.anio_carrera;
    await materiaPlan.save();

    res.status(200).json(materiaPlan);
  } catch (err) {
    next(err);
  }
};
