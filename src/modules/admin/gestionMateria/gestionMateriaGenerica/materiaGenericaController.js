const { Materia } = require('../../../models');

exports.registrarMateriaGenerica = async (req, res, next) => {
  const { nombre } = req.body;

  try {
    const nuevaMateria = await Materia.create({ nombre });
    res.status(201).json(nuevaMateria);
  } catch (err) {
    next(err);
  }
}

exports.listarMateriasGenericas = async (req, res, next) => {
  try {
    const materias = await Materia.findAll();
    res.status(200).json(materias);
  } catch (err) {
    next(err);
  }
}

// Esta posiblemente no sea útil, ya que para mostrarla en un select como opción también necesito el ID que me da la función anterior.
exports.buscarMateriaPorNombre = async (req, res, next) => {
  const { nombre } = req.params;

  try {
    const materia = await Materia.findOne({ where: { nombre } });
    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.status(200).json(materia);
  } catch (err) {
    next(err);
  }
}

exports.modificarMateriaGenerica = async (req, res, next) => {
  const { materiaId } = req.params;
  const { nombre } = req.body;

  try {
    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    materia.nombre = nombre || materia.nombre;
    await materia.save();

    res.status(200).json(materia);
  } catch (err) {
    next(err);
  }
}