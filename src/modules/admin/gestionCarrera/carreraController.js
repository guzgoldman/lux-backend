const { Carrera, PlanEstudio } = require("../../../models/");

exports.registrarCarrera = async (req, res, next) => {
  const { nombre, duracion } = req.body;

  try {
    await Carrera.create({ nombre, duracion });
    res.status(201).json({ message: "Carrera registrada con éxito" });
  } catch (err) {
    next(err);
  }
};

exports.listarCarreras = async (req, res, next) => {
  try {
    const carreras = await Carrera.findAll({
      include: [
        {
          model: PlanEstudio,
          as: "planesEstudio",
          attributes: ["resolucion"],
          where: { vigente: 1 },
          required: false,
        },
      ],
    });
    res.status(200).json(carreras);
  } catch (err) {
    next(err);
  }
};

exports.modificarCarrera = async (req, res, next) => {
  const { carreraId } = req.params;
  const { nombre, duracion } = req.body;

  try {
    const carrera = await Carrera.findByPk(carreraId);
    if (!carrera) {
      return res.status(404).json({ error: "Carrera no encontrada" });
    }

    await carrera.update({ nombre, duracion });
    res.status(200).json({ message: "Carrera modificada con éxito" });
  } catch (err) {
    next(err);
  }
};
