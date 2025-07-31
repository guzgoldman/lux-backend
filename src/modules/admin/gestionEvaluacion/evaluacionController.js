const { Evaluacion, EvaluacionTipo, InscripcionMateria } = require('../../../models');

exports.registrarEvaluacion = async (req, res, next) => {
  const { inscripcionId, tipoId, nota } = req.body;

  try {
    const inscripcion = await InscripcionMateria.findByPk(inscripcionId);
    const tipo = await EvaluacionTipo.findByPk(tipoId);

    if (!inscripcion || !tipo) {
      return res.status(404).json({ error: 'Datos de inscripción o tipo inválidos' });
    }

    const evaluacion = await Evaluacion.create({
      id_inscripcion_materia: inscripcion.id,
      id_evaluacion_tipo: tipo.id,
      nota
    });

    res.status(201).json(evaluacion);
  } catch (err) {
    next(err);
  }
};