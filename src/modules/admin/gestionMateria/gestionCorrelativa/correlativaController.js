const {
  MateriaPlan,
  Correlativa,
  Materia,
  PlanEstudio,
} = require("../../../../models");

exports.registrarCorrelativa = async (req, res, next) => {
  const { materiaId, correlativaId } = req.body;

  try {
    const materia = await MateriaPlan.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    const correlativa = await MateriaPlan.findByPk(correlativaId);
    if (!correlativa) {
      return res.status(404).json({ error: "Correlativa no encontrada" });
    }

    await Correlativa.create({
      id_materia_plan: materia.id,
      id_materia_plan_correlativa: correlativa.id,
    });
    res.status(201).json({ message: "Correlativa registrada con éxito" });
  } catch (err) {
    next(err);
  }
};

exports.listarCorrelativas = async (req, res, next) => {
  try {
    const correlativas = await Correlativa.findAll({
      include: [
        {
          model: MateriaPlan,
          as: "materiaPrincipal",
          include: [
            { model: Materia, as: "materia" },
            { model: PlanEstudio, as: "planEstudio" },
          ],
        },
        {
          model: MateriaPlan,
          as: "materiaCorrelativa",
          include: [
            { model: Materia, as: "materia" },
            { model: PlanEstudio, as: "planEstudio" },
          ],
        },
      ],
    });
    res.status(200).json(correlativas);
  } catch (err) {
    next(err);
  }
};

exports.modificarCorrelativa = async (req, res, next) => {
  const { materiaId, correlativaId } = req.body;

  try {
    const materia = await MateriaPlan.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    const correlativa = await MateriaPlan.findByPk(correlativaId);
    if (!correlativa) {
      return res.status(404).json({ error: "Correlativa no encontrada" });
    }

    await Correlativa.update(
      { id_materia_plan_correlativa: correlativa.id },
      { where: { id_materia_plan: materia.id } }
    );
    res.status(200).json({ message: "Correlativa modificada con éxito" });
  } catch (err) {
    next(err);
  }
};

exports.eliminarCorrelativa = async (req, res, next) => {
  const { materiaId, correlativaId } = req.body;

  try {
    const materia = await MateriaPlan.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    const correlativa = await MateriaPlan.findByPk(correlativaId);
    if (!correlativa) {
      return res.status(404).json({ error: "Correlativa no encontrada" });
    }

    await Correlativa.destroy({
      where: {
        id_materia_plan: materia.id,
        id_materia_plan_correlativa: correlativa.id,
      },
    });
    res.status(200).json({ message: "Correlativa eliminada con éxito" });
  } catch (err) {
    next(err);
  }
};
