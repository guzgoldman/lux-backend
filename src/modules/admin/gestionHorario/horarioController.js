const { HorarioMateria, MateriaPlanCicloLectivo } = require('../../../models');

exports.registrarHorario = async (req, res, next) => {
  const { cicloLectivoId, aula, modalidad, diaSemana, bloque } = req.body;

  try {
    const ciclo = await MateriaPlanCicloLectivo.findByPk(cicloLectivoId);
    if (!ciclo) {
      return res.status(404).json({ error: 'Materia plan ciclo lectivo no encontrado' });
    }

    const horario = await HorarioMateria.create({
      id_materia_plan_ciclo_lectivo: ciclo.id,
      aula,
      modalidad,
      dia_semana: diaSemana,
      bloque
    });

    res.status(201).json(horario);
  } catch (err) {
    next(err);
  }
};