const { Tema } = require('../../../models');

exports.registrarTema = async (req, res, next) => {
  const { descripcion } = req.body;

  try {
    const tema = await Tema.create({ descripcion });
    res.status(201).json(tema);
  } catch (err) {
    next(err);
  }
};